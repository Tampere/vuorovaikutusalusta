import {
  SurveyMapSubQuestion,
  SurveyMapSubQuestionAnswer,
} from '@interfaces/survey';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
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
import RadioQuestion from './RadioQuestion';

const useStyles = makeStyles({
  content: {
    '& > :not(:last-child)': {
      marginBottom: '2rem',
    },
  },
});

interface Props {
  open: boolean;
  subQuestions: SurveyMapSubQuestion[];
  onSubmit: (answers: SurveyMapSubQuestionAnswer[]) => void;
  onCancel: () => void;
}

export default function MapSubQuestionDialog({
  open,
  subQuestions,
  onSubmit,
  onCancel,
}: Props) {
  const [answers, setAnswers] = useState<SurveyMapSubQuestionAnswer[]>([]);
  const [dirty, setDirty] = useState<boolean[]>([]);

  const classes = useStyles();
  const { getValidationErrors } = useSurveyAnswers();
  const { tr } = useTranslations();

  /**
   * Initialize dirty statuses and answers with empty answers when subquestions are changed and/or the dialog is opened
   */
  useEffect(() => {
    const answers = subQuestions?.map(
      (question) => getEmptyAnswer(question) as SurveyMapSubQuestionAnswer
    );
    setAnswers(answers);
    const dirty = subQuestions?.map(() => false);
    setDirty(dirty);
  }, [subQuestions, open]);

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
            <FormLabel component="legend">
              {question.title} {question.isRequired && '*'}
            </FormLabel>
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
                setDirty={(value) => {
                  dirty[index] = value;
                  setDirty([...dirty]);
                }}
              />
            ) : null}
            {/* Show the required error only for empty values (not when answer limits are broken in checkbox questions) */}
            {dirty?.[index] &&
              validationErrors?.[index].includes('required') && (
                <FormHelperText>
                  {tr.SurveyQuestion.errorFieldIsRequired}
                </FormHelperText>
              )}
          </FormControl>
        ))}
      </DialogContent>
      <DialogActions>
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
