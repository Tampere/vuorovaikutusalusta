import { Box, CssBaseline } from '@mui/material';
import Image from '@tiptap/extension-image';
import { EditorContent, SetContentOptions, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { forwardRef, ReactElement, useImperativeHandle } from 'react';

import { MenuBar } from './MenuBar';
import './styles.css';
import React from 'react';
import { Markdown } from '@tiptap/markdown';

const extensions = [
  Markdown,
  StarterKit,
  Image.configure({
    HTMLAttributes: {
      style: 'max-width: 100%; height: auto;',
    },
  }),
];

interface Props {
  initialContent: string;
  renderFunctionButtons?: () => ReactElement;
  onChange: (content: string) => void;
}

export interface TextEditorRef {
  setContent: (content: string, options: SetContentOptions) => void;
}

export const TextEditor = forwardRef<TextEditorRef, Props>(
  ({ initialContent, renderFunctionButtons, onChange }, ref) => {
    const editor = useEditor({
      editable: true,
      extensions,
      content: initialContent,
      contentType: 'markdown',
      onUpdate: ({ editor }) => {
        onChange(editor.getMarkdown());
      },
    });

    useImperativeHandle(ref, () => ({
      setContent: (content, options) => {
        editor?.commands.setContent(content, options);
      },
    }));

    if (!editor) {
      return null;
    }

    return (
      <CssBaseline>
        <Box sx={{ border: 'solid 0.5px #c4c4c4', borderRadius: '4px' }}>
          <MenuBar editor={editor} />
          <EditorContent editor={editor} />
        </Box>
        {renderFunctionButtons?.()}
      </CssBaseline>
    );
  },
);

TextEditor.displayName = 'TextEditor';
