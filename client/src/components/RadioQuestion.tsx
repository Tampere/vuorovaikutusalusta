import { SurveyRadioQuestion } from '@interfaces/survey';
import {
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
} from '@material-ui/core';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { useEffect, useState } from 'react';
import SectionInfo from './SectionInfo';
/**
 * Max length of a custom answer in radio/checkbox questions
 */
const customAnswerMaxLength = 100;

interface Props {
  value: number | string;
  onChange: (value: number | string) => void;
  question: SurveyRadioQuestion;
  setDirty: (dirty: boolean) => void;
}

export default function RadioQuestion({
  value,
  onChange,
  question,
  setDirty,
}: Props) {
  const [customAnswerValue, setCustomAnswerValue] = useState('');
  const { tr } = useTranslations();

  // Update custom answer value if value from context is string
  useEffect(() => {
    // If the value is a string, it is the custom value
    setCustomAnswerValue(typeof value === 'string' ? value : '');
  }, [value]);

  return (
    <>
      <RadioGroup
        aria-label={question.title}
        value={value}
        onChange={(event) => {
          setDirty(true);
          const numericValue = Number(event.currentTarget.value);
          // Empty strings are converted to 0 with Number()
          onChange(
            event.currentTarget.value.length > 0 && !isNaN(numericValue)
              ? numericValue
              : event.currentTarget.value
          );
        }}
        name={`${question.title}-group`}
        onBlur={() => {
          setDirty(true);
        }}
      >
        {question.options.map((option, index) => {
          /** TODO: Remove changes related to option.info when OSBU question is ready for usage */
          return (
            <div
              key={`option-field-${index}`}
              style={{ display: 'flex', flexDirection: 'row' }}
            >
              <FormControlLabel
                key={option.id}
                value={option.id}
                label={option.text}
                control={
                  <Radio required={question.isRequired} name={option.text} />
                }
              />
              {option.info && <SectionInfo infoText={option.info} />}
            </div>
          );
        })}
        {question.allowCustomAnswer && (
          <>
            <FormControlLabel
              value={customAnswerValue}
              label={tr.SurveyQuestion.customAnswer}
              control={
                <Radio
                  required={question.isRequired}
                  name={tr.SurveyQuestion.customAnswer}
                />
              }
            />
            {/* Value is a number (ID) when a pre-defined option is selected - otherwise it's custom */}
            {typeof value === 'string' && (
              <TextField
                value={customAnswerValue}
                inputProps={{ maxLength: customAnswerMaxLength }}
                onChange={(event) => {
                  setCustomAnswerValue(event.currentTarget.value);
                  onChange(event.currentTarget.value);
                }}
              />
            )}
          </>
        )}
      </RadioGroup>
    </>
  );
}
