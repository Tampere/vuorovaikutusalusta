import Image from '@tiptap/extension-image';
import { Markdown } from '@tiptap/markdown';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React, { useEffect } from 'react';

interface Props {
  content: string;
}

export function GeneralNotificationCard({ content }: Props) {
  const editor = useEditor({
    extensions: [
      Markdown,
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          style: 'max-width: 100%; height: auto;',
        },
      }),
    ],
    contentType: 'markdown',
    editable: false,
    content: content,
  });

  useEffect(() => {
    if (editor && editor.getMarkdown() !== content) {
      editor.commands.setContent(content, { contentType: 'markdown' });
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }
  return <EditorContent editor={editor} />;
}
