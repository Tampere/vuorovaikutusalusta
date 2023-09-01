import { SurveyMultiMatrixQuestion } from '@interfaces/survey';
import {
  Checkbox,
  FormControl,
  FormHelperText,
  FormLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useMediaQuery,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';

import { makeStyles } from '@mui/styles';

import { useTranslations } from '@src/stores/TranslationContext';
import React, { useEffect, useMemo, useRef, useState } from 'react';

interface Props {
  value: string[][];
  onChange: (value: string[][]) => void;
  setDirty: (dirty: boolean) => void;
  question: SurveyMultiMatrixQuestion;
  validationErrors: ('required' | 'answerLimits' | 'minValue' | 'maxValue')[];
}

interface ComponentState {
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
    zIndex: 1,
    textAlign: 'left',
  },
});

export default function MultiMatrixQuestion({
  value,
  onChange,
  question,
  validationErrors,
  setDirty,
}: Props) {
  const { tr, surveyLanguage } = useTranslations();
  const classes = useStyles();
  const isMobileWidth = useMediaQuery('(max-width:430px)');
  const [componentState, setComponentState] = useState<ComponentState>({
    isOverflow: false,
    breakPoint: 0,
  });
  const radioRef = useRef(null);
  const selectRef = useRef(null);

  useEffect(() => {
    if (
      question?.answerLimits?.max &&
      value.some((row) => row.length > question.answerLimits.max)
    ) {
      setDirty(true);
    }
  }, [value]);

  React.useLayoutEffect(() => {
    if (!radioRef.current) {
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];

      setComponentState((prev) => {
        if (
          entry === null ||
          entry.target.clientWidth < entry.target.scrollWidth
        ) {
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

  function handleChange(subjectIndex: number, classIndex: string) {
    function updateAnswerRow(row: string[]) {
      if (classIndex === '-1' && !row.includes(classIndex)) {
        return ['-1'];
      }

      if (row.includes(classIndex)) {
        return row.filter((item) => item !== classIndex);
      }
      return row.includes('-1') ? [classIndex] : [...row, classIndex];
    }

    const values = value.map((val, index) =>
      index === subjectIndex ? updateAnswerRow(val) : [...val],
    );

    onChange(values);
  }

  function handleSelectChange(subjectIndex: number, classIndexes: string[]) {
    function updateAnswerRow(row: string[]) {
      if (classIndexes.includes('-1')) {
        return row.includes('-1')
          ? classIndexes.filter((val) => val !== '-1')
          : ['-1'];
      }

      return classIndexes;
    }
    const values = value.map((val, index) =>
      index === subjectIndex ? updateAnswerRow(val) : [...val],
    );
    onChange(values);
  }

  function getSelectionRenderValue(subjectIndex: number) {
    const valueList = value?.[subjectIndex];
    if (valueList.length === 0) {
      return;
    }
    if (valueList.length > 1) {
      return `${valueList.length} valittu`;
    }
    if (valueList[0] === '-1') {
      return tr.MatrixQuestion.emptyAnswer;
    }
    return question.classes[Number(valueList[0])]?.[surveyLanguage];
  }

  const answerLimitText = useMemo(() => {
    if (!question.answerLimits) {
      return null;
    }
    return (
      question.answerLimits.min && question.answerLimits.max
        ? tr.SurveyQuestion.answerLimitsMinMax
        : question.answerLimits.min
        ? tr.SurveyQuestion.answerLimitsMin
        : question.answerLimits.max
        ? tr.SurveyQuestion.answerLimitsMax
        : ''
    )
      .replace('{min}', `${question.answerLimits.min}`)
      .replace('{max}', `${question.answerLimits.max}`);
  }, [question.answerLimits, surveyLanguage]);

  return (
    <>
      {answerLimitText && (
        // Align this helper text with the form label
        <>
          <FormHelperText
            style={{ marginLeft: 0, marginBottom: '0.5em' }}
            id={`checkbox-helper-label-${question.id}`}
          >
            {answerLimitText}
          </FormHelperText>
          {validationErrors && validationErrors.includes('answerLimits') && (
            <FormHelperText style={visuallyHidden} role="alert">
              {`${question.title?.[surveyLanguage]}, ${answerLimitText}`}
            </FormHelperText>
          )}
        </>
      )}
      {!isMobileWidth && !componentState.isOverflow && (
        <TableContainer id={`${question.id}-input`} ref={radioRef}>
          <Table size="small">
            {question.title && (
              <caption style={visuallyHidden}>
                {question.title?.[surveyLanguage]}
              </caption>
            )}
            <TableHead>
              <TableRow>
                <TableCell scope="col" className={classes.stickyLeft} />
                {question.classes.map((entry, index) => {
                  return (
                    <TableCell
                      scope="col"
                      key={index}
                      className={`${classes.matrixCell} ${classes.matrixText}`}
                    >
                      {entry?.[surveyLanguage] ?? index}
                    </TableCell>
                  );
                })}
                {question.allowEmptyAnswer && (
                  <TableCell
                    scope="col"
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
                      component="th"
                      scope="row"
                      className={[
                        classes.stickyLeft,
                        classes.matrixCell,
                        classes.matrixText,
                      ].join(' ')}
                    >
                      {subject?.[surveyLanguage]}
                    </TableCell>
                    {question.classes.map((_entry, classIndex) => (
                      <TableCell
                        key={classIndex.toString()}
                        className={classes.matrixCell}
                      >
                        <Checkbox
                          name={`question-${subjectIndex}`}
                          checked={value[subjectIndex].includes(
                            classIndex.toString(),
                          )}
                          value={classIndex}
                          onChange={(event) => {
                            handleChange(
                              subjectIndex,
                              (event.target as HTMLInputElement).value,
                            );
                          }}
                        />
                      </TableCell>
                    ))}
                    {question.allowEmptyAnswer && (
                      <TableCell className={classes.matrixCell}>
                        <Checkbox
                          name={`question-${subjectIndex}`}
                          checked={value[subjectIndex][0] === '-1'}
                          value={-1}
                          onChange={(event) => {
                            handleChange(
                              subjectIndex,
                              (event.target as HTMLInputElement).value,
                            );
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
        <TableContainer
          id={`${question.id}-input`}
          ref={selectRef}
          sx={{ marginTop: 2 }}
        >
          <Table size="small">
            {question.title && (
              <caption style={visuallyHidden}>
                {question.title?.[surveyLanguage]}
              </caption>
            )}
            <TableHead>
              <TableRow>
                <TableCell
                  scope="col"
                  className={[
                    classes.stickyLeft,
                    classes.matrixCell,
                    classes.matrixText,
                  ].join(' ')}
                >
                  {tr.MatrixQuestion.subject}
                </TableCell>
                <TableCell
                  scope="col"
                  className={[classes.matrixCell, classes.matrixText].join(' ')}
                  sx={{ '&&': { textAlign: 'left' } }}
                >
                  {tr.MatrixQuestion.response}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {question.subjects.map((subject, subjectIndex) => {
                return (
                  <TableRow key={subjectIndex}>
                    <TableCell
                      component="th"
                      scope="row"
                      className={[
                        classes.stickyLeft,
                        classes.matrixCell,
                        classes.matrixText,
                      ].join(' ')}
                    >
                      {subject?.[surveyLanguage]}
                    </TableCell>

                    <TableCell>
                      <FormControl
                        size="small"
                        sx={{ minWidth: 160, maxWidth: 200, m: 1 }}
                      >
                        <Select
                          multiple
                          renderValue={() =>
                            getSelectionRenderValue(subjectIndex)
                          }
                          value={value?.[subjectIndex]}
                          onChange={(event) => {
                            if (Array.isArray(event.target.value)) {
                              handleSelectChange(
                                subjectIndex,
                                event.target.value,
                              );
                            }
                          }}
                        >
                          {question.classes.map((entry, classIndex) => (
                            <MenuItem
                              key={classIndex}
                              value={String(classIndex)}
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
        <Stack id={`${question.id}-input`} mt={2}>
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
                  displayEmpty
                  multiple
                  renderValue={() => getSelectionRenderValue(subjectIndex)}
                  value={value?.[subjectIndex]}
                  onChange={(event) => {
                    if (Array.isArray(event.target.value)) {
                      handleSelectChange(subjectIndex, event.target.value);
                    }
                  }}
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
