import { SurveyRadioQuestion } from '@interfaces/survey';
import {
  FormControlLabel,
  FormGroup,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
} from '@mui/material';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { createRef, useEffect, useRef, useState } from 'react';

interface Props {
  autoFocus?: boolean;
  value: number | string;
  onChange: (value: number | string) => void;
  question: SurveyRadioQuestion;
  setDirty: (dirty: boolean) => void;
  readOnly?: boolean;
}

/**
 * Max length of a custom answer in radio/checkbox questions
 */
const customAnswerMaxLength = 250;

const styles = {
  labelStyles: {
    '& .MuiFormControlLabel-label': {
      lineHeight: 1.2,
      marginBottom: '0.5em',
      marginTop: '0.5em',
    },
  },
};

export default function RadioQuestion({
  autoFocus = false,
  value,
  onChange,
  question,
  setDirty,
  readOnly = false,
}: Props) {
  const [customAnswerValue, setCustomAnswerValue] = useState('');
  const [customSelected, setCustomSelected] = useState(false);
  const { tr, surveyLanguage } = useTranslations();
  const actionRef = useRef([]);

  if (autoFocus) {
    actionRef.current = question.options.map(
      (_, i) => actionRef.current[i] ?? createRef(),
    );
  }

  useEffect(() => {
    // autoFocus prop won't trigger focus styling, must be done manually
    autoFocus && actionRef.current[0]?.current.focusVisible();
  }, []);

  // Update custom answer value if value from context is string
  useEffect(() => {
    // If the value is a string, it is the custom value
    setCustomAnswerValue(typeof value === 'string' ? value : '');
  }, [value]);

  return (
    <>
      {!readOnly && question.displaySelection && (
        <FormGroup>
          <Select
            value={value ?? ('DEFAULT_SELECT_ANSWER' as const)}
            displayEmpty
            renderValue={(value) => {
              if (value === 'DEFAULT_SELECT_ANSWER')
                return tr.SurveySections.selectAnswer;
              if (typeof value === 'string')
                return tr.SurveyQuestion.customAnswer;
              return `${
                question.options.find((o) => o.id === value)?.text[
                  surveyLanguage
                ] ?? ''
              }`;
            }}
            MenuProps={{
              slotProps: {
                paper: {
                  sx: {
                    maxHeight: '60%',
                  },
                },
              },
            }}
            onChange={(event) => {
              const numericValue = Number(event.target.value);
              if (event.target.value !== '' && !isNaN(numericValue)) {
                setDirty(true);
              }
              // Empty strings are converted to 0 with Number()
              onChange(
                event.target.value !== '' && !isNaN(numericValue)
                  ? numericValue
                  : event.target.value,
              );
            }}
          >
            {question.options.map((o) => (
              <MenuItem key={o.id} value={o.id}>
                <Radio checked={!customSelected && value === o.id} />
                {o.text[surveyLanguage]}
              </MenuItem>
            ))}
            {question.allowCustomAnswer && (
              <MenuItem key={'custom'} value={customAnswerValue}>
                <Radio checked={typeof value === 'string'} />
                {tr.SurveyQuestion.customAnswer}
              </MenuItem>
            )}
          </Select>
          {typeof value === 'string' && (
            <TextField
              value={customAnswerValue}
              required={question.isRequired}
              label={tr.SurveyQuestion.customAnswerField}
              sx={{
                marginTop: '0.5em',
              }}
              aria-label={tr.SurveyQuestion.customAnswerField}
              inputProps={{
                maxLength: customAnswerMaxLength,
              }}
              onChange={(event) => {
                setCustomAnswerValue(event.currentTarget.value);
                onChange(event.currentTarget.value);
              }}
            />
          )}
        </FormGroup>
      )}
      {(!question.displaySelection || readOnly) && (
        <RadioGroup
          id={`${question.id}-input`}
          value={value}
          onChange={(event) => {
            const numericValue = Number(event.currentTarget.value);
            if (event.currentTarget.value.length > 0 && !isNaN(numericValue)) {
              setDirty(true);
            }
            // Empty strings are converted to 0 with Number()
            onChange(
              event.currentTarget.value.length > 0 && !isNaN(numericValue)
                ? numericValue
                : event.currentTarget.value,
            );
          }}
          name={`${question.title?.[surveyLanguage]}-group`}
        >
          {question.options.map((option, index) => (
            <FormControlLabel
              key={option.id}
              value={option.id}
              label={option.text?.[surveyLanguage] ?? ''}
              sx={styles.labelStyles}
              control={
                <Radio
                  action={actionRef.current[index]}
                  autoFocus={index === 0 && autoFocus}
                />
              }
            />
          ))}
          {question.allowCustomAnswer && (
            <>
              <FormControlLabel
                value={customAnswerValue}
                label={tr.SurveyQuestion.customAnswer}
                control={<Radio />}
              />
              {/* Value is a number (ID) when a pre-defined option is selected - otherwise it's custom */}
              {typeof value === 'string' && (
                <TextField
                  value={customAnswerValue}
                  required={question.isRequired}
                  placeholder={tr.SurveyQuestion.customAnswerField}
                  inputProps={{
                    maxLength: customAnswerMaxLength,
                    'aria-label': tr.SurveyQuestion.customAnswerField,
                  }}
                  onChange={(event) => {
                    setCustomAnswerValue(event.currentTarget.value);
                    onChange(event.currentTarget.value);
                  }}
                />
              )}
            </>
          )}
        </RadioGroup>
      )}
    </>
  );
}
