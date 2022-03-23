import { SurveyNumericQuestion } from '@interfaces/survey';
import { Checkbox, FormControlLabel, FormGroup } from '@material-ui/core';
import { useTranslations } from '@src/stores/TranslationContext';
import React from 'react';

interface Props {
  section: SurveyNumericQuestion;
  disabled?: boolean;
  onChange: (section: SurveyNumericQuestion) => void;
}

export default function EditNumericQuestion({
  section,
  disabled,
  onChange,
}: Props) {
  const { tr } = useTranslations();

  return (
    <>
      <FormGroup row>
        <FormControlLabel
          label={tr.SurveySections.isRequired}
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
        />
      </FormGroup>
    </>
  );
}
