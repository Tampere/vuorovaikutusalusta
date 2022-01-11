import { FormHelperText, TextField } from '@material-ui/core';
import { useTranslations } from '@src/stores/TranslationContext';
import React from 'react';

/**
 * Max length of free text questions
 */
const freeTextAnswerMaxLength = 500;

interface Props {
  value: string;
  onChange: (value: string) => void;
  setDirty: (dirty: boolean) => void;
}

export default function FreeTextQuestion(props: Props) {
  const { tr } = useTranslations();
  return (
    <>
      <TextField
        value={props.value}
        multiline
        inputProps={{ maxLength: freeTextAnswerMaxLength }}
        onChange={(event) => {
          props.setDirty(true);
          props.onChange(event.target.value);
        }}
        onBlur={() => {
          props.setDirty(true);
        }}
      />
      <FormHelperText>
        {tr.SurveyQuestion.charactersRemaining.replace(
          '{x}',
          String(freeTextAnswerMaxLength - props.value.length)
        )}
      </FormHelperText>
    </>
  );
}
