import { SetContentOptions } from '@tiptap/react';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { TextEditor, TextEditorRef } from '../TextEditor';

interface Props {
  initialValue: string;
  onChange: (value: string) => void;
}

export interface GeneralNotificationTextEditorRef {
  setContent: (content: string, options: SetContentOptions) => void;
}

export const GeneralNotificationTextEditor = forwardRef<
  GeneralNotificationTextEditorRef,
  Props
>(({ initialValue, onChange }, ref) => {
  const editorRef = useRef<TextEditorRef>(null);
  useImperativeHandle(ref, () => ({
    setContent: (content, options) => {
      editorRef.current?.setContent(content, options);
    },
  }));

  return (
    <TextEditor
      ref={editorRef}
      onChange={onChange}
      initialContent={initialValue}
    />
  );
});

GeneralNotificationTextEditor.displayName = 'GeneralNotificationTextEditor';
