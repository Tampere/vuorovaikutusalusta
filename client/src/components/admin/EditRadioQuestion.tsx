import React from 'react';
import { SurveyRadioQuestion } from '@interfaces/survey';
import QuestionOptions from './QuestionOptions';
import { Checkbox, FormControlLabel, FormGroup } from '@material-ui/core';
import { useTranslations } from '@src/stores/TranslationContext';

interface Props {
  section: SurveyRadioQuestion;
  disabled?: boolean;
  onChange: (section: SurveyRadioQuestion) => void;
}

export default function EditRadioQuestion({
  section,
  disabled,
  onChange,
}: Props) {
  const { tr } = useTranslations();

  return (
    <>
      <FormGroup row>
        <FormControlLabel
          control={
            <Checkbox
              name="is-required"
              disabled={disabled}
              checked={section.isRequired}
              onChange={(event) => {
                onChange({
                  ...section,
                  isRequired: event.target.checked,
                });
              }}
            />
          }
          label={tr.SurveySections.isRequired}
        />
      </FormGroup>
      <QuestionOptions
        disabled={disabled}
        options={section.options}
        onChange={(options) => {
          onChange({ ...section, options });
        }}
        title={tr.SurveySections.options}
      />
      <FormGroup row>
        <FormControlLabel
          control={
            <Checkbox
              name="allow-custom-answer"
              disabled={disabled}
              checked={section.allowCustomAnswer}
              onChange={(event) => {
                onChange({
                  ...section,
                  allowCustomAnswer: event.target.checked,
                });
              }}
            />
          }
          label={tr.SurveySections.allowCustomAnswer}
        />
      </FormGroup>
    </>
  );
}
