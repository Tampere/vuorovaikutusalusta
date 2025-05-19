import { Box, CircularProgress, FormLabel } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useTranslations } from '@src/stores/TranslationContext';
import { convertToRaw, EditorState } from 'draft-js';
import { Remarkable } from 'remarkable';
import { draftToMarkdown } from 'markdown-draft-js';
import { convertFromHTML } from 'draft-convert';

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { Editor } from 'react-draft-wysiwyg';

const useStyles = makeStyles({
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
    '& .rdw-fontsize-wrapper': {
      background: 'white',
      margin: 0,
      border: 'none',
      '&:hover': {
        background: '#aaa',
      },
      '& .rdw-dropdown-wrapper:hover': {
        boxShadow: 'none',
        background: '#aaa',
      },
      '& .rdw-dropdown-selectedtext': {
        width: '35px',
      },
    },
  },
});

const DEFAULT_FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60];

interface Props {
  value: string;
  disabled?: boolean;
  label?: string;
  onChange: (value: string) => void;
  editorHeight?: string;
  missingValue?: boolean;
  toolbarOptions?: Record<string, any>;
}

/**
 * Converts given markdown to a new Draft.js editor state.
 * @param markdown Text as markdown
 * @returns Draft.js editor state
 */
export function markdownToEditorState(markdown: string): EditorState {
  // Step 1: Markdown → HTML
  const md = new Remarkable('commonmark', {
    html: true,
    breaks: true, // Enable line breaks
  });
  let html = md.render(markdown);

  // Remove any space or &nbsp; immediately after <br> or <br />
  html = html.replace(/(<br\s*\/?>)\s+/gi, '$1');

  // Step 2: HTML → ContentState using draft-convert with custom inline style parsing
  const contentState = convertFromHTML({
    htmlToStyle: (nodeName, node, currentStyle) => {
      if (nodeName === 'span' && node instanceof HTMLElement) {
        const fontSize = node.style.fontSize?.replace(/[^0-9]/g, '');
        if (fontSize) {
          return currentStyle.add(`fontsize-${fontSize}`);
        }
      }
      return currentStyle;
    },
  })(html);

  return EditorState.createWithContent(contentState);
}

/**
 * Converts given Draft.js editor state to markdown.
 * @param editorState Draft.js editor state
 * @returns Text as markdown
 */
function editorStateToMarkdown(
  editorState: EditorState,
  enabledFontSizes: number[] = DEFAULT_FONT_SIZES,
) {
  const content = editorState.getCurrentContent();
  const rawObject = convertToRaw(content);

  const fontSizeStyles = Object.fromEntries(
    enabledFontSizes.map((size) => [
      `fontsize-${size}`,
      {
        open: () => `<span style="font-size:${size}px">`,
        close: () => '</span>',
      },
    ]),
  );

  return draftToMarkdown(rawObject, {
    styleItems: fontSizeStyles,
    preserveNewlines: true,
  });
}

const RichTextEditor = forwardRef(function RichTextEditor(props: Props, ref) {
  const [editorState, setEditorState] = useState(
    markdownToEditorState(props.value),
  );

  useImperativeHandle(
    ref,
    () => ({
      setEditorValue: (value: string) =>
        setEditorState(markdownToEditorState(value)),
    }),
    [],
  );

  const { language, surveyLanguage } = useTranslations();

  useEffect(
    () => setEditorState(markdownToEditorState(props.value)),
    [language, surveyLanguage],
  );

  const classes = useStyles(props);
  const { tr } = useTranslations();

  function handleEditorStateChange(editorState: EditorState) {
    if (props.disabled) {
      return;
    }
    setEditorState(editorState);
    props.onChange(
      editorStateToMarkdown(
        editorState,
        props.toolbarOptions?.fontSize?.options,
      ),
    );
  }

  return (
    <Box
      sx={{
        position: 'relative',
      }}
    >
      {props.label && <FormLabel>{props.label}</FormLabel>}
      <Editor
        {...(props.label && { ariaLabel: props.label })}
        readOnly={props.disabled}
        toolbar={
          props.toolbarOptions ?? {
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
          }
        }
        wrapperClassName={`${props.missingValue ? classes.missingValue : ''} ${
          props.disabled ? ` ${classes.disabled}` : ''
        } ${classes.wrapper}`}
        editorClassName={classes.editor}
        toolbarClassName={classes.toolbar}
        localization={{ translations: tr.RichTextEditor }}
        editorState={editorState}
        onEditorStateChange={handleEditorStateChange}
        customStyleMap={{
          'fontsize-24': {
            fontSize: '24px',
          },
          'fontsize-20': {
            fontSize: '20px',
          },
        }}
      />
      {props.disabled && <div className={classes.disabledOverlay} />}
    </Box>
  );
});

export default RichTextEditor;
