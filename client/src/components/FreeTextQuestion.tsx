import { FormHelperText, TextField } from '@material-ui/core';
import { useTranslations } from '@src/stores/TranslationContext';
import React from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  setDirty: (dirty: boolean) => void;
  maxLength?: number;
}

export default function FreeTextQuestion({
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
        inputProps={{ maxLength: maxLength }}
        onChange={(event) => {
          setDirty(true);
          onChange(event.target.value);
        }}
        onBlur={() => {
          setDirty(true);
        }}
      />
      <FormHelperText>
        {tr.SurveyQuestion.charactersRemaining.replace(
          '{x}',
          String(maxLength - value.length)
        )}
      </FormHelperText>
    </>
  );
}
