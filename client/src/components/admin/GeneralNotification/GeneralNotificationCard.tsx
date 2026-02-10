import { CssBaseline } from '@mui/material';
import { EditorContent, useEditor } from '@tiptap/react';
import React, { useEffect } from 'react';
import { textViewerConfig } from '../TextEditor/config';
import '../TextEditor/styles.css';

interface Props {
  content: string;
}

export function GeneralNotificationCard({ content }: Props) {
  const editor = useEditor({
    ...textViewerConfig,
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
  return (
    <CssBaseline>
      <EditorContent editor={editor} />
    </CssBaseline>
  );
}
