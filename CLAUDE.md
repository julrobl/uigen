# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Code Style

Use comments sparingly. Only comment complex code where the reasoning isn't obvious from the code itself.

## Commands

```bash
npm run setup        # Install deps, generate Prisma client, run DB migrations (first-time setup)
npm run dev          # Start dev server on http://localhost:3000 (Turbopack)
npm run build        # Production build
npm run lint         # ESLint
npm test             # Run all tests (Vitest)
npx vitest run src/path/to/file.test.ts  # Run a single test file
npm run db:reset     # Drop and re-run all Prisma migrations (destructive)
```

Add `ANTHROPIC_API_KEY` to `.env` to use the real Claude API. Without it, a `MockLanguageModel` in `src/lib/provider.ts` returns static responses.

## Architecture

### Virtual File System

The core abstraction is `VirtualFileSystem` (`src/lib/file-system.ts`) — an in-memory tree of files and directories. No user-generated files ever touch disk. The VFS is serialized to JSON and stored in the `Project.data` column in SQLite. `FileSystemContext` (`src/lib/contexts/file-system-context.tsx`) wraps the VFS in React state and exposes the `handleToolCall` callback that the AI SDK calls when the model invokes a tool.

### AI Tool Loop

`/api/chat` (`src/app/api/chat/route.ts`) receives the current VFS state and chat messages, reconstructs a `VirtualFileSystem` server-side, and runs `streamText` (Vercel AI SDK) with two tools:

- `str_replace_editor` — create, str_replace, insert operations on VFS files
- `file_manager` — rename and delete operations

On stream completion, if the user is authenticated and a `projectId` was supplied, the updated messages and VFS data are persisted to the `Project` row.

The AI system prompt mandates that every project has `/App.jsx` as the entry point with a default export, that all inter-file imports use the `@/` alias (which maps to the VFS root `/`), and that styling is done with Tailwind CSS.

### Live Preview

`PreviewFrame` (`src/components/preview/PreviewFrame.tsx`) renders an `<iframe srcdoc>` that updates on every VFS change. The pipeline:

1. `createImportMap` (`src/lib/transform/jsx-transformer.ts`) iterates all VFS files, transpiles each `.jsx`/`.tsx` file with `@babel/standalone`, converts each to a blob URL, and builds a JSON import map. Third-party packages fall through to `esm.sh`.
2. `createPreviewHTML` wraps the import map and entry-point blob URL into an HTML document that uses `ReactDOM.createRoot`. Tailwind is loaded from CDN (`cdn.tailwindcss.com`).
3. Build/syntax errors from Babel are surfaced inline in the preview iframe.

### Auth

JWT-based sessions using `jose`, stored in an HTTP-only `auth-token` cookie. `src/lib/auth.ts` is server-only. Middleware (`src/middleware.ts`) validates sessions on protected routes. Passwords are hashed with `bcrypt`.

### Data Model

The database schema is defined in `prisma/schema.prisma`. Reference it anytime you need to understand the structure of data stored in the database.

Two Prisma models (SQLite):
- `User` — email + hashed password
- `Project` — belongs to an optional `User`; stores `messages` (Vercel AI SDK message array as JSON string) and `data` (serialized VFS `Record<string, FileNode>` as JSON string)

### Anonymous Work Tracking

`src/lib/anon-work-tracker.ts` saves in-progress work to `localStorage` for anonymous sessions. When the user signs up or signs in, the stored messages and VFS data are migrated to the newly created project.

### Context Providers

- `FileSystemProvider` — owns the `VirtualFileSystem` instance and exposes file CRUD + `handleToolCall`
- `ChatProvider` — wraps Vercel AI SDK `useChat`, passes VFS state to the API, and wires `onToolCall` to `handleToolCall`

These are composed in `src/app/main-content.tsx` and `src/app/[projectId]/page.tsx`.

## Key Constraints

- The `@/` import alias in generated components resolves to the VFS root `/`, not `src/`. Do not conflate it with the Next.js project's own `@/` alias (which maps to `src/`).
- `src/lib/auth.ts` has `import "server-only"` — never import it in client components.
- Prisma client is generated to `src/generated/prisma` (not the default location).
- The preview iframe uses `sandbox="allow-scripts allow-same-origin allow-forms"` — this is required for blob URL import maps to function.
