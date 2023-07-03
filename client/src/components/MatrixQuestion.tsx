import { SurveyMatrixQuestion } from '@interfaces/survey';
import {
  FormControl,
  FormLabel,
  InputLabel,
  MenuItem,
  Radio,
  Select,
  SelectChangeEvent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useMediaQuery,
} from '@mui/material';

import { makeStyles } from '@mui/styles';

import { useTranslations } from '@src/stores/TranslationContext';
import React, { useRef, useState } from 'react';

interface Props {
  value: string[];
  onChange: (value: string[]) => void;
  setDirty: (dirty: boolean) => void;
  question: SurveyMatrixQuestion;
}

interface ComponentStateProps {
  isOverflow: boolean;
  breakPoint: number;
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
  const { tr, surveyLanguage } = useTranslations();
  const classes = useStyles();
  const isMobileWidth = useMediaQuery('(max-width:430px)');
  const [componentState, setComponentState] = useState<ComponentStateProps>({
    isOverflow: false,
    breakPoint: 0,
  });

  const radioRef = useRef(null);
  const selectRef = useRef(null);

  React.useLayoutEffect(() => {
    if (!radioRef.current) {
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];

      setComponentState((prev) => {
        if (entry === null) {
          return {
            isOverflow: true,
            breakPoint: prev.isOverflow
              ? prev.breakPoint
              : entry.target.scrollWidth,
          };
        } else if (entry.target.clientWidth < entry.target.scrollWidth) {
          return {
            isOverflow: true,
            breakPoint: prev.isOverflow
              ? prev.breakPoint
              : entry.target.scrollWidth,
          };
        } else {
          return prev;
        }
      });
    });

    resizeObserver.observe(radioRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [componentState.isOverflow, isMobileWidth]);

  React.useLayoutEffect(() => {
    if (!selectRef.current) {
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];

      setComponentState((prev) => {
        if (entry.target.scrollWidth >= componentState.breakPoint) {
          return { isOverflow: false, breakPoint: prev.breakPoint };
        }
        return prev;
      });
    });

    resizeObserver.observe(selectRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [componentState.isOverflow, isMobileWidth]);

  function handleChange(
    subjectIndex: number,
    event: React.ChangeEvent<HTMLInputElement> | SelectChangeEvent,
    type: 'radio' | 'select' = 'radio'
  ) {
    // Ignore if the value is false
    if (type === 'radio' && !(event.target as HTMLInputElement).checked) {
      return;
    }
    // Set the row's value to the selected button's value
    const values = [...value];
    values[subjectIndex] = event.target.value;
    onChange(values);
    setDirty(true);
  }

  return (
    <>
      {!componentState.isOverflow && (
        <TableContainer ref={radioRef}>
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
                      {entry?.[surveyLanguage] ?? index}
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
                      {subject?.[surveyLanguage]}
                    </TableCell>
                    {question.classes.map((entry, classIndex) => (
                      <TableCell
                        key={classIndex}
                        className={classes.matrixCell}
                      >
                        <Radio
                          aria-label={`${question.title} ${subject?.[surveyLanguage]}: ${entry?.[surveyLanguage]}`}
                          name={`question-${subjectIndex}`}
                          checked={
                            value[subjectIndex] === classIndex.toString()
                          }
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
                          aria-label={`${question.title} ${subject?.[surveyLanguage]}: ${tr.MatrixQuestion.emptyAnswer}`}
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
      )}
      {!isMobileWidth && componentState.isOverflow && (
        <TableContainer ref={selectRef} sx={{ marginTop: 2 }}>
          <Table size="small">
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
                      {subject?.[surveyLanguage]}
                    </TableCell>

                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 160, m: 1 }}>
                        <InputLabel id="matrix-select-label">
                          {tr.SurveySections.selectAnswer}
                        </InputLabel>
                        <Select
                          labelId="matrix-select-label"
                          label={tr.SurveySections.selectAnswer}
                          id="matrix-select"
                          value={value?.[subjectIndex] ?? ''}
                          onChange={(event: SelectChangeEvent<string>) =>
                            handleChange(subjectIndex, event, 'select')
                          }
                        >
                          {question.classes.map((entry, classIndex) => (
                            <MenuItem
                              key={classIndex}
                              value={classIndex.toString()}
                            >
                              {entry?.[surveyLanguage]}
                            </MenuItem>
                          ))}
                          {question.allowEmptyAnswer && (
                            <MenuItem value={'-1'}>
                              {tr.MatrixQuestion.emptyAnswer}
                            </MenuItem>
                          )}
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {isMobileWidth && (
        <Stack mt={2}>
          {question.subjects.map((subject, subjectIndex) => {
            return (
              <FormControl
                key={subjectIndex}
                size="small"
                sx={{ minWidth: 160, m: 1 }}
              >
                <FormLabel
                  id="matrix-select-label"
                  sx={{
                    fontWeight: 'bold',
                    marginBottom: 1,
                    color: 'black',
                    fontSize: '0.875rem',
                  }}
                >
                  {subject?.[surveyLanguage]}
                </FormLabel>
                <Select
                  id="matrix-select"
                  displayEmpty
                  value={value?.[subjectIndex] ?? ''}
                  onChange={(event: SelectChangeEvent<string>) =>
                    handleChange(subjectIndex, event, 'select')
                  }
                >
                  <MenuItem sx={{ display: 'none' }} value="" disabled>
                    {tr.SurveySections.selectAnswer}
                  </MenuItem>
                  {question.classes.map((entry, classIndex) => (
                    <MenuItem key={classIndex} value={classIndex.toString()}>
                      {entry?.[surveyLanguage]}
                    </MenuItem>
                  ))}
                  {question.allowEmptyAnswer && (
                    <MenuItem value={'-1'}>
                      {tr.MatrixQuestion.emptyAnswer}
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            );
          })}
        </Stack>
      )}
    </>
  );
}
