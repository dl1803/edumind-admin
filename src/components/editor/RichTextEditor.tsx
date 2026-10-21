"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  TextB,
  TextItalic,
  TextH,
  ListBullets,
  ListNumbers,
  Code,
} from "@phosphor-icons/react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  error?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  error,
}) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "tiptap-content min-h-[160px] p-3.5 text-xs text-neutral-800 focus:outline-none font-sans leading-relaxed",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="space-y-1">
      <div
        className={`border rounded-xl overflow-hidden bg-neutral-50 transition ${
          error
            ? "border-red-400 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100"
            : "border-neutral-200 focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-500/20"
        }`}
      >
        <div className="px-3 py-2 bg-neutral-100/70 border-b border-neutral-200 flex items-center gap-2 text-xs text-neutral-600 flex-wrap">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`font-bold p-1 rounded transition flex items-center gap-1 ${
              editor.isActive("bold")
                ? "bg-purple-200 text-purple-900"
                : "hover:bg-neutral-200/60 hover:text-purple-700"
            }`}
            title="In đậm (Bold)"
          >
            <TextB size={16} weight="bold" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1 rounded transition flex items-center gap-1 ${
              editor.isActive("italic")
                ? "bg-purple-200 text-purple-900"
                : "hover:bg-neutral-200/60 hover:text-purple-700"
            }`}
            title="In nghiêng (Italic)"
          >
            <TextItalic size={16} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1 rounded font-bold transition flex items-center gap-1 ${
              editor.isActive("heading", { level: 3 })
                ? "bg-purple-200 text-purple-900"
                : "hover:bg-neutral-200/60 hover:text-purple-700"
            }`}
            title="Tiêu đề (H3)"
          >
            <TextH size={16} />
          </button>
          <span className="text-neutral-300">|</span>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1 rounded transition flex items-center gap-1 ${
              editor.isActive("bulletList")
                ? "bg-purple-200 text-purple-900"
                : "hover:bg-neutral-200/60 hover:text-purple-700"
            }`}
            title="Danh sách đầu dòng"
          >
            <ListBullets size={16} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1 rounded transition flex items-center gap-1 ${
              editor.isActive("orderedList")
                ? "bg-purple-200 text-purple-900"
                : "hover:bg-neutral-200/60 hover:text-purple-700"
            }`}
            title="Danh sách số"
          >
            <ListNumbers size={16} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-1 rounded font-mono text-[11px] transition flex items-center gap-1 ${
              editor.isActive("codeBlock")
                ? "bg-purple-200 text-purple-900"
                : "hover:bg-neutral-200/60 hover:text-purple-700"
            }`}
            title="Khối mã nguồn"
          >
            <Code size={16} />
          </button>
        </div>

        <EditorContent editor={editor} />
      </div>

      {error && <p className="text-[11px] text-red-500 font-medium pl-1">{error}</p>}
    </div>
  );
};
