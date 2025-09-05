import {
  SectionOption,
  SectionOptionCategoryGroup,
  SurveyCategorizedCheckboxQuestion,
} from '@interfaces/survey';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  Theme,
  Typography,
  useTheme,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { visuallyHidden } from '@mui/utils';

import { useTranslations } from '@src/stores/TranslationContext';
import React, { createRef, useEffect, useMemo, useRef, useState } from 'react';
import SectionInfo from './SectionInfo';

const mobileBreakPoint = 500;

const styles = (theme: Theme, isFollowUp?: boolean) => ({
  accordion: {
    '&:before': { display: 'none' },
    background: 'inherit',
  },
  accordionSummary: {
    justifyContent: 'flex-start',
    '& .MuiAccordionSummary-content': {
      width: 'fit-content',
    },
    fontFamily: 'inherit',
    fontSize: 'inherit',
  },

  indicatorNumbers: {
    fontWeight: 'bold',
    color: '#22437b',
    '&.max-reached': {
      color: '#22437b',
    },
  },
  secondaryText: {
    fontSize: '0.875rem',
  },
  errorText: {
    color: theme.palette.error.main,
  },
  themeColor: {
    color: theme.palette.primary.main,
  },
});

interface CategoriesSelectProps {
  categoryGroups: SectionOptionCategoryGroup[];
  optionCount: number;
  maxAnswerCount?: number;
  onCategoryChange: (categoryId: string, selected: boolean) => void;
  selectedFilters: string[];
  isFollowUp?: boolean;
}

function CategoriesSelect({
  categoryGroups,
  optionCount,
  maxAnswerCount,
  onCategoryChange,
  selectedFilters,
  isFollowUp,
}: CategoriesSelectProps) {
  const { surveyLanguage, tr } = useTranslations();

  return (
    <Accordion
      disableGutters
      square
      elevation={0}
      sx={(theme) => ({
        ...styles(theme).accordion,
        border: `1px solid ${theme.palette.divider}`,
      })}
      slotProps={{ heading: { component: 'div' } }}
    >
      <AccordionSummary
        sx={(theme) => ({
          ...styles(theme).accordionSummary,
          justifyContent: 'space-between',
          fontWeight: 500,
          color: theme.palette.primary.main,
        })}
        expandIcon={<ExpandMore />}
      >
        {tr.CategorizedCheckBoxQuestion.categorySelectLabel}
      </AccordionSummary>
      <AccordionDetails>
        <Stack gap={2}>
          <Typography sx={(theme) => styles(theme, isFollowUp).secondaryText}>
            {maxAnswerCount
              ? tr.CategorizedCheckBoxQuestion.categorySelectDescriptionLimited
                  .replace('{0}', optionCount.toString())
                  .replace('{1}', maxAnswerCount.toString())
              : tr.CategorizedCheckBoxQuestion.categorySelectDescription.replace(
                  '{x}',
                  optionCount.toString(),
                )}
          </Typography>
          <Typography sx={(theme) => styles(theme, isFollowUp).secondaryText}>
            {tr.CategorizedCheckBoxQuestion.categorySelectDescriptionSecondary}
          </Typography>
          <Typography sx={(theme) => styles(theme, isFollowUp).secondaryText}>
            {tr.CategorizedCheckBoxQuestion.categorySelectDescriptionTertiary}
          </Typography>
          <Stack gap={2}>
            {categoryGroups.map((group) => (
              <Stack
                component={'fieldset'}
                key={group.id}
                sx={{ border: 'none' }}
              >
                <Box component={'legend'} sx={{ fontWeight: 500 }}>
                  {group.name[surveyLanguage]}
                </Box>
                <Box display="flex" flexWrap="wrap">
                  {group.categories.map((category) => (
                    <FormControlLabel
                      key={category.id}
                      control={
                        <Checkbox
                          checked={selectedFilters.includes(category.id)}
                          onChange={(e) =>
                            onCategoryChange(category.id, e.target.checked)
                          }
                          sx={{ paddingY: '0.25rem' }}
                        />
                      }
                      label={category.name[surveyLanguage]}
                    />
                  ))}
                </Box>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

interface OptionProps extends Props {
  maxReached: boolean;
  checkBoxInputRef: React.RefObject<any[]>;
  actionRef: React.RefObject<any[]>;
  index: number;
  option: SectionOption;
  isVisible: boolean;
  onHiddenChange: () => void;
}

function Option({
  option,
  readOnly,
  maxReached,
  value,
  checkBoxInputRef,
  question,
  index,
  actionRef,
  autoFocus,
  setDirty,
  onChange,
  selectedFilters,
  isVisible,
  onHiddenChange,
}: OptionProps) {
  const { tr, surveyLanguage } = useTranslations();
  const theme = useTheme();

  return (
    <Box
      key={option.id}
      display="flex"
      gap={1}
      sx={(theme) => ({
        containerType: 'inline-size',
        [theme.containerQueries.down(mobileBreakPoint)]: {
          flexDirection: 'column',
          marginBottom: theme.spacing(1),
          gap: 0,
          '& button': {
            width: 'fit-content',
          },
        },
      })}
    >
      <Box display="flex" alignItems={'center'}>
        <FormControlLabel
          sx={{ marginRight: 0 }}
          label={option.text?.[surveyLanguage] ?? ''}
          disabled={readOnly || (maxReached && !value.includes(option.id))}
          control={
            <Checkbox
              sx={(theme) => ({
                [theme.containerQueries.down(mobileBreakPoint)]: {
                  paddingY: 0,
                },
              })}
              slotProps={{
                input: {
                  'aria-describedby': `${question.id}-indicator`,
                  ref: checkBoxInputRef.current[index],
                },
              }}
              action={actionRef.current[index]}
              autoFocus={index === 0 && autoFocus}
              // TS can't infer the precise memoized value type from question.type, but for checkboxes it's always an array
              checked={value.includes(option.id)}
              onChange={(event) => {
                setDirty(true);
                const newValue = event.currentTarget.checked
                  ? // Add the value to the selected options
                    [...value, option.id]
                  : // Filter out the value from the selected options
                    value.filter((optionId) => optionId !== option.id);
                onChange(newValue, selectedFilters);
              }}
              name={option.text?.[surveyLanguage]}
            />
          }
        />
        {option.info?.[surveyLanguage] && (
          <SectionInfo
            sx={{
              '& .MuiButtonBase-root': {
                paddingY: 0,
              },
              [theme.containerQueries.down(mobileBreakPoint)]: {
                marginLeft: 'auto',
              },
            }}
            infoText={option.info?.[surveyLanguage]}
            subject={option.text?.[surveyLanguage]}
          />
        )}
      </Box>

      {!readOnly && (
        <>
          <Box
            aria-hidden="true"
            component="span"
            sx={(theme) => ({
              display: 'flex',
              alignItems: 'center',
              [theme.containerQueries.down(mobileBreakPoint)]: {
                display: 'none',
              },
            })}
          >
            –
          </Box>
          <Button
            aria-description={option.text?.[surveyLanguage]}
            sx={(theme) => ({
              paddingLeft: 0,
              [theme.containerQueries.down(mobileBreakPoint)]: {
                paddingTop: 0,
                marginBottom: theme.spacing(0.5),
              },
            })}
            variant="text"
            onClick={() => {
              onHiddenChange();
            }}
          >
            {isVisible
              ? tr.CategorizedCheckBoxQuestion.hideOption
              : tr.CategorizedCheckBoxQuestion.showOption}
          </Button>
        </>
      )}
    </Box>
  );
}

interface Props {
  value: number[];
  selectedFilters: string[];
  onChange: (value: number[], filters: string[]) => void;
  question: SurveyCategorizedCheckboxQuestion;
  setDirty: (dirty: boolean) => void;
  readOnly: boolean;
  validationErrors?: string[];
  autoFocus?: boolean;
  isFollowUp?: boolean;
}

export function CategorizedCheckBoxQuestion({
  value,
  selectedFilters,
  onChange,
  question,
  setDirty,
  readOnly,
  validationErrors,
  autoFocus,
  isFollowUp,
}: Props) {
  const { tr, surveyLanguage } = useTranslations();
  const [hiddenOptions, setHiddenOptions] = useState<
    (typeof question)['options']
  >([]);

  const visibleOptions = question.options.filter(
    (option) => !hiddenOptions.includes(option),
  );

  const actionRef = useRef([]);
  const checkBoxInputRef = useRef([]);

  actionRef.current = visibleOptions.map(
    (_, i) => actionRef.current[i] ?? createRef(),
  );

  checkBoxInputRef.current = visibleOptions.map(
    (_, i) => checkBoxInputRef.current[i] ?? createRef(),
  );

  useEffect(() => {
    // autoFocus prop won't trigger focus styling, must be done manually
    autoFocus && actionRef.current[0]?.current.focusVisible();
  }, []);

  const maxReached = useMemo(() => {
    return question.answerLimits && value.length >= question.answerLimits.max;
  }, [question.answerLimits, value]);

  // Split the indicator text into two parts for displaying a colored indicator in between
  const [indicatorTextStart, indicatorTextEnd] = useMemo(() => {
    return (
      maxReached
        ? tr.GroupedCheckBoxQuestion.indicatorTextMaxReached
        : tr.GroupedCheckBoxQuestion.indicatorText
    ).split('{numbers}');
  }, [tr, maxReached]);

  function handleCategoryFilterChange(categoryId: string, isSelected: boolean) {
    const newSelectedFilters = isSelected
      ? [...selectedFilters, categoryId]
      : selectedFilters.filter((id) => id !== categoryId);

    const filterByGroups = question.categoryGroups.map((group) =>
      group.categories
        .map((category) => category.id)
        .filter((category) => newSelectedFilters.includes(category)),
    );

    const optionIdsToShow = question.options
      .filter((option) => {
        const optionCategoryIds = option.categories?.map((id) => id) ?? [];
        return filterByGroups.every(
          (group) =>
            group.length === 0 ||
            group.some((catId) => optionCategoryIds.includes(catId)),
        );
      })
      .map((option) => option.id);

    setHiddenOptions(
      question.options.filter((option) => !optionIdsToShow.includes(option.id)),
    );

    onChange(value, newSelectedFilters);
  }

  const answerLimitText =
    question.answerLimits?.min && question.answerLimits?.max
      ? // Both min & max limits are set
        tr.GroupedCheckBoxQuestion.helperTextMinMax
          .replace('{min}', question.answerLimits.min.toString())
          .replace('{max}', question.answerLimits.max.toString())
      : question.answerLimits?.min
      ? // Only min limit is set
        tr.GroupedCheckBoxQuestion.helperTextMin.replace(
          '{min}',
          question.answerLimits.min.toString(),
        )
      : question.answerLimits?.max
      ? // Only max limit is set
        tr.GroupedCheckBoxQuestion.helperTextMax.replace(
          '{max}',
          question.answerLimits.max.toString(),
        )
      : // No limits are set
        tr.GroupedCheckBoxQuestion.helperText;

  return (
    <Box
      sx={(theme) => ({
        marginTop: theme.spacing(1),
        containerType: 'inline-size',
      })}
    >
      {!readOnly && (
        <CategoriesSelect
          selectedFilters={selectedFilters}
          onCategoryChange={handleCategoryFilterChange}
          categoryGroups={question.categoryGroups}
          optionCount={question.options.length}
          maxAnswerCount={question.answerLimits?.max}
          isFollowUp={isFollowUp}
        />
      )}
      {!readOnly && (
        <Typography
          sx={(theme) => ({
            marginTop: theme.spacing(2),
            ...styles(theme, isFollowUp).secondaryText,
            ...(validationErrors &&
              validationErrors.includes('answerLimits') &&
              styles(theme).errorText),
          })}
        >
          {answerLimitText}
        </Typography>
      )}
      {validationErrors && validationErrors.includes('answerLimits') && (
        <Typography style={visuallyHidden} role="alert">
          {`${question.title?.[surveyLanguage]}, ${answerLimitText}`}
        </Typography>
      )}
      <Typography
        sx={(theme) => ({
          ...styles(theme, isFollowUp).secondaryText,
          marginTop: theme.spacing(1),
          marginBottom: theme.spacing(2),
        })}
        id={`${question.id}-indicator`}
      >
        {indicatorTextStart}
        <Box
          sx={(theme) => styles(theme).indicatorNumbers}
          component="span"
          className={[maxReached && 'max-reached'].filter(Boolean).join(' ')}
        >
          {value.length}
          {question.answerLimits?.max && `/${question.answerLimits.max}`}
        </Box>
        {indicatorTextEnd}
      </Typography>
      {visibleOptions.map((option, index) => (
        <Option
          key={option.id}
          option={option}
          readOnly={readOnly}
          maxReached={maxReached}
          value={value}
          checkBoxInputRef={checkBoxInputRef}
          question={question}
          index={index}
          actionRef={actionRef}
          autoFocus={autoFocus && index === 0}
          setDirty={setDirty}
          onChange={onChange}
          selectedFilters={selectedFilters}
          isVisible
          onHiddenChange={() => {
            const toFocusIndex =
              index === visibleOptions.length - 1 ? index - 1 : index + 1;
            // For screen readers

            checkBoxInputRef.current[toFocusIndex]?.current?.focus();
            setHiddenOptions((prev) => [...prev, option]);
          }}
        />
      ))}
      <Box aria-live="polite">
        {hiddenOptions.length > 0 && (
          <Accordion
            disableGutters
            elevation={0}
            sx={(theme) => styles(theme).accordion}
            slotProps={{ heading: { component: 'div' } }}
          >
            <AccordionSummary
              sx={(theme) => ({
                ...styles(theme).accordionSummary,
                fontWeight: 500,
                color: theme.palette.primary.main,
              })}
              expandIcon={<ExpandMore />}
            >
              {hiddenOptions.length === 1
                ? tr.CategorizedCheckBoxQuestion.singleHiddenOption
                : tr.CategorizedCheckBoxQuestion.hiddenOptions.replace(
                    '{x}',
                    hiddenOptions.length.toString(),
                  )}
            </AccordionSummary>
            <AccordionDetails
              sx={{
                display: 'flex',
                flexDirection: 'column',
                containerType: 'inline-size',
              }}
            >
              {hiddenOptions.map((option, index) => {
                return (
                  <Option
                    key={option.id}
                    option={option}
                    readOnly={readOnly}
                    maxReached={maxReached}
                    value={value}
                    checkBoxInputRef={checkBoxInputRef}
                    question={question}
                    index={index}
                    actionRef={actionRef}
                    autoFocus={autoFocus && index === 0}
                    setDirty={setDirty}
                    onChange={onChange}
                    selectedFilters={selectedFilters}
                    isVisible={false}
                    onHiddenChange={() => {
                      setHiddenOptions((prev) =>
                        prev.filter(
                          (hiddenOption) => hiddenOption.id !== option.id,
                        ),
                      );

                      // For screen readers
                      checkBoxInputRef.current[
                        checkBoxInputRef.current.length - 1
                      ]?.current?.focus();
                    }}
                  />
                );
              })}
            </AccordionDetails>
          </Accordion>
        )}
      </Box>
    </Box>
  );
}
