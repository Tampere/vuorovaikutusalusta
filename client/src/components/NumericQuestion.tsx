import { SurveyNumericQuestion } from '@interfaces/survey';
import { FormHelperText, TextField } from '@mui/material';
import { useTranslations } from '@src/stores/TranslationContext';
import React from 'react';

interface Props {
  autoFocus?: boolean;
  question: SurveyNumericQuestion;
  value: number;
  onChange: (value: number) => void;
  setDirty: (dirty: boolean) => void;
}

export default function NumericQuestion({
  autoFocus = false,
  question,
  value,
  onChange,
  setDirty,
}: Props) {
  const { tr } = useTranslations();

  return (
    <>
      <TextField
        autoFocus={autoFocus}
        value={value ?? ''}
        required={question.isRequired}
        inputProps={{
          min: question.minValue,
          max: question.maxValue,
          id: `${question.id}-input`,
          'aria-describedby': `${question.id}-required-text ${question.id}-helper-text`,
        }}
        type="number"
        onChange={(event) => {
          setDirty(true);
          onChange(
            !event.target.value.length ? null : Number(event.target.value)
          );
        }}
      />
      {(question.minValue != null || question.maxValue != null) && (
        <FormHelperText id={`${question.id}-helper-text`}>
          {question.minValue != null && question.maxValue != null
            ? tr.NumericQuestion.minMaxValue
                .replace('{minValue}', String(question.minValue))
                .replace('{maxValue}', String(question.maxValue))
            : question.minValue != null
            ? tr.NumericQuestion.minValue.replace(
                '{minValue}',
                String(question.minValue)
              )
            : tr.NumericQuestion.maxValue.replace(
                '{maxValue}',
                String(question.maxValue)
              )}
        </FormHelperText>
      )}
    </>
  );
}
