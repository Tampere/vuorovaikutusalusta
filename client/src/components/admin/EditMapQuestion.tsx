import {
  MapQuestionSelectionType,
  SurveyMapQuestion,
  SurveyMapSubQuestion,
} from '@interfaces/survey';
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormLabel,
} from '@material-ui/core';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { useState } from 'react';
import AddSurveySectionActions from './AddSurveySectionActions';
import EditMapSubQuestions from './EditMapSubQuestions';

interface Props {
  section: SurveyMapQuestion;
  disabled?: boolean;
  onChange: (section: SurveyMapQuestion) => void;
}

export default function EditMapQuestion({
  section,
  disabled,
  onChange,
}: Props) {
  const [expandedSection, setExpandedSection] = useState<number>(null);

  const { tr } = useTranslations();

  function toggleSelectionType(type: MapQuestionSelectionType) {
    const selectionTypes = !section.selectionTypes?.includes(type)
      ? [...(section.selectionTypes ?? []), type].sort()
      : (section.selectionTypes ?? []).filter((t) => t !== type);
    onChange({
      ...section,
      selectionTypes,
    });
  }

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
      <FormGroup>
        <FormLabel>{tr.EditMapQuestion.selectionTypes}</FormLabel>
        <FormControlLabel
          label={tr.EditMapQuestion.point}
          control={
            <Checkbox
              name="point"
              disabled={disabled}
              checked={section.selectionTypes?.includes('point') ?? false}
              onChange={() => {
                toggleSelectionType('point');
              }}
            />
          }
        />
        <FormControlLabel
          label={tr.EditMapQuestion.line}
          control={
            <Checkbox
              name="line"
              disabled={disabled}
              checked={section.selectionTypes?.includes('line') ?? false}
              onChange={() => {
                toggleSelectionType('line');
              }}
            />
          }
        />
        <FormControlLabel
          label={tr.EditMapQuestion.area}
          control={
            <Checkbox
              name="area"
              disabled={disabled}
              checked={section.selectionTypes?.includes('area') ?? false}
              onChange={() => {
                toggleSelectionType('area');
              }}
            />
          }
        />
      </FormGroup>
      <FormLabel>{tr.EditMapQuestion.subQuestions}</FormLabel>
      <EditMapSubQuestions
        mapQuestion={section}
        expandedSection={expandedSection}
        onExpandedSectionChange={(section) => {
          setExpandedSection(section);
        }}
        onChange={(subQuestions) => {
          onChange({ ...section, subQuestions });
        }}
      />
      <AddSurveySectionActions
        types={[
          'radio',
          'checkbox',
          'free-text',
          'numeric',
          'sorting',
          'slider',
          'matrix',
        ]}
        onAdd={(newSection: SurveyMapSubQuestion) => {
          onChange({
            ...section,
            subQuestions: [...(section.subQuestions ?? []), newSection],
          });
          // Open last section after adding a new one
          setExpandedSection((section.subQuestions ?? []).length);
        }}
      />
    </>
  );
}
