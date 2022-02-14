import { LocalizedText } from '@interfaces/survey';
import {
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { useTranslations } from '@src/stores/TranslationContext';
import React from 'react';

interface Props {
  value: string[];
  onChange: (value: string[]) => void;
  setDirty: (dirty: boolean) => void;
  question: any;
}

const useStyles = makeStyles({
  matrixContainer: {
    backgroundColor: 'lightgrey',
  },
  matrixRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  matrixCell: {
    width: '100px',
    wordWrap: 'break-word',
    margin: '0',
    textAlign: 'center',
  },
  matrixText: {
    marginTop: '0.5rem',
    fontWeight: 'bold',
  },
});

export default function MatrixQuestion({
  value,
  onChange,
  setDirty,
  question,
}: Props) {
  const { tr, language } = useTranslations();
  const classes = useStyles();

  return (
    <div className={classes.matrixContainer}>
      <div className={classes.matrixRow}>
        <div className={classes.matrixCell}></div>
        {question.classes.map((entry: LocalizedText, index: number) => {
          return (
            <Typography
              className={`${classes.matrixCell} ${classes.matrixText}`}
              key={`matrix-header-${index}`}
            >
              {entry[language] ?? index}
            </Typography>
          );
        })}
        {question.allowEmptyAnswer && (
          <Typography className={`${classes.matrixCell} ${classes.matrixText}`}>
            {tr.MatrixQuestion.emptyAnswer}
          </Typography>
        )}
      </div>

      {question.subjects.map((subject: LocalizedText, index: number) => {
        return (
          <div
            className={classes.matrixRow}
            key={`matrix-subject-row-${index}`}
          >
            <Typography
              className={`${classes.matrixCell} ${classes.matrixText}`}
            >
              {subject[language]}
            </Typography>
            <RadioGroup
              row
              value={value[index] ?? null}
              onChange={(event) => {
                const values = [...value];
                values[index] = event.target.value;
                onChange(values);
                setDirty(true);
              }}
            >
              {question.classes.map((_entry: LocalizedText, index: number) => {
                return (
                  <FormControlLabel
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'center',
                    }}
                    key={`matrix-cell-${index}`}
                    className={classes.matrixCell}
                    value={index.toString()}
                    control={<Radio />}
                    label=""
                  />
                );
              })}
              {question.allowEmptyAnswer && (
                <FormControlLabel
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}
                  className={classes.matrixCell}
                  value={'-1'}
                  control={<Radio />}
                  label=""
                />
              )}
            </RadioGroup>
          </div>
        );
      })}
    </div>
  );
}
