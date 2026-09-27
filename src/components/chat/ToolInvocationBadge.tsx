"use client";

import { Loader2 } from "lucide-react";
import type { ToolInvocation } from "ai";

interface Props {
  toolInvocation: ToolInvocation;
}

function getLabel(toolName: string, args: Record<string, any>): string {
  if (toolName === "str_replace_editor") {
    const { command, path } = args;
    switch (command) {
      case "create":     return `Creating ${path}`;
      case "str_replace": return `Editing ${path}`;
      case "insert":     return `Editing ${path}`;
      case "view":       return `Reading ${path}`;
      case "undo_edit":  return `Undoing edit in ${path}`;
    }
  }

  if (toolName === "file_manager") {
    const { command, path, new_path } = args;
    switch (command) {
      case "rename": return `Renaming ${path} → ${new_path}`;
      case "delete": return `Deleting ${path}`;
    }
  }

  return toolName;
}

export function ToolInvocationBadge({ toolInvocation }: Props) {
  const { toolName, args, state } = toolInvocation;
  const label = getLabel(toolName, args as Record<string, any>);
  const isDone = state === "result" && (toolInvocation as any).result;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-neutral-700">{label}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{label}</span>
        </>
      )}
    </div>
  );
}
