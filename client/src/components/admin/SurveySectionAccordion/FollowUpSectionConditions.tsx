import {
  Conditions,
  SectionOption,
  SurveyFollowUpSection,
  SurveyPageSection,
} from '@interfaces/survey';
import {
  FormControl,
  FormGroup,
  FormLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { useSurvey } from '@src/stores/SurveyContext';
import { useTranslations } from '@src/stores/TranslationContext';
import { isNumeric } from '@src/utils/typeCheck';
import React, { useState } from 'react';

interface RowProps {
  label: string;
  conditionIsNumeric?: boolean;
  options?: SectionOption[];
  conditions?: Conditions;
  textFieldValue?: number | string;
  onInput: (values: number[]) => void;
  allowCustomAnswer?: boolean;
}

function ConditionRow({
  label,
  conditionIsNumeric = false,
  options,
  conditions,
  onInput,
  textFieldValue = '',
  allowCustomAnswer = false,
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
          textAlign: 'right',
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
            '& .MuiInputBase-root': { backgroundColor: 'white' },
            '& .MuiInputBase-input': { paddingY: '0.75rem' },
            '& .MuiFormHelperText-root': { backgroundColor: '' },
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
          value={conditions.equals}
          onChange={(event) => {
            let { value } = event.target;
            // On autofill we get a stringified value.
            if (typeof value === 'string') {
              value = value.split(',').map((v) => Number(v));
            }
            onInput(value);
          }}
        >
          {options.map((option) => (
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

interface Props {
  pageId: number;
  parentSection: Extract<
    SurveyPageSection,
    { type: 'numeric' | 'slider' | 'checkbox' | 'radio' }
  >;
  followUpSection: SurveyFollowUpSection;
}

export function FollowUpSectionConditions({
  pageId,
  parentSection,
  followUpSection,
}: Props) {
  const { tr } = useTranslations();
  const { editFollowUpSection } = useSurvey();

  const parentIsNumeric =
    parentSection.type === 'numeric' || parentSection.type === 'slider';

  return (
    <FormGroup>
      <ConditionRow
        allowCustomAnswer={
          !(
            parentSection.type === 'numeric' || parentSection.type === 'slider'
          ) && parentSection?.allowCustomAnswer
        }
        conditionIsNumeric={parentIsNumeric}
        label={tr.FollowUpSection.conditions.types.equals}
        options={
          parentSection.type === 'numeric' || parentSection.type === 'slider'
            ? []
            : parentSection.options
        }
        conditions={followUpSection.conditions}
        textFieldValue={followUpSection.conditions.equals[0]}
        onInput={(values) =>
          editFollowUpSection(pageId, parentSection.id, {
            ...followUpSection,
            conditions: { ...followUpSection.conditions, equals: values },
          })
        }
      />
      {parentIsNumeric && (
        <>
          <ConditionRow
            conditionIsNumeric
            label={tr.FollowUpSection.conditions.types.greaterThan}
            textFieldValue={followUpSection.conditions.greaterThan[0]}
            onInput={(values) =>
              editFollowUpSection(pageId, parentSection.id, {
                ...followUpSection,
                conditions: {
                  ...followUpSection.conditions,
                  greaterThan: values,
                },
              })
            }
          />

          <ConditionRow
            conditionIsNumeric
            label={tr.FollowUpSection.conditions.types.lessThan}
            textFieldValue={followUpSection.conditions.lessThan[0]}
            onInput={(values) =>
              editFollowUpSection(pageId, parentSection.id, {
                ...followUpSection,
                conditions: { ...followUpSection.conditions, lessThan: values },
              })
            }
          />
        </>
      )}
    </FormGroup>
  );
}
