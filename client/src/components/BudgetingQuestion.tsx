import { SurveyBudgetingQuestion } from '@interfaces/survey';
import {
  Box,
  FormHelperText,
  InputAdornment,
  LinearProgress,
  linearProgressClasses,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { MarkdownView } from '@src/components/MarkdownView';
import { NumericStepperInput } from '@src/components/NumericStepperInput';
import { SliderWithLimit } from '@src/components/SliderWithLimit';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { useMemo, useState } from 'react';

interface Props {
  question: SurveyBudgetingQuestion;
  value: number[];
  onChange: (value: number[]) => void;
  setDirty: (dirty: boolean) => void;
  readOnly?: boolean;
  validationErrors?: string[];
}

type InputMode = 'absolute' | 'percentage';

function updateValue(value: number[], index: number, targetValue: number) {
  return value.map((v, i) => (i === index ? (targetValue as number) : v));
}

function convertToPercentage(
  absoluteValue: number,
  totalBudget: number,
): number {
  return Math.round((absoluteValue / totalBudget) * 100);
}

/**
 * Convert a percentage value to an absolute monetary value
 * Uses rounding to ensure integer results
 */
function convertFromPercentage(
  percentage: number,
  totalBudget: number,
): number {
  return Math.round((percentage / 100) * totalBudget);
}

export default function BudgetingQuestion({
  question,
  value,
  onChange,
  setDirty,
  readOnly = false,
  validationErrors = [],
}: Props) {
  const { tr, language } = useTranslations();
  const theme = useTheme();
  const [inputMode, setInputMode] = useState<InputMode>('absolute');

  // Calculate total used budget in monetary terms
  // In "direct" mode: values are already monetary amounts
  // In "pieces" mode: values are piece counts, multiply by target prices
  const totalUsedBudget = useMemo(() => {
    if (question.budgetingMode === 'pieces') {
      return value.reduce((sum, pieces, index) => {
        const price = question.targets[index]?.price ?? 0;
        return sum + pieces * price;
      }, 0);
    }
    return value.reduce((sum, item) => item + sum, 0);
  }, [value, question.budgetingMode, question.targets]);

  const handleModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: InputMode | null,
  ) => {
    if (newMode === null || newMode === inputMode) return;

    // When switching TO percentage mode, floor all percentages to integers
    // and update the absolute values in context to match
    if (newMode === 'percentage') {
      const percentages = value.map((val) =>
        Math.floor((val / question.totalBudget) * 100),
      );
      const flooredAbsoluteValues = percentages.map((pct) =>
        Math.round((pct / 100) * question.totalBudget),
      );
      onChange(flooredAbsoluteValues);
    }

    setInputMode(newMode);
  };

  // Display values - convert from absolute to percentage if needed
  const displayValues = useMemo(() => {
    if (inputMode === 'percentage') {
      return value.map((val) => convertToPercentage(val, question.totalBudget));
    }
    return value;
  }, [value, inputMode, question.totalBudget]);

  function getMaxValue() {
    return inputMode === 'percentage' ? 100 : question.totalBudget;
  }

  function getUnit() {
    return inputMode === 'percentage' ? '%' : question.unit;
  }

  function getLimit(index: number) {
    const currentTotal = displayValues.reduce((sum, item) => item + sum, 0);
    const maxValue = getMaxValue();
    return displayValues[index] + maxValue - currentTotal;
  }

  const remainingBudget = question.totalBudget - totalUsedBudget;

  return (
    <>
      <MarkdownView>{question.helperText[language]}</MarkdownView>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, mt: 2 }}>
        <Stack alignItems="center" sx={{ minWidth: '80px' }}>
          <Typography variant="caption" color="text.secondary">
            {tr.BudgetingQuestion.used}
          </Typography>
          <Typography variant="body2">
            {totalUsedBudget} {question.unit}
          </Typography>
        </Stack>

        <LinearProgress
          value={
            question.allocationDirection === 'increasing'
              ? (totalUsedBudget / question.totalBudget) * 100
              : (remainingBudget / question.totalBudget) * 100
          }
          variant="determinate"
          sx={{
            flex: 1,
            height: 16,
            borderRadius: 8,
            [`&.${linearProgressClasses.colorPrimary}`]: {
              backgroundColor: theme.palette.grey[200],
            },
            [`& .${linearProgressClasses.bar}`]: {
              transitionDuration: '0s',
            },
          }}
        />

        <Stack alignItems="center" sx={{ minWidth: '80px' }}>
          <Typography variant="caption" color="text.secondary">
            {tr.BudgetingQuestion.remaining}
          </Typography>
          <Typography variant="body2">
            {remainingBudget} {question.unit}
          </Typography>
        </Stack>

        {question.allowPercentageInput &&
          question.budgetingMode === 'direct' && (
            <ToggleButtonGroup
              value={inputMode}
              exclusive
              onChange={handleModeChange}
              aria-label={tr.BudgetingQuestion.inputModeLabel}
              size="small"
            >
              <ToggleButton
                value="absolute"
                aria-label={tr.BudgetingQuestion.absoluteValuesLabel}
              >
                {question.unit}
              </ToggleButton>
              <ToggleButton
                value="percentage"
                aria-label={tr.BudgetingQuestion.percentageLabel}
              >
                %
              </ToggleButton>
            </ToggleButtonGroup>
          )}
      </Box>

      {question.requireFullAllocation &&
        question.budgetingMode !== 'pieces' && (
          <>
            <FormHelperText sx={{ marginLeft: 0 }}>
              {tr.BudgetingQuestion.fullAllocationRequired}
            </FormHelperText>
            {validationErrors.includes('answerLimits') && (
              <FormHelperText style={visuallyHidden} role="alert">
                {tr.BudgetingQuestion.fullAllocationRequired}
              </FormHelperText>
            )}
          </>
        )}

      {question.budgetingMode === 'pieces' ? (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '150px' }}>
                  {tr.BudgetingQuestion.amount}
                </TableCell>
                <TableCell sx={{ width: 'auto' }}>
                  {tr.BudgetingQuestion.targetName}
                </TableCell>
                <TableCell align="right" sx={{ width: '150px' }}>
                  {tr.BudgetingQuestion.total}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {question.targets.map((target, index) => {
                const pieces = value[index] || 0;
                const price = target.price ?? 0;
                const totalForTarget = pieces * price;
                const currentMonetaryTotal = totalUsedBudget;
                const remainingMonetaryBudget =
                  question.totalBudget - currentMonetaryTotal;
                const maxPieces = Math.floor(
                  (remainingMonetaryBudget + totalForTarget) / price,
                );

                return (
                  <TableRow key={index}>
                    <TableCell sx={{ width: '150px' }}>
                      <NumericStepperInput
                        value={pieces}
                        onChange={(newPieces) => {
                          setDirty(true);
                          onChange(updateValue(value, index, newPieces));
                        }}
                        min={0}
                        max={price > 0 ? maxPieces : Infinity}
                        disabled={readOnly}
                      />
                    </TableCell>
                    <TableCell sx={{ width: 'auto' }}>
                      {target.name[language]}
                      {price > 0 && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ ml: 1 }}
                        >
                          ({price} {question.unit} /{' '}
                          {tr.BudgetingQuestion.perPiece})
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right" sx={{ width: '150px' }}>
                      <Typography variant="body2">
                        {totalForTarget} {question.unit}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 'auto' }}>
                  {tr.BudgetingQuestion.targetName}
                </TableCell>
                <TableCell align="right" sx={{ width: '150px' }}>
                  {tr.KeyValueForm.value}
                </TableCell>
                <TableCell sx={{ width: '50%' }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {question.targets.map((target, index) => {
                const limit = getLimit(index);

                return (
                  <TableRow key={index}>
                    <TableCell sx={{ width: 'auto' }}>
                      {target.name[language]}
                    </TableCell>
                    <TableCell align="right" sx={{ width: '150px' }}>
                      <TextField
                        type="number"
                        value={displayValues[index]}
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>,
                        ) => {
                          setDirty(true);
                          const displayValue = Math.max(
                            0,
                            Math.min(Number(event.target.value), limit),
                          );

                          if (inputMode === 'percentage') {
                            // Convert percentage to absolute value for this item only
                            const absoluteValue = convertFromPercentage(
                              displayValue,
                              question.totalBudget,
                            );
                            onChange(updateValue(value, index, absoluteValue));
                          } else {
                            // Direct absolute value
                            onChange(updateValue(value, index, displayValue));
                          }
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              {getUnit()}
                            </InputAdornment>
                          ),
                        }}
                        sx={{ width: '120px' }}
                        disabled={readOnly}
                        size="small"
                        variant="standard"
                      />
                    </TableCell>
                    <TableCell sx={{ width: '50%' }}>
                      <SliderWithLimit
                        value={displayValues[index]}
                        max={getMaxValue()}
                        limit={limit}
                        onChange={(displayValue) => {
                          setDirty(true);

                          if (inputMode === 'percentage') {
                            // Convert percentage to absolute value for this item only
                            const absoluteValue = convertFromPercentage(
                              displayValue,
                              question.totalBudget,
                            );
                            onChange(updateValue(value, index, absoluteValue));
                          } else {
                            // Direct absolute value
                            onChange(updateValue(value, index, displayValue));
                          }
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
}
