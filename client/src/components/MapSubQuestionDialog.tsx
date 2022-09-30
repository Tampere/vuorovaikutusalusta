import {
  MapQuestionAnswer,
  SurveyMapSubQuestion,
  SurveyMapSubQuestionAnswer,
} from '@interfaces/survey';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  FormLabel,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import {
  getEmptyAnswer,
  useSurveyAnswers,
} from '@src/stores/SurveyAnswerContext';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { useEffect, useMemo, useState } from 'react';
import CheckBoxQuestion from './CheckBoxQuestion';
import FreeTextQuestion from './FreeTextQuestion';
import NumericQuestion from './NumericQuestion';
import RadioQuestion from './RadioQuestion';
import SectionInfo from './SectionInfo';

const useStyles = makeStyles({
  content: {
    '& > :not(:last-child)': {
      marginBottom: '2rem',
    },
  },
});

interface Props {
  /**
   * Is the dialog open?
   */
  open: boolean;
  /**
   * Title of the question - only displayed when editing existing answers
   */
  title?: string;
  /**
   * Existing subquestion answers - defined only when editing an existing map answer
   */
  answer?: MapQuestionAnswer;
  /**
   * Map sub questions
   */
  subQuestions: SurveyMapSubQuestion[];
  /**
   * Callback for submitting subquestion answers
   */
  onSubmit: (answers: SurveyMapSubQuestionAnswer[]) => void;
  /**
   * Callback for canceling adding/editing a map answer
   */
  onCancel: () => void;
  /**
   * Callback for deleting the existing map answer (not shown for new answers)
   */
  onDelete?: () => void;
}

export default function MapSubQuestionDialog({
  open,
  title,
  answer: existingAnswer,
  subQuestions,
  onSubmit,
  onCancel,
  onDelete,
}: Props) {
  const [answers, setAnswers] = useState<SurveyMapSubQuestionAnswer[]>([
    ...(existingAnswer?.subQuestionAnswers ?? []),
  ]);
  const [dirty, setDirty] = useState<boolean[]>([]);

  const classes = useStyles();
  const { getValidationErrors } = useSurveyAnswers();
  const { tr, surveyLanguage } = useTranslations();

  /**
   * Initialize dirty statuses and answers with empty answers when subquestions are changed and/or the dialog is opened
   */
  useEffect(() => {
    if (existingAnswer) {
      // Existing answer provided - set subquestion answers from that
      setAnswers(existingAnswer.subQuestionAnswers);
    } else {
      // New map answer - set subquestion answers empty
      const answers = subQuestions?.map(
        (question) => getEmptyAnswer(question) as SurveyMapSubQuestionAnswer
      );
      setAnswers(answers);
    }
    // Clear dirty status for each subquestion
    const dirty = subQuestions?.map(() => false);
    setDirty(dirty);
  }, [subQuestions, open, existingAnswer]);

  const validationErrors = useMemo(() => {
    if (!subQuestions || !answers.length) {
      return;
    }
    return subQuestions.map((question) =>
      getValidationErrors(question, answers)
    );
  }, [answers, subQuestions]);

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-label="subquestion dialog"
      aria-describedby="subquestion-dialog-content"
    >
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent
        id="subquestion-dialog-content"
        className={classes.content}
      >
        {subQuestions?.map((question, index) => (
          <FormControl
            key={question.id}
            error={dirty?.[index] && validationErrors?.[index].length > 0}
            style={{ width: '100%' }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <FormLabel htmlFor={`${question.id}-input`}>
                {question.title?.[surveyLanguage]} {question.isRequired && '*'}
              </FormLabel>
              {question.info && (
                <SectionInfo
                  infoText={question.info?.[surveyLanguage]}
                  subject={question.title?.[surveyLanguage]}
                />
              )}
            </div>
            {question.type === 'checkbox' ? (
              <CheckBoxQuestion
                value={answers[index]?.value as (number | string)[]}
                onChange={(value) => {
                  answers[index].value = value;
                  setAnswers([...answers]);
                }}
                question={question}
                setDirty={(value) => {
                  dirty[index] = value;
                  setDirty([...dirty]);
                }}
              />
            ) : question.type === 'radio' ? (
              <RadioQuestion
                value={answers[index]?.value as number | string}
                onChange={(value) => {
                  answers[index].value = value;
                  setAnswers([...answers]);
                }}
                question={question}
                setDirty={(value) => {
                  dirty[index] = value;
                  setDirty([...dirty]);
                }}
              />
            ) : question.type === 'free-text' ? (
              <FreeTextQuestion
                value={answers[index]?.value as string}
                onChange={(value) => {
                  answers[index].value = value;
                  setAnswers([...answers]);
                }}
                question={question}
                setDirty={(value) => {
                  dirty[index] = value;
                  setDirty([...dirty]);
                }}
              />
            ) : question.type === 'numeric' ? (
              <NumericQuestion
                value={answers[index]?.value as number}
                onChange={(value) => {
                  answers[index].value = value;
                  setAnswers([...answers]);
                }}
                question={question}
                setDirty={(value) => {
                  dirty[index] = value;
                  setDirty([...dirty]);
                }}
              />
            ) : null}
            {/* Show the required error only for empty values (not when answer limits are broken in checkbox questions) */}
            {dirty?.[index] &&
              validationErrors?.[index].includes('required') && (
                <FormHelperText id={`${question.id}-required-text`}>
                  {tr.SurveyQuestion.errorFieldIsRequired}
                </FormHelperText>
              )}
          </FormControl>
        ))}
      </DialogContent>
      <DialogActions>
        {existingAnswer && (
          <Button
            onClick={() => {
              onDelete();
            }}
            variant="contained"
          >
            {tr.MapQuestion.removeAnswer}
          </Button>
        )}
        <div style={{ flexGrow: 1 }} />
        <Button
          onClick={() => {
            onCancel();
          }}
        >
          {tr.commands.cancel}
        </Button>
        <Button
          onClick={() => {
            onSubmit(answers);
          }}
          disabled={validationErrors?.some((error) => error.length > 0)}
        >
          {tr.options.ok}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
