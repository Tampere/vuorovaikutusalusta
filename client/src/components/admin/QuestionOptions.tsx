import { SectionOption } from '@interfaces/survey';
import {
  Fab,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { Add, Delete, DragIndicator } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { createRef, useEffect, useMemo } from 'react';
import OptionInfoDialog from './OptionInfoDialog';

const useStyles = makeStyles({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
  },
  option: {
    alignItems: 'center',
    background: 'rgba(0,0,0,0.2)',
    padding: '1rem 0.5rem',
    boxSizing: 'border-box',
  },
  textInput: {
    flexGrow: 1,
  },
});

interface Props {
  options: SectionOption[];
  disabled?: boolean;
  onChange: (options: SectionOption[]) => void;
  title: string;
  enableClipboardImport?: boolean;
  allowOptionInfo?: boolean;
}

export default function QuestionOptions({
  options,
  disabled,
  onChange,
  title,
  enableClipboardImport = false,
  allowOptionInfo = false,
}: Props) {
  const classes = useStyles();
  const { tr } = useTranslations();

  // Array of references to the option input elements
  const inputRefs = useMemo(
    () =>
      Array(options.length)
        .fill(null)
        .map(() => createRef<HTMLInputElement>()),
    [options.length]
  );

  // Whenever input element count changes, focus on the last one
  useEffect(() => {
    const lastElement = inputRefs[inputRefs.length - 1]?.current;
    lastElement?.focus();
  }, [inputRefs.length]);

  function handleClipboardInput(optionValue: string, optionIndex: number) {
    const clipboardRows = optionValue.split(/(?!\B"[^"]*)\n(?![^"]*"\B)/);
    const optionFields = clipboardRows
      .map((row: string): { text: string; info?: string } => {
        const optionFields = row.split('\t');
        if (![1, 2].includes(optionFields.length) || optionFields[0] === '')
          return null;
        return {
          text: optionFields[0],
          ...(allowOptionInfo ? { info: optionFields?.[1] ?? '' } : {}),
        };
      })
      .filter((option) => option);

    if (!optionFields || !optionFields.length) return;
    // First add option for the empty option field where focus is currently
    const updatedOptions = options.map((option, i) =>
      optionIndex === i ? optionFields[0] : option
    );
    // Add other fields
    const newOptions = optionFields.slice(1, optionFields.length);
    onChange([...updatedOptions, ...newOptions]);
  }

  return (
    <div className={classes.wrapper}>
      <div className={classes.row}>
        <Fab
          color="primary"
          disabled={disabled}
          aria-label="add-question-option"
          size="small"
          onClick={() => {
            onChange([...options, { text: '' }]);
          }}
        >
          <Add />
        </Fab>
        <Typography style={{ paddingLeft: '1rem' }}>{title}</Typography>
      </div>
      <div>
        {options.map((option, index) => (
          <div className={`${classes.row} ${classes.option}`} key={index}>
            <DragIndicator />
            <div className={classes.textInput}>
              <TextField
                multiline
                inputRef={inputRefs[index]}
                style={{ width: '100%' }}
                variant="standard"
                disabled={disabled}
                size="small"
                value={option.text}
                onChange={(event) => {
                  // Only allow copying from clipboard if
                  // 1) feature is enabled
                  // 2) the copied fields' format is correct
                  // 3) clipboard is pasted on the last option field
                  if (
                    enableClipboardImport &&
                    event.target.value.includes('\t') &&
                    index + 1 === options.length
                  ) {
                    handleClipboardInput(event.target.value, index);
                  } else {
                    onChange(
                      options.map((option, i) =>
                        index === i
                          ? { ...option, text: event.target.value }
                          : option
                      )
                    );
                  }
                }}
                onKeyDown={(event) => {
                  if (['Enter', 'NumpadEnter'].includes(event.code)) {
                    event.preventDefault();
                    if (index === options.length - 1) {
                      // Last item on list - add new option
                      onChange([...options, { text: '' }]);
                    } else {
                      // Focus on the next item
                      inputRefs[index + 1].current.focus();
                    }
                  }
                }}
              />
            </div>
            {allowOptionInfo && (
              <OptionInfoDialog
                infoText={option.info}
                onChangeOptionInfo={(newInfoText) => {
                  onChange(
                    options.map((option, i) =>
                      index === i ? { ...option, info: newInfoText } : option
                    )
                  );
                }}
              />
            )}
            <Tooltip title={tr.SurveySections.removeOption}>
              <span>
                <IconButton
                  aria-label="delete"
                  disabled={disabled}
                  size="small"
                  onClick={() => {
                    onChange(options.filter((_, i) => index !== i));
                  }}
                >
                  <Delete />
                </IconButton>
              </span>
            </Tooltip>
          </div>
        ))}
      </div>
    </div>
  );
}
