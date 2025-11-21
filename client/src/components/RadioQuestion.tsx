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
import React, { useEffect, useRef, useState } from 'react';

const DEFAULT_VALUE = 'noSelection';

interface Props {
  autoFocus?: boolean;
  value: number | string | null;
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
  const { tr, surveyLanguage } = useTranslations();
  const actionRef = useRef(null);

  useEffect(() => {
    // autoFocus prop won't trigger focus styling, must be done manually
    autoFocus && actionRef.current.focusVisible();
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
            labelId={question.id.toString()}
            value={value ?? DEFAULT_VALUE}
            displayEmpty
            renderValue={(value) => {
              if (value === DEFAULT_VALUE)
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
              if (event.target.value === DEFAULT_VALUE && value !== null) {
                onChange(null);
                return;
              }
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
            <MenuItem
              key="default"
              value={DEFAULT_VALUE}
              style={{ color: '#6a6969' }}
            >
              <Radio
                checked={value === null}
                disableRipple
                slotProps={{ input: { 'aria-hidden': 'true' } }}
                sx={{ pointerEvents: 'none' }}
              />
              {tr.SurveySection.noSelection}
            </MenuItem>
            {question.options.map((o) => (
              <MenuItem key={o.id} value={o.id}>
                <Radio
                  checked={value === o.id}
                  disableRipple
                  slotProps={{ input: { 'aria-hidden': 'true' } }}
                  sx={{ pointerEvents: 'none' }}
                />
                {o.text[surveyLanguage]}
              </MenuItem>
            ))}
            {question.allowCustomAnswer && (
              <MenuItem key={'custom'} value={customAnswerValue}>
                <Radio
                  checked={typeof value === 'string'}
                  disableRipple
                  slotProps={{ input: { 'aria-hidden': 'true' } }}
                  sx={{ pointerEvents: 'none' }}
                />
                {tr.SurveyQuestion.customAnswer}
              </MenuItem>
            )}
          </Select>
          {typeof value === 'string' && (
            <TextField
              value={customAnswerValue}
              required={question.isRequired}
              placeholder={tr.SurveyQuestion.customAnswerField}
              sx={{
                marginTop: '0.5em',
              }}
              aria-label={tr.SurveyQuestion.customAnswerField}
              slotProps={{
                htmlInput: {
                  maxLength: customAnswerMaxLength,
                  'aria-label': tr.SurveyQuestion.customAnswerField,
                },
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
            if (event.currentTarget.value === DEFAULT_VALUE && value !== null) {
              onChange(null);
              return;
            }
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
          <FormControlLabel
            style={{ color: '#757575' }}
            key={'default'}
            value={DEFAULT_VALUE}
            checked={value === null}
            label={tr.SurveySection.noSelection}
            sx={styles.labelStyles}
            control={<Radio action={actionRef.current} autoFocus={autoFocus} />}
          />
          {question.options.map((option) => (
            <FormControlLabel
              key={option.id}
              value={option.id}
              label={option.text?.[surveyLanguage] ?? ''}
              sx={styles.labelStyles}
              control={<Radio />}
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
                  slotProps={{
                    htmlInput: {
                      maxLength: customAnswerMaxLength,
                      'aria-label': tr.SurveyQuestion.customAnswerField,
                    },
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
