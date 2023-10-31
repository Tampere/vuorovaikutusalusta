import React, { useState } from 'react';

import { Conditions, SectionOption } from '@interfaces/survey';
import {
  FormControl,
  FormLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';

import { useTranslations } from '@src/stores/TranslationContext';
import { isNumeric } from '@src/utils/typeCheck';

interface RowProps {
  label: string;
  conditionIsNumeric?: boolean;
  options?: SectionOption[];
  conditions?: Conditions;
  textFieldValue?: number | string;
  onInput: (values: number[]) => void;
  allowCustomAnswer?: boolean;
  alignment?: 'left' | 'right';
}

export function ConditionRow({
  label,
  conditionIsNumeric = false,
  options = [],
  conditions = { equals: [], lessThan: [], greaterThan: [] },
  onInput,
  textFieldValue = '',
  allowCustomAnswer = false,
  alignment = 'right',
}: RowProps) {
  const [validationError, setValidationError] = useState(false);
  const { tr, surveyLanguage } = useTranslations();

  return (
    <FormControl
      fullWidth
      sx={{
        flexDirection: 'row',
        marginTop: '10px',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <FormLabel
        sx={{
          flex: 1,
          color: '#000',
          textAlign: alignment,
          transform: validationError ? 'translateY(-50%)' : null,
        }}
      >
        {label}
      </FormLabel>
      {conditionIsNumeric ? (
        <TextField
          error={validationError}
          helperText={
            validationError && tr.FollowUpSection.conditions.validationError
          }
          value={textFieldValue}
          placeholder={tr.FollowUpSection.conditions.insertValue}
          onChange={(event) => {
            const { value } = event.target;

            if (value !== '' && !isNumeric(value)) {
              setValidationError(true);
              return;
            } else if (validationError) setValidationError(false);

            onInput(value === '' ? [] : [Number(value)]);
          }}
          sx={{
            flex: 1,
            '& .MuiInputBase-root': { backgroundColor: 'white' },
            '& .MuiInputBase-input': { paddingY: '0.75rem' },
            '& .MuiFormHelperText-root': { backgroundColor: null },
          }}
        />
      ) : (
        <Select
          multiple
          sx={{
            flex: 1,
            backgroundColor: 'white',
            '& .MuiSelect-select': { paddingY: '0.75rem' },
          }}
          displayEmpty
          value={conditions?.equals}
          onChange={(event) => {
            let { value } = event.target;

            // On autofill we get a stringified value.
            if (typeof value === 'string') {
              value = value.split(',').map((v) => Number(v));
            }
            onInput(value);
          }}
        >
          {options?.map((option) => (
            <MenuItem value={option.id} key={option.id}>
              {option.text[surveyLanguage]}
            </MenuItem>
          ))}

          {allowCustomAnswer && (
            <MenuItem value={-1} key={-1}>
              {tr.FollowUpSection.conditions.customAnswer}
            </MenuItem>
          )}
        </Select>
      )}
    </FormControl>
  );
}
