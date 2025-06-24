import { Box, FormLabel } from '@mui/material';

import { useTranslations } from '@src/stores/TranslationContext';
import { convertFromRaw, convertToRaw, EditorState } from 'draft-js';
import { draftToMarkdown, markdownToDraft } from 'markdown-draft-js';
import React, { useEffect, useState } from 'react';
import { Editor } from 'react-draft-wysiwyg';

const styles = (editorHeight?: string) => ({
  root: {
    position: 'relative',
    '& .rdw-editor-wrapper': {
      border: '1px solid transparent',
    },
    '& .rdw-editor-disabled': {
      opacity: 0.4,
      pointerEvents: 'none',
    },
    '& .rdw-editor-missing-value': {
      border: '1px solid red',
    },
    '& .rdw-editor-main': {
      height: editorHeight,
      background: '#fff',
      padding: '0 1rem',
      border: '1px solid #ccc',
      borderTop: 'none',
      borderRadius: 0,
      borderBottomLeftRadius: '4px',
      borderBottomRightRadius: '4px',
      '& .rdw-link-decorator-icon': {
        top: '-50%',
      },
    },
    '& .rdw-editor-toolbar': {
      padding: 0,
      background: '#f4f4f4',
      marginBottom: 0,
      borderRadius: 0,
      borderTopLeftRadius: '4px',
      borderTopRightRadius: '4px',
      border: '1px solid #ccc',
      '& > *': {
        marginBottom: 0,
      },
      '& .rdw-option-wrapper': {
        border: 'none',
        boxShadow: 'none',
        margin: 0,
        padding: '8px',
        borderRadius: 0,
        '&:hover': {
          background: '#aaa',
        },
      },
      '& .rdw-option-active': {
        background: '#bbb',
        boxShadow: 'none',
      },
      '& .rdw-option-disabled': {
        pointerEvents: 'none',
      },
    },
  },
  disabledOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '4px',
    opacity: 0.4,
    background: '#ddd',
  },
});

const classes = {
  wrapper: 'rdw-editor-wrapper',
  missingValue: 'rdw-editor-missing-value',
  disabled: 'rdw-editor-disabled',
};

interface Props {
  value: string;
  disabled?: boolean;
  label?: string;
  onChange: (value: string) => void;
  editorHeight?: string;
  missingValue?: boolean;
}

/**
 * Converts given markdown to a new Draft.js editor state.
 * @param markdown Text as markdown
 * @returns Draft.js editor state
 */
function markdownToEditorState(markdown: string) {
  const rawData = markdownToDraft(markdown);
  const contentState = convertFromRaw(rawData);
  return EditorState.createWithContent(contentState);
}

/**
 * Converts given Draft.js editor state to markdown.
 * @param editorState Draft.js editor state
 * @returns Text as markdown
 */
function editorStateToMarkdown(editorState: EditorState) {
  const content = editorState.getCurrentContent();
  const rawObject = convertToRaw(content);
  return draftToMarkdown(rawObject);
}

export default function RichTextEditor(props: Props) {
  const [editorState, setEditorState] = useState(
    markdownToEditorState(props.value),
  );

  const { language, surveyLanguage } = useTranslations();

  useEffect(
    () => setEditorState(markdownToEditorState(props.value)),
    [language, surveyLanguage],
  );

  const { tr } = useTranslations();

  function handleEditorStateChange(editorState: EditorState) {
    if (props.disabled) {
      return;
    }
    setEditorState(editorState);
    props.onChange(editorStateToMarkdown(editorState));
  }

  return (
    <Box sx={styles(props.editorHeight).root}>
      {props.label && <FormLabel>{props.label}</FormLabel>}
      <Editor
        readOnly={props.disabled}
        toolbar={{
          options: ['inline', 'list', 'link'],
          inline: {
            options: ['bold', 'italic'],
          },
          list: {
            options: ['unordered', 'ordered'],
          },
          link: {
            defaultTargetOption: '_blank',
          },
        }}
        wrapperClassName={`${props.missingValue ? classes.missingValue : ''} ${
          props.disabled ? ` ${classes.disabled}` : ''
        }`}
        localization={{ translations: tr.RichTextEditor }}
        editorState={editorState}
        onEditorStateChange={handleEditorStateChange}
      />
      {props.disabled && (
        <Box sx={styles(props.editorHeight).disabledOverlay} />
      )}
    </Box>
  );
}
