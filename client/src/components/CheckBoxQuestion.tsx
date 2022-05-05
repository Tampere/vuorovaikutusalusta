import { SurveyCheckboxQuestion } from '@interfaces/survey';
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  TextField,
} from '@material-ui/core';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { useEffect, useMemo, useState } from 'react';

/**
 * Max length of a custom answer in radio/checkbox questions
 */
const customAnswerMaxLength = 100;

interface Props {
  value: (string | number)[];
  onChange: (value: (string | number)[]) => void;
  question: SurveyCheckboxQuestion;
  setDirty: (dirty: boolean) => void;
}

export default function CheckBoxQuestion({
  value,
  onChange,
  question,
  setDirty,
}: Props) {
  const [customAnswerValue, setCustomAnswerValue] = useState('');
  const { tr } = useTranslations();

  const answerLimitText = useMemo(() => {
    if (!question.answerLimits) {
      return null;
    }
    return (
      question.answerLimits.min && question.answerLimits.max
        ? tr.SurveyQuestion.answerLimitsMinMax
        : question.answerLimits.min
        ? tr.SurveyQuestion.answerLimitsMin
        : question.answerLimits.max
        ? tr.SurveyQuestion.answerLimitsMax
        : ''
    )
      .replace('{min}', `${question.answerLimits.min}`)
      .replace('{max}', `${question.answerLimits.max}`);
  }, [question.answerLimits]);

  // Update custom answer value if value from context is string
  useEffect(() => {
    // If the value array contains a string, it is the custom value
    const customValue = value.find((v) => typeof v === 'string') as string;
    setCustomAnswerValue(customValue ?? '');
  }, [value]);

  return (
    <>
      {answerLimitText && (
        // Align this helper text with the form label
        <FormHelperText style={{ marginLeft: 0 }}>
          {answerLimitText}
        </FormHelperText>
      )}
      <FormGroup
        aria-label={question.title}
        aria-describedby={answerLimitText}
        onBlur={() => {
          setDirty(true);
        }}
      >
        {question.options.map((option) => (
          <FormControlLabel
            key={option.id}
            label={option.text}
            control={
              <Checkbox
                // TS can't infer the precise memoized value type from question.type, but for checkboxes it's always an array
                checked={value.includes(option.id)}
                onChange={(event) => {
                  setDirty(true);
                  const newValue = event.currentTarget.checked
                    ? // Add the value to the selected options
                      [...value, option.id]
                    : // Filter out the value from the selected options
                      value.filter((optionId) => optionId !== option.id);
                  onChange(newValue);
                }}
                name={option.text}
              />
            }
          />
        ))}
        {question.allowCustomAnswer && (
          <FormControlLabel
            control={
              <Checkbox
                checked={value.includes(customAnswerValue)}
                onChange={(event) => {
                  const newValue = event.currentTarget.checked
                    ? // Add the custom answer to the array
                      [...value, customAnswerValue]
                    : // Remove any custom answers (of type string) from the array
                      value.filter((option) => typeof option !== 'string');
                  onChange(newValue);
                }}
              />
            }
            label={tr.SurveyQuestion.customAnswer}
          />
        )}
        {value.includes(customAnswerValue) && (
          <TextField
            value={customAnswerValue}
            required={question.isRequired}
            inputProps={{
              maxLength: customAnswerMaxLength,
              'aria-label': tr.SurveyQuestion.customAnswer,
            }}
            onChange={(event) => {
              setCustomAnswerValue(event.currentTarget.value);
              onChange(
                value.map((option) =>
                  typeof option === 'string'
                    ? event.currentTarget.value
                    : option
                )
              );
            }}
          />
        )}
      </FormGroup>
    </>
  );
}
