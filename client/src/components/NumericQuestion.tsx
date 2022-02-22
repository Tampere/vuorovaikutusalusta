import { TextField } from '@material-ui/core';
import React from 'react';

interface Props {
  value: number;
  onChange: (value: number) => void;
  setDirty: (dirty: boolean) => void;
}

export default function NumericQuestion({ value, onChange, setDirty }: Props) {
  return (
    <>
      <TextField
        value={value ?? ''}
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
