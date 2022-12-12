import { FormLabel } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { useTranslations } from '@src/stores/TranslationContext';
import { convertFromRaw, convertToRaw, EditorState } from 'draft-js';
import { draftToMarkdown, markdownToDraft } from 'markdown-draft-js';
import React, { useEffect, useState } from 'react';
import { Editor } from 'react-draft-wysiwyg';

const useStyles = makeStyles({
  root: {
    position: 'relative',
  },
  disabled: {
    opacity: 0.4,
    pointerEvents: 'none',
  },
  disabledOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 4,
    opacity: 0.4,
    background: '#ddd',
  },
  wrapper: {
    border: '1px solid transparent',
  },
  missingValue: {
    border: '1px solid red',
  },
  editor: {
    height: (props: { editorHeight?: string }) => props.editorHeight,
    background: '#fff',
    padding: '0 1rem',
    border: '1px solid #ccc',
    borderTop: 'none',
    borderRadius: 0,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    '& .rdw-link-decorator-icon': {
      top: '-50%',
    },
  },
  toolbar: {
    padding: 0,
    background: '#f4f4f4',
    marginBottom: 0,
    borderRadius: 0,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    border: '1px solid #ccc',
    '& > *': {
      marginBottom: 0,
    },
    '& .rdw-option-wrapper': {
      border: 'none',
      boxShadow: 'none',
      margin: 0,
      padding: 8,
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
});

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
    markdownToEditorState(props.value)
  );

  const { language, surveyLanguage } = useTranslations();

  useEffect(
    () => setEditorState(markdownToEditorState(props.value)),
    [language, surveyLanguage]
  );

  const classes = useStyles(props);
  const { tr } = useTranslations();

  function handleEditorStateChange(editorState: EditorState) {
    if (props.disabled) {
      return;
    }
    setEditorState(editorState);
    props.onChange(editorStateToMarkdown(editorState));
  }

  return (
    <div className={classes.root}>
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
        } ${classes.wrapper}`}
        editorClassName={classes.editor}
        toolbarClassName={classes.toolbar}
        localization={{ translations: tr.RichTextEditor }}
        editorState={editorState}
        onEditorStateChange={handleEditorStateChange}
      />
      {props.disabled && <div className={classes.disabledOverlay} />}
    </div>
  );
}
