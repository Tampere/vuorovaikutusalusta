import { SurveyFollowUpSection, SurveyPageSection } from '@interfaces/survey';
import { Alert, Box, FormGroup, Typography } from '@mui/material';
import { useSurvey } from '@src/stores/SurveyContext';
import { useTranslations } from '@src/stores/TranslationContext';

import React from 'react';
import { ConditionRow } from '../ConditionRow';

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
    <>
      {parentSection.type === 'slider' &&
        parentSection.presentationType === 'literal' && (
          <Alert
            sx={{ marginBottom: '0.5rem' }}
            variant="standard"
            severity="info"
          >
            {tr.FollowUpSectionConditions.literalInfo}
          </Alert>
        )}
      <FormGroup>
        <Typography sx={{ fontWeight: 700 }}>
          {parentIsNumeric
            ? tr.FollowUpSection.conditions.labelForMultiple
            : tr.FollowUpSection.conditions.labelForSingle}
        </Typography>
        <ConditionRow
          allowCustomAnswer={
            !(
              parentSection.type === 'numeric' ||
              parentSection.type === 'slider'
            ) && parentSection?.allowCustomAnswer
          }
          conditionIsNumeric={parentIsNumeric}
          label={
            tr.FollowUpSection.conditions.types[
              parentIsNumeric ? 'equals' : 'contains'
            ]
          }
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
          <Box
            component={'fieldset'}
            sx={{
              border: 'none',
              margin: 0,
              padding: 0,
              marginTop: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Box
              component={'legend'}
              sx={{
                padding: 0,
                float: 'left',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ fontWeight: 'bold' }}>
                {tr.FollowUpSection.conditions.types.or}
              </span>{' '}
              {tr.FollowUpSection.conditions.types.between}
            </Box>
            <ConditionRow
              hideLabel
              labelStyle={{ flex: '0 1 auto' }}
              rootStyle={{ marginTop: 0 }}
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
            <span>{'–'}</span>
            <ConditionRow
              conditionIsNumeric
              hideLabel
              label={tr.FollowUpSection.conditions.types.lessThan}
              labelStyle={{ flex: '0 1 auto' }}
              rootStyle={{ marginTop: 0 }}
              textFieldValue={followUpSection.conditions.lessThan[0]}
              onInput={(values) =>
                editFollowUpSection(pageId, parentSection.id, {
                  ...followUpSection,
                  conditions: {
                    ...followUpSection.conditions,
                    lessThan: values,
                  },
                })
              }
            />
          </Box>
        )}
      </FormGroup>
    </>
  );
}
