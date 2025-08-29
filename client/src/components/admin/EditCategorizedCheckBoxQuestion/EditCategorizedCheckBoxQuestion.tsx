import { SurveyCategorizedCheckboxQuestion } from '@interfaces/survey';
import {
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Stack,
} from '@mui/material';
import { useTranslations } from '@src/stores/TranslationContext';
import React from 'react';
import { EditCategoryGroups } from './EditCategoryGroups';
import { CategorizedQuestionOptions } from '../CategorizedQuestionOptions/CategorizedQuestionOptions';

interface Props {
  section: SurveyCategorizedCheckboxQuestion;
  disabled?: boolean;
  onChange: (section: SurveyCategorizedCheckboxQuestion) => void;
}

const styles = {
  accordion: {
    background: '#bbb',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  answerLimitInput: {
    marginRight: '1rem',
  },
};

export default function EditCategorizedCheckBoxQuestion({
  section,
  disabled,
  onChange,
}: Props) {
  const { tr, initializeLocalizedObject, surveyLanguage } = useTranslations();
  function clampValue(value: number, min: number, max: number) {
    return value === null ? null : Math.max(Math.min(max, value), min);
  }

  function handleAnswerLimitsMinChange(value: number) {
    // Clamp value between 1 and amount of options
    const min = clampValue(value, 1, section.options.length);
    // Accept original max value when 1) new min is empty, 2) old max was empty, or 3) old max is greater than new min
    const max =
      min === null ||
      section.answerLimits.max === null ||
      section.answerLimits.max >= min
        ? section.answerLimits.max
        : min;
    onChange({
      ...section,
      answerLimits: {
        min,
        max,
      },
    });
  }

  function handleAnswerLimitsMaxChange(value: number) {
    // Clamp value between 1 and amount of options
    const max = clampValue(value, 1, section.options.length);
    // Accept original min value when 1) new max is empty, 2) old min was empty, or 3) old min is smaller than new max
    const min =
      max === null ||
      section.answerLimits.min === null ||
      section.answerLimits.min <= max
        ? section.answerLimits.min
        : max;
    onChange({
      ...section,
      answerLimits: {
        min,
        max,
      },
    });
  }

  return (
    <>
      <FormGroup row>
        <FormControlLabel
          control={
            <Checkbox
              name="limit-answers"
              disabled={disabled}
              checked={Boolean(section.answerLimits)}
              onChange={(event) => {
                onChange({
                  ...section,
                  answerLimits: event.target.checked
                    ? {
                        min: null,
                        max: null,
                      }
                    : null,
                });
              }}
            />
          }
          label={tr.SurveySections.limitAnswers}
        />
      </FormGroup>
      {section.answerLimits && (
        <FormGroup row>
          <TextField
            id="min-answers"
            disabled={disabled}
            sx={styles.answerLimitInput}
            type="number"
            variant="standard"
            label={tr.SurveySections.minAnswers}
            slotProps={{ inputLabel: { shrink: true } }}
            value={section.answerLimits?.min ?? ''}
            onChange={(event) => {
              handleAnswerLimitsMinChange(
                !event.target.value.length ? null : Number(event.target.value),
              );
            }}
          />
          <TextField
            id="max-answers"
            disabled={disabled}
            type="number"
            variant="standard"
            label={tr.SurveySections.maxAnswers}
            slotProps={{ inputLabel: { shrink: true } }}
            value={section.answerLimits?.max ?? ''}
            onChange={(event) => {
              handleAnswerLimitsMaxChange(
                !event.target.value.length ? null : Number(event.target.value),
              );
            }}
          />
        </FormGroup>
      )}
      <Stack gap={1}>
        <Typography sx={{ fontWeight: 500, fontSize: '1.125rem' }}>
          {tr.EditCategorizedCheckBoxQuestion.categoryGroupsLabel}
        </Typography>
        <EditCategoryGroups
          categoryGroups={section.categoryGroups}
          handleCategoryGroupAdd={() =>
            onChange({
              ...section,
              categoryGroups: [
                ...section.categoryGroups,
                {
                  id: crypto.randomUUID(),
                  idx: section.categoryGroups.length,
                  name: initializeLocalizedObject('Nimetön luokitus'),
                  categories: [],
                },
              ],
            })
          }
          handleCategoryAdd={(groupId, category) => {
            onChange({
              ...section,
              categoryGroups: section.categoryGroups.map((group) => {
                if (group.id === groupId) {
                  return {
                    ...group,
                    categories: [
                      ...group.categories,
                      {
                        id: crypto.randomUUID(),
                        name: {
                          ...initializeLocalizedObject(''),
                          [surveyLanguage]: category,
                        },
                      },
                    ],
                  };
                }
                return group;
              }),
            });
          }}
          handleCategoryDelete={(groupId, categoryId) => {
            onChange({
              ...section,
              categoryGroups: section.categoryGroups.map((group) => {
                if (group.id === groupId) {
                  return {
                    ...group,
                    categories: group.categories.filter(
                      (category) => category.id !== categoryId,
                    ),
                  };
                }
                return group;
              }),
            });
          }}
          handleCategoryGroupDelete={(groupId) => {
            onChange({
              ...section,
              categoryGroups: section.categoryGroups.filter(
                (group) => group.id !== groupId,
              ),
            });
          }}
          handleCategoryGroupEdit={(groupId, name) => {
            onChange({
              ...section,
              categoryGroups: section.categoryGroups.map((group) => {
                if (group.id === groupId) {
                  return {
                    ...group,
                    name: initializeLocalizedObject(name),
                  };
                }
                return group;
              }),
            });
          }}
        />
      </Stack>
      <CategorizedQuestionOptions
        options={section.options}
        optionCategoryGroups={section.categoryGroups}
        disabled={disabled}
        onChange={(options) => {
          onChange({
            ...section,
            options,
          });
        }}
        title={tr.SurveySections.options}
        enableClipboardImport={true}
        allowOptionInfo
      />
    </>
  );
}
