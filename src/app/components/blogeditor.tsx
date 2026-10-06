"use client";

import { useEffect } from "react";
import {
  EditorContent,
  useEditor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo2,
  Redo2,
  Minus,
} from "lucide-react";

interface BlogEditorProps {
  value: string;
  onChange: (content: string) => void;
}

export default function BlogEditor({
  value,
  onChange,
}: BlogEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],

    /*
     * Jangan gunakan value di sini.
     *
     * Saat pertama kali editor dibuat,
     * content dari API belum tentu tersedia.
     */
    content: "",

    /*
     * Dibutuhkan untuk penggunaan Tiptap
     * di Next.js Client Component.
     */
    immediatelyRender: false,

    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },

    editorProps: {
      attributes: {
        class:
          "prose prose-zinc max-w-none min-h-[350px] px-5 py-4 text-sm leading-7 text-black focus:outline-none",
      },
    },
  });

  /*
   * ========================================
   * Load content dari parent
   * ========================================
   *
   * Content datang secara asynchronous:
   *
   * API
   * ↓
   * EditBlogPage
   * ↓
   * setContent()
   * ↓
   * value berubah
   * ↓
   * effect ini dijalankan
   * ↓
   * Tiptap menampilkan HTML
   *
   */

  useEffect(() => {
    if (!editor) {
      return;
    }

    /*
     * Jangan setContent jika isinya
     * memang sudah sama.
     */
    if (value === editor.getHTML()) {
      return;
    }

    /*
     * Masukkan HTML dari file .txt
     * ke dalam Tiptap.
     *
     * emitUpdate: false
     * supaya setContent() tidak memanggil
     * onChange() lagi.
     */
    editor.commands.setContent(value, {
      emitUpdate: false,
    });
  }, [editor, value]);

  /*
   * Editor belum siap
   */
  if (!editor) {
    return (
      <div className="min-h-[350px] animate-pulse bg-zinc-50" />
    );
  }

  const buttonClass =
    "flex h-9 w-9 items-center justify-center rounded-md text-black transition hover:bg-zinc-100";

  const activeClass =
    "bg-zinc-100 text-amber-600";

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">

      {/* ========================================
          Toolbar
          ======================================== */}

      <div className="flex flex-wrap items-center gap-1 border-b border-zinc-200 p-2">

        {/* Bold */}
        <button
          type="button"
          title="Bold"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBold()
              .run()
          }
          className={`${buttonClass} ${
            editor.isActive("bold")
              ? activeClass
              : ""
          }`}
        >
          <Bold size={17} />
        </button>

        {/* Italic */}
        <button
          type="button"
          title="Italic"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleItalic()
              .run()
          }
          className={`${buttonClass} ${
            editor.isActive("italic")
              ? activeClass
              : ""
          }`}
        >
          <Italic size={17} />
        </button>

        <div className="mx-1 h-6 w-px bg-zinc-200" />

        {/* Heading 1 */}
        <button
          type="button"
          title="Heading 1"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({
                level: 1,
              })
              .run()
          }
          className={`${buttonClass} ${
            editor.isActive("heading", {
              level: 1,
            })
              ? activeClass
              : ""
          }`}
        >
          <Heading1 size={18} />
        </button>

        {/* Heading 2 */}
        <button
          type="button"
          title="Heading 2"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({
                level: 2,
              })
              .run()
          }
          className={`${buttonClass} ${
            editor.isActive("heading", {
              level: 2,
            })
              ? activeClass
              : ""
          }`}
        >
          <Heading2 size={18} />
        </button>

        {/* Heading 3 */}
        <button
          type="button"
          title="Heading 3"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({
                level: 3,
              })
              .run()
          }
          className={`${buttonClass} ${
            editor.isActive("heading", {
              level: 3,
            })
              ? activeClass
              : ""
          }`}
        >
          <Heading3 size={18} />
        </button>

        <div className="mx-1 h-6 w-px bg-zinc-200" />

        {/* Bullet List */}
        <button
          type="button"
          title="Bullet list"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBulletList()
              .run()
          }
          className={`${buttonClass} ${
            editor.isActive("bulletList")
              ? activeClass
              : ""
          }`}
        >
          <List size={18} />
        </button>

        {/* Numbered List */}
        <button
          type="button"
          title="Numbered list"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleOrderedList()
              .run()
          }
          className={`${buttonClass} ${
            editor.isActive("orderedList")
              ? activeClass
              : ""
          }`}
        >
          <ListOrdered size={18} />
        </button>

        {/* Blockquote */}
        <button
          type="button"
          title="Blockquote"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBlockquote()
              .run()
          }
          className={`${buttonClass} ${
            editor.isActive("blockquote")
              ? activeClass
              : ""
          }`}
        >
          <Quote size={17} />
        </button>

        {/* Code Block */}
        <button
          type="button"
          title="Code block"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleCodeBlock()
              .run()
          }
          className={`${buttonClass} ${
            editor.isActive("codeBlock")
              ? activeClass
              : ""
          }`}
        >
          <Code size={17} />
        </button>

        {/* Horizontal Line */}
        <button
          type="button"
          title="Horizontal line"
          onClick={() =>
            editor
              .chain()
              .focus()
              .setHorizontalRule()
              .run()
          }
          className={buttonClass}
        >
          <Minus size={18} />
        </button>

        <div className="mx-1 h-6 w-px bg-zinc-200" />

        {/* Undo */}
        <button
          type="button"
          title="Undo"
          disabled={!editor.can().undo()}
          onClick={() =>
            editor
              .chain()
              .focus()
              .undo()
              .run()
          }
          className={`${buttonClass} disabled:cursor-not-allowed disabled:opacity-30`}
        >
          <Undo2 size={17} />
        </button>

        {/* Redo */}
        <button
          type="button"
          title="Redo"
          disabled={!editor.can().redo()}
          onClick={() =>
            editor
              .chain()
              .focus()
              .redo()
              .run()
          }
          className={`${buttonClass} disabled:cursor-not-allowed disabled:opacity-30`}
        >
          <Redo2 size={17} />
        </button>
      </div>

      {/* ========================================
          Editor Content
          ======================================== */}

      <EditorContent
        editor={editor}
        className="text-black"
      />

      {/* ========================================
          Footer
          ======================================== */}

      <div className="border-t border-zinc-100 px-5 py-2">
        <p className="text-xs text-zinc-400">
          Write your article and use the toolbar
          to format the content.
        </p>
      </div>
    </div>
  );
}