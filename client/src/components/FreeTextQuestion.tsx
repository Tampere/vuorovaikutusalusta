import { SurveyFreeTextQuestion } from '@interfaces/survey';
import { FormHelperText, TextField } from '@mui/material';
import { useTranslations } from '@src/stores/TranslationContext';
import React from 'react';

interface Props {
  question: SurveyFreeTextQuestion;
  value: string;
  onChange: (value: string) => void;
  setDirty: (dirty: boolean) => void;
  maxLength?: number;
}

export default function FreeTextQuestion({
  question,
  value,
  onChange,
  setDirty,
  maxLength = 500,
}: Props) {
  const { tr } = useTranslations();
  return (
    <>
      <TextField
        value={value}
        multiline
        required={question.isRequired}
        inputProps={{
          id: `${question.id}-input`,
          maxLength: maxLength,
          'aria-describedby': `${question.id}-helper-text ${question.id}-required-text`,
        }}
        onChange={(event) => {
          setDirty(true);
          onChange(event.target.value);
        }}
      />
      <FormHelperText
        aria-hidden={value.length < 0.95 * maxLength}
        id={`${question.id}-helper-text`}
      >
        {tr.SurveyQuestion.charactersRemaining.replace(
          '{x}',
          String(maxLength - value.length)
        )}
      </FormHelperText>
    </>
  );
}
