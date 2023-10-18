import { Condition } from '@interfaces/survey';
import {
  Box,
  FormControl,
  FormLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslations } from '@src/stores/TranslationContext';
import { assertNever, isNumeric } from '@src/utils/typeCheck';
import React, { useState } from 'react';

interface ConditionRowProps {
  label: string;
}

function ConditionRow({ label }: ConditionRowProps) {
  const { tr } = useTranslations();
  const [error, setError] = useState(false);
  type selectableCondition = Exclude<
    Condition,
    {
      type: 'isFallback';
      value: boolean;
    }
  >;

  const [selectedCondition, setSelectedCondition] =
    useState<selectableCondition>({
      type: null,
      value: null,
    });
  console.log(selectedCondition);
  function handleConditionValueChange(value: string | number) {
    console.log(value);
    if (!selectedCondition.type) return;
    console.log('value', value, selectedCondition.type);
    switch (selectedCondition.type) {
      case 'equals':
        setSelectedCondition({ ...selectedCondition, value: value });
        break;
      case 'greaterThan':
      case 'lessThan':
        setError(false);
        if (value !== '' && !isNumeric(value)) {
          setError(true);
          return;
        }

        setSelectedCondition({
          ...selectedCondition,
          value: value === '' ? null : value,
        });
        break;
      default:
        assertNever(selectedCondition);
    }
  }

  return (
    <Box sx={{ alignItems: 'flex-start', display: 'flex', gap: '6px' }}>
      <FormLabel
        sx={{
          flex: 1,
          color: '#000',
          textAlign: 'right',
          transform: 'translateY(50%)',
        }}
      >{`${label} ${tr.FollowUpSection.conditions.answer}`}</FormLabel>
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
            type: event.target.value as selectableCondition['type'],
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
    </Box>
  );
}

export function FollowUpSectionConditions() {
  const { tr } = useTranslations();

  type Connective = keyof typeof tr.FollowUpSection.conditions.connectives;

  const [connective, setConnective] = useState<Connective>(
    'otherFollowupsNotMet',
  );
  const [conditions, setConditions] = useState<Condition[]>([]);
  console.log(connective);
  return (
    <Box>
      <FormControl
        fullWidth
        sx={{ flexDirection: 'row', gap: '6px', alignItems: 'center' }}
      >
        <FormLabel sx={{ fontWeight: 700, flex: 1, color: '#000' }}>
          {tr.FollowUpSection.conditions.connectives.title}
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
          onChange={(event) => setConnective(event.target.value as Connective)}
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
        {connective !== 'otherFollowupsNotMet' && (
          <>
            {conditions.map((condition, index) => (
              <ConditionRow
                key={index}
                label={
                  index === 0
                    ? tr.FollowUpSection.conditions.answer
                    : connective === 'title'
                    ? ''
                    : tr.FollowUpSection.conditions.connectiveConjunctions[
                        connective
                      ]
                }
              />
            ))}
            <ConditionRow
              label={
                conditions.length === 0 || connective === 'title'
                  ? ''
                  : tr.FollowUpSection.conditions.connectiveConjunctions[
                      connective
                    ]
              }
            />
          </>
        )}
      </FormControl>
    </Box>
  );
}

/**
 * 
 * 
 * 
 * handleConditionSelect={(condition: Condition) =>
                    setConditions((prev) => {
                      return prev.map((cond, i) =>
                        i === index ? condition : cond,
                      );
                    })
                  }
 */
