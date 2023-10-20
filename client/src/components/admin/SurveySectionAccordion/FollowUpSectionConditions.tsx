import { Condition, SurveyFollowUpSection } from '@interfaces/survey';
import {
  FormControl,
  FormGroup,
  FormLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useSurvey } from '@src/stores/SurveyContext';
import { useTranslations } from '@src/stores/TranslationContext';
import { assertNever, isNumeric } from '@src/utils/typeCheck';
import React, { useState } from 'react';

type RowCondition = Exclude<
  Condition,
  {
    type: 'isFallback';
    value: boolean;
  }
>;

interface ConditionRowProps {
  label: string;
  updateCondition: (updatedCondition: Condition) => void;
  condition: RowCondition;
}

function ConditionRow({
  label,
  updateCondition,
  condition,
}: ConditionRowProps) {
  const { tr } = useTranslations();
  const [error, setError] = useState(false);

  const [selectedCondition, setSelectedCondition] =
    useState<RowCondition>(condition);

  function handleConditionValueChange(value: string | number) {
    if (!selectedCondition.type) return;

    switch (selectedCondition.type) {
      case 'equals':
        updateCondition({ ...selectedCondition, value: value });
        setSelectedCondition({ ...selectedCondition, value: value });
        break;
      case 'greaterThan':
      case 'lessThan':
        setError(false);
        if (value !== '' && !isNumeric(value)) {
          setError(true);
          return;
        }

        updateCondition({
          ...selectedCondition,
          value: value === '' ? null : Number(value),
        });
        setSelectedCondition({
          ...selectedCondition,
          value: value === '' ? null : Number(value),
        });
        break;
      default:
        assertNever(selectedCondition);
    }
  }

  return (
    <FormControl
      sx={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        display: 'flex',
        gap: '6px',
        marginTop: '5px',
      }}
    >
      <FormLabel
        sx={{
          flex: 1,
          color: '#000',
          textAlign: 'right',
          transform: 'translateY(50%)',
        }}
      >
        {label}
      </FormLabel>
      <Select
        sx={{
          flex: 2,
          backgroundColor: 'white',
          '& .MuiSelect-select': { paddingY: '0.75rem' },
        }}
        displayEmpty
        value={selectedCondition?.type ?? ''}
        label={
          selectedCondition?.type
            ? tr.FollowUpSection.conditions.types[selectedCondition.type]
            : ''
        }
        input={<OutlinedInput />}
        renderValue={(selected) => {
          if (!selected || selected.length === 0) {
            return (
              <Typography sx={{ color: '#00000061' }}>
                {tr.FollowUpSection.conditions.chooseCondition}
              </Typography>
            );
          } else {
            return tr.FollowUpSection.conditions.types[selected];
          }
        }}
        onChange={(event) => {
          setSelectedCondition({
            type: event.target.value as RowCondition['type'],
            value: null,
          });
          setError(false);
        }}
      >
        {Object.entries(tr.FollowUpSection.conditions.types).map(
          ([key, value], index) => (
            <MenuItem value={key} key={index}>
              {value}
            </MenuItem>
          ),
        )}
      </Select>
      <TextField
        disabled={!selectedCondition.type}
        error={error}
        helperText={error && tr.FollowUpSection.conditions.validationError}
        value={selectedCondition?.value ?? ''}
        placeholder={tr.FollowUpSection.conditions.insertValue}
        onChange={(event) => handleConditionValueChange(event.target.value)}
        sx={{
          '& .MuiInputBase-root': { backgroundColor: 'white' },
          '& .MuiInputBase-input': { paddingY: '0.75rem' },
          '& .MuiFormHelperText-root': { backgroundColor: '' },
        }}
      />
    </FormControl>
  );
}

interface Props {
  pageId: number;
  parentSectionId: number;
  followUpSection: SurveyFollowUpSection;
}

export function FollowUpSectionConditions({
  pageId,
  parentSectionId,
  followUpSection,
}: Props) {
  const { tr } = useTranslations();
  const { editFollowUpSection } = useSurvey();
  //const [conditionSequence, setConditionSequence] = useState(-1);
  const conditions = followUpSection?.conditions ?? [];

  type Connective = typeof followUpSection.connective;

  const [connective, setConnective] = useState<Connective>(
    followUpSection?.connective ?? 'otherFollowupsNotMet',
  );

  return (
    <FormGroup>
      <FormControl
        fullWidth
        sx={{ flexDirection: 'row', gap: '6px', alignItems: 'center' }}
      >
        <FormLabel sx={{ fontWeight: 700, flex: 1, color: '#000' }}>
          {tr.FollowUpSection.conditions.connectiveTitle}
        </FormLabel>
        <Select
          sx={{
            flex: 2,
            backgroundColor: 'white',
            '& .MuiSelect-select': { paddingY: '0.75rem' },
          }}
          value={connective}
          label={connective}
          input={<OutlinedInput />}
          onChange={(event) => {
            editFollowUpSection(pageId, parentSectionId, {
              ...followUpSection,
              connective: event.target.value as Connective,
            });
            setConnective(event.target.value as Connective);
          }}
        >
          {Object.entries(tr.FollowUpSection.conditions.connectives).map(
            ([key, value], index) =>
              key === 'title' ? (
                ''
              ) : (
                <MenuItem value={key} key={index}>
                  {value}
                </MenuItem>
              ),
          )}
        </Select>
      </FormControl>
      <FormControl
        fullWidth
        sx={{
          marginTop: '10px',
        }}
      >
        {connective !== 'otherFollowupsNotMet' &&
          conditions?.[0]?.type !== 'isFallback' && (
            <>
              {conditions.map((condition: RowCondition, index) => (
                <ConditionRow
                  condition={condition}
                  updateCondition={(updatedCondition) => {
                    editFollowUpSection(pageId, parentSectionId, {
                      ...followUpSection,
                      conditions: conditions.map((cond, i) =>
                        i === index ? updatedCondition : cond,
                      ),
                    });
                  }}
                  key={index}
                  label={
                    index === 0
                      ? tr.FollowUpSection.conditions.answer
                      : `${tr.FollowUpSection.conditions.connectiveConjunctions[connective]} ${tr.FollowUpSection.conditions.answer}`
                  }
                />
              ))}
              {(conditions?.length === 0 ||
                (conditions.slice(-1)[0].value !== null &&
                  conditions.slice(-1)[0].value !== '')) && (
                <ConditionRow
                  key={conditions.length}
                  condition={{ type: null, value: null }}
                  updateCondition={(updatedCondition) => {
                    editFollowUpSection(pageId, parentSectionId, {
                      ...followUpSection,
                      conditions: followUpSection.conditions?.concat(
                        updatedCondition,
                      ) ?? [updatedCondition],
                    });
                  }}
                  label={
                    !conditions?.length || conditions.length === 0
                      ? tr.FollowUpSection.conditions.answer
                      : `${tr.FollowUpSection.conditions.connectiveConjunctions[connective]} ${tr.FollowUpSection.conditions.answer}`
                  }
                />
              )}
            </>
          )}
      </FormControl>
    </FormGroup>
  );
}
