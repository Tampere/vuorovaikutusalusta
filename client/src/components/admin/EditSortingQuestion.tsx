import { SurveySortingQuestion } from '@interfaces/survey';
import { Checkbox, FormControlLabel, FormGroup } from '@material-ui/core';
import { useTranslations } from '@src/stores/TranslationContext';
import React from 'react';
import QuestionOptions from './QuestionOptions';

interface Props {
  section: SurveySortingQuestion;
  disabled?: boolean;
  onChange: (section: SurveySortingQuestion) => void;
}

export default function EditSortingQuestion({
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
      <QuestionOptions
        options={section.options}
        disabled={disabled}
        onChange={(options) => {
          onChange({
            ...section,
            options,
          });
        }}
        title={tr.SurveySections.options}
      />
    </>
  );
}
