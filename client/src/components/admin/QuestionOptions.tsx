import { SectionOption } from '@interfaces/survey';
import { Fab, IconButton, TextField, Typography } from '@material-ui/core';
import { Add, Delete, DragIndicator } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import React, { createRef, useEffect, useMemo } from 'react';

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
}

export default function QuestionOptions({
  options,
  disabled,
  onChange,
  title,
}: Props) {
  const classes = useStyles();

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
                  onChange(
                    options.map((option, i) =>
                      index === i ? { text: event.target.value } : option
                    )
                  );
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
          </div>
        ))}
      </div>
    </div>
  );
}
