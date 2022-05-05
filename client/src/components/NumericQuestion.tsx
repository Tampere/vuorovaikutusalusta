import { SurveyNumericQuestion } from '@interfaces/survey';
import { TextField } from '@material-ui/core';
import React from 'react';

interface Props {
  question: SurveyNumericQuestion;
  value: number;
  onChange: (value: number) => void;
  setDirty: (dirty: boolean) => void;
}

export default function NumericQuestion({
  question,
  value,
  onChange,
  setDirty,
}: Props) {
  return (
    <>
      <TextField
        value={value ?? ''}
        required={question.isRequired}
        inputProps={{
          id: `${question.id}-input`,
          'aria-describedby': `${question.id}-helper-text ${question.id}-required-text`,
        }}
        type="number"
        onChange={(event) => {
          setDirty(true);
          onChange(Number(event.target.value));
        }}
        onBlur={() => setDirty(true)}
      ></TextField>
    </>
  );
}
