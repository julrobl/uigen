import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

function makePending(toolName: string, args: Record<string, any>) {
  return { toolCallId: "test", toolName, args, state: "call" as const };
}

function makeDone(toolName: string, args: Record<string, any>) {
  return { toolCallId: "test", toolName, args, state: "result" as const, result: "ok" };
}

test("str_replace_editor create shows Creating label", () => {
  render(<ToolInvocationBadge toolInvocation={makeDone("str_replace_editor", { command: "create", path: "/App.jsx" })} />);
  expect(screen.getByText("Creating /App.jsx")).toBeDefined();
});

test("str_replace_editor str_replace shows Editing label", () => {
  render(<ToolInvocationBadge toolInvocation={makeDone("str_replace_editor", { command: "str_replace", path: "/components/Button.jsx" })} />);
  expect(screen.getByText("Editing /components/Button.jsx")).toBeDefined();
});

test("str_replace_editor insert shows Editing label", () => {
  render(<ToolInvocationBadge toolInvocation={makeDone("str_replace_editor", { command: "insert", path: "/utils/helpers.ts" })} />);
  expect(screen.getByText("Editing /utils/helpers.ts")).toBeDefined();
});

test("str_replace_editor view shows Reading label", () => {
  render(<ToolInvocationBadge toolInvocation={makeDone("str_replace_editor", { command: "view", path: "/App.jsx" })} />);
  expect(screen.getByText("Reading /App.jsx")).toBeDefined();
});

test("str_replace_editor undo_edit shows Undoing edit label", () => {
  render(<ToolInvocationBadge toolInvocation={makeDone("str_replace_editor", { command: "undo_edit", path: "/App.jsx" })} />);
  expect(screen.getByText("Undoing edit in /App.jsx")).toBeDefined();
});

test("file_manager rename shows Renaming label", () => {
  render(<ToolInvocationBadge toolInvocation={makeDone("file_manager", { command: "rename", path: "/old.jsx", new_path: "/new.jsx" })} />);
  expect(screen.getByText("Renaming /old.jsx → /new.jsx")).toBeDefined();
});

test("file_manager delete shows Deleting label", () => {
  render(<ToolInvocationBadge toolInvocation={makeDone("file_manager", { command: "delete", path: "/App.jsx" })} />);
  expect(screen.getByText("Deleting /App.jsx")).toBeDefined();
});

test("unknown tool name falls back to tool name", () => {
  render(<ToolInvocationBadge toolInvocation={makeDone("some_other_tool", {})} />);
  expect(screen.getByText("some_other_tool")).toBeDefined();
});

test("pending state shows spinner not green dot", () => {
  const { container } = render(
    <ToolInvocationBadge toolInvocation={makePending("str_replace_editor", { command: "create", path: "/App.jsx" })} />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("done state shows green dot not spinner", () => {
  const { container } = render(
    <ToolInvocationBadge toolInvocation={makeDone("str_replace_editor", { command: "create", path: "/App.jsx" })} />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});
