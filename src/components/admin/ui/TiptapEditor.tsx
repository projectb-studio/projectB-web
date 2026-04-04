"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  ImageIcon,
  Heading2,
  Undo,
  Redo,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallback } from "react";

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function TiptapEditor({ content, onChange, placeholder }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension,
      LinkExtension.configure({ openOnClick: false }),
    ],
    content,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none px-4 py-3 min-h-[300px] focus:outline-none",
      },
    },
  });

  const addImage = useCallback(() => {
    const url = prompt("이미지 URL을 입력하세요:");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addLink = useCallback(() => {
    const url = prompt("링크 URL을 입력하세요:");
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  const btnClass = "p-1.5 hover:bg-[var(--pb-off-white)] transition-colors";
  const activeClass = "bg-[var(--pb-off-white)] text-[var(--pb-jet-black)]";

  return (
    <div className="border border-[var(--pb-light-gray)] bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-[var(--pb-light-gray)] flex-wrap">
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={cn(btnClass, editor.isActive("heading", { level: 2 }) && activeClass)}>
          <Heading2 size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={cn(btnClass, editor.isActive("bold") && activeClass)}>
          <Bold size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={cn(btnClass, editor.isActive("italic") && activeClass)}>
          <Italic size={16} />
        </button>
        <div className="w-px h-5 bg-[var(--pb-light-gray)] mx-1" />
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={cn(btnClass, editor.isActive("bulletList") && activeClass)}>
          <List size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={cn(btnClass, editor.isActive("orderedList") && activeClass)}>
          <ListOrdered size={16} />
        </button>
        <div className="w-px h-5 bg-[var(--pb-light-gray)] mx-1" />
        <button type="button" onClick={addLink} className={cn(btnClass, editor.isActive("link") && activeClass)}>
          <LinkIcon size={16} />
        </button>
        <button type="button" onClick={addImage} className={btnClass}>
          <ImageIcon size={16} />
        </button>
        <div className="w-px h-5 bg-[var(--pb-light-gray)] mx-1" />
        <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className={cn(btnClass, "disabled:opacity-30")}>
          <Undo size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className={cn(btnClass, "disabled:opacity-30")}>
          <Redo size={16} />
        </button>
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  );
}
