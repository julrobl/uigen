"use client";

import { ChangeEvent, FormEvent, KeyboardEvent } from "react";
import { Send } from "lucide-react";

interface MessageInputProps {
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export function MessageInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
}: MessageInputProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        form.requestSubmit();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative p-4 bg-zinc-900 border-t border-white/[0.08]">
      <div className="relative max-w-4xl mx-auto">
        <textarea
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Describe the component you want to build..."
          disabled={isLoading}
          className="w-full min-h-[80px] max-h-[200px] pl-4 pr-14 py-3.5 rounded-xl border border-white/[0.08] bg-zinc-800/60 text-zinc-100 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/40 focus:bg-zinc-800 transition-all placeholder:text-zinc-500 text-[15px] font-normal"
          rows={3}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="absolute right-3 bottom-3 p-2.5 rounded-lg transition-all hover:bg-violet-500/10 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent group"
        >
          <Send className={`h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${isLoading || !input.trim() ? 'text-zinc-600' : 'text-violet-400'}`} />
        </button>
      </div>
    </form>
  );
}