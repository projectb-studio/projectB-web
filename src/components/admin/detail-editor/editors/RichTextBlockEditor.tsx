"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useEffect } from "react";
import type { Block } from "../types";
import RichTextToolbar from "./RichTextToolbar";

type B = Extract<Block, { type: "richtext" }>;

export default function RichTextBlockEditor({
  block,
  onChange,
}: {
  block: B;
  onChange: (b: B) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener" } }),
    ],
    content: block.data.html,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange({ ...block, data: { html: editor.getHTML() } });
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[120px] focus:outline-none p-3",
      },
    },
  });

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  return (
    <div className="border border-[var(--pb-light-gray)]">
      <RichTextToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
