import { SurveyMatrixQuestion } from '@interfaces/survey';
import {
  Radio,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { useTranslations } from '@src/stores/TranslationContext';
import React from 'react';

interface Props {
  value: string[];
  onChange: (value: string[]) => void;
  setDirty: (dirty: boolean) => void;
  question: SurveyMatrixQuestion;
}

const useStyles = makeStyles({
  matrixRow: {
    display: 'flex',
    flexDirection: 'row',
  },
  matrixCell: {
    width: '100px',
    wordWrap: 'break-word',
    margin: '0',
    textAlign: 'center',
  },
  matrixText: {
    fontWeight: 'bold',
  },
  stickyLeft: {
    position: 'sticky',
    left: 0,
    background: 'white',
    zIndex: 1,
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

  function handleChange(
    subjectIndex: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    // Ignore if the value is false
    if (!event.target.checked) {
      return;
    }
    // Set the row's value to the selected button's value
    const values = [...value];
    values[subjectIndex] = event.target.value;
    onChange(values);
    setDirty(true);
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell className={classes.stickyLeft} />
            {question.classes.map((entry, index) => {
              return (
                <TableCell
                  key={index}
                  className={`${classes.matrixCell} ${classes.matrixText}`}
                >
                  {entry[language] ?? index}
                </TableCell>
              );
            })}
            {question.allowEmptyAnswer && (
              <TableCell
                className={`${classes.matrixCell} ${classes.matrixText}`}
              >
                {tr.MatrixQuestion.emptyAnswer}
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {question.subjects.map((subject, subjectIndex) => {
            return (
              <TableRow key={subjectIndex}>
                <TableCell
                  className={[
                    classes.stickyLeft,
                    classes.matrixCell,
                    classes.matrixText,
                  ].join(' ')}
                >
                  {subject[language]}
                </TableCell>
                {question.classes.map((_entry, classIndex) => (
                  <TableCell key={classIndex} className={classes.matrixCell}>
                    <Radio
                      name={`question-${subjectIndex}`}
                      checked={value[subjectIndex] === classIndex.toString()}
                      value={classIndex.toString()}
                      onChange={(event) => {
                        handleChange(subjectIndex, event);
                      }}
                    />
                  </TableCell>
                ))}
                {question.allowEmptyAnswer && (
                  <TableCell>
                    <Radio
                      name={`question-${subjectIndex}`}
                      checked={value[subjectIndex] === '-1'}
                      value={'-1'}
                      onChange={(event) => {
                        handleChange(subjectIndex, event);
                      }}
                    />
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
