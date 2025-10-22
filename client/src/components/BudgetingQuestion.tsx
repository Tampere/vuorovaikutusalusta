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
  Typography,
  useTheme,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { MarkdownView } from '@src/components/MarkdownView';
import { NumericStepperInput } from '@src/components/NumericStepperInput';
import { SliderWithLimit } from '@src/components/SliderWithLimit';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { useMemo } from 'react';

interface Props {
  question: SurveyBudgetingQuestion;
  value: number[];
  onChange: (value: number[]) => void;
  setDirty: (dirty: boolean) => void;
  readOnly?: boolean;
  validationErrors?: string[];
}

function updateValue(value: number[], index: number, targetValue: number) {
  return value.map((v, i) => (i === index ? (targetValue as number) : v));
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

  // Use the author-configured input mode, defaulting to absolute
  const inputMode = question.inputMode ?? 'absolute';

  // Calculate total used budget in monetary terms
  // In "pieces" mode: values are piece counts, multiply by target prices
  // In "percentage" mode: convert percentage sum to monetary value
  // In "absolute" mode: values are already monetary amounts
  const totalUsedBudget = useMemo(() => {
    if (question.budgetingMode === 'pieces') {
      return value.reduce((sum, pieces, index) => {
        const price = question.targets[index]?.price ?? 0;
        return sum + pieces * price;
      }, 0);
    }

    if (inputMode === 'percentage') {
      // Percentage mode: convert percentage sum to monetary value
      // Use floating-point math for accurate display
      const percentageSum = value.reduce((sum, pct) => sum + pct, 0);
      return (percentageSum / 100) * question.totalBudget;
    }

    // Absolute mode: values are already monetary
    return value.reduce((sum, item) => item + sum, 0);
  }, [
    value,
    question.budgetingMode,
    question.targets,
    question.totalBudget,
    inputMode,
  ]);

  // Display values are stored directly as entered (no conversion needed)
  const displayValues = value;

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

  // Round the budget values for display (no decimals)
  const displayUsedBudget = Math.round(totalUsedBudget);
  const displayRemainingBudget = Math.round(remainingBudget);

  // Format numbers with thousands separators using browser locale
  const numberFormatter = useMemo(
    () =>
      new Intl.NumberFormat(navigator.language, {
        maximumFractionDigits: 0,
      }),
    [],
  );

  // Format slider tooltip with number formatting and unit
  const formatSliderTooltip = (value: number) => {
    return `${numberFormatter.format(value)} ${getUnit()}`;
  };

  // Decide whether to use formatted text input or native number input
  // Use formatted input only for large budgets (≥1000) in absolute mode
  // Percentages (0-100) don't need formatting
  const useFormattedInput =
    inputMode === 'absolute' && question.totalBudget >= 1000;

  return (
    <>
      <MarkdownView>{question.helperText[language]}</MarkdownView>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, mt: 2 }}>
        <Stack alignItems="center" sx={{ minWidth: '80px' }}>
          <Typography variant="caption" color="text.secondary">
            {tr.BudgetingQuestion.used}
          </Typography>
          <Typography variant="body2">
            {numberFormatter.format(displayUsedBudget)} {question.unit}
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
            {numberFormatter.format(displayRemainingBudget)} {question.unit}
          </Typography>
        </Stack>
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
                          ({numberFormatter.format(price)} {question.unit} /{' '}
                          {tr.BudgetingQuestion.perPiece})
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right" sx={{ width: '150px' }}>
                      <Typography variant="body2">
                        {numberFormatter.format(totalForTarget)} {question.unit}
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
                        type={useFormattedInput ? 'text' : 'number'}
                        value={
                          useFormattedInput
                            ? numberFormatter.format(displayValues[index])
                            : displayValues[index]
                        }
                        onChange={(event) => {
                          setDirty(true);
                          let displayValue: number;

                          if (useFormattedInput) {
                            // Remove all non-digit characters for parsing
                            const numericValue = event.target.value.replace(
                              /\D/g,
                              '',
                            );
                            displayValue = Math.max(
                              0,
                              Math.min(Number(numericValue) || 0, limit),
                            );
                          } else {
                            // Native number input
                            displayValue = Math.max(
                              0,
                              Math.min(Number(event.target.value), limit),
                            );
                          }

                          // Store value directly as entered (no conversion)
                          onChange(updateValue(value, index, displayValue));
                        }}
                        inputProps={
                          useFormattedInput
                            ? {
                                inputMode: 'numeric',
                              }
                            : undefined
                        }
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
                          // Store value directly as entered (no conversion)
                          onChange(updateValue(value, index, displayValue));
                        }}
                        valueLabelFormat={formatSliderTooltip}
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
