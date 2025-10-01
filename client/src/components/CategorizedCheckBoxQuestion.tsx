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
import React, {
  createRef,
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import SectionInfo from './SectionInfo';
import { orange } from '@mui/material/colors';
import { AnimatePresence, motion } from 'motion/react';
import { mobileTopDrawerHiddenHeight } from './SurveyStepper';

const animationDuration = 0.3;
const mobileBreakPoint = 500;

const styles = (theme: Theme) => ({
  accordion: {
    '&:before': { display: 'none' },
    background: 'inherit',
  },
  accordionSummary: {
    justifyContent: 'flex-start',
    gap: theme.spacing(1),
    '& .MuiAccordionSummary-content': {
      whiteSpace: 'nowrap',
      flex: 0,
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

const MotionButton = motion.create(Button);
const MotionTypography = motion.create(Typography);

interface CategoriesSelectProps {
  categoryGroups: SectionOptionCategoryGroup[];
  optionCount: number;
  maxAnswerCount?: number;
  onCategoryChange: (categoryId: string, selected: boolean) => void;
  selectedFilters: string[];
}

function CategoriesSelect({
  categoryGroups,
  optionCount,
  maxAnswerCount,
  onCategoryChange,
  selectedFilters,
}: CategoriesSelectProps) {
  const { surveyLanguage, tr } = useTranslations();

  return (
    <Accordion
      defaultExpanded
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
          <Typography sx={(theme) => styles(theme).secondaryText}>
            {maxAnswerCount
              ? tr.CategorizedCheckBoxQuestion.categorySelectDescriptionLimited
                  .replace('{0}', optionCount.toString())
                  .replace('{1}', maxAnswerCount.toString())
              : tr.CategorizedCheckBoxQuestion.categorySelectDescription.replace(
                  '{x}',
                  optionCount.toString(),
                )}
          </Typography>
          <Typography sx={(theme) => styles(theme).secondaryText}>
            {tr.CategorizedCheckBoxQuestion.categorySelectDescriptionSecondary}
          </Typography>
          <Typography sx={(theme) => styles(theme).secondaryText}>
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
                <Box display="flex" flexWrap="wrap" gap="0.25rem">
                  {group.categories.map((category) => (
                    <FormControlLabel
                      key={category.id}
                      control={
                        <Checkbox
                          checked={selectedFilters.includes(category.id)}
                          onChange={(e) =>
                            onCategoryChange(category.id, e.target.checked)
                          }
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
  doesNotMatchFilters?: boolean;
  onHiddenChange: () => void;
}

const Option = forwardRef(function Option(
  {
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
    doesNotMatchFilters,
  }: OptionProps,
  ref,
) {
  const [previousValue, setPreviousValue] = useState<number[] | null>(null);
  const [cancelTempHidden, setCancelTempHidden] = useState(false);

  const hiddenOptionRef = useRef<HTMLButtonElement>(null);

  const animationEase = [0.4, 0, 0.2, 1];

  useEffect(() => {
    if (hiddenOptionRef.current && previousValue) {
      hiddenOptionRef.current.focus();
    }
  }, [hiddenOptionRef.current, previousValue]);

  useEffect(() => {
    if (cancelTempHidden && checkBoxInputRef.current[index].current) {
      checkBoxInputRef.current[index].current.focus();
      setCancelTempHidden(false);
    }
  }, [cancelTempHidden, checkBoxInputRef.current[index]]);

  const { tr, surveyLanguage } = useTranslations();
  const theme = useTheme();
  const optionChecked = value.includes(option.id);

  if (previousValue) {
    return (
      <Box
        component={motion.div as any}
        initial={{
          opacity: 0,
          height: 0,
        }}
        animate={{
          opacity: 1,
          height: 'auto',
          transition: {
            default: {
              duration: animationDuration,
              delay: 0,
              ease: animationEase,
            },
          },
        }}
        onMouseLeave={() => {
          onHiddenChange();
        }}
        sx={(theme) => ({
          height: 'auto',
          [theme.containerQueries.down(mobileBreakPoint)]: {
            marginY: '0.5rem',
          },
        })}
        display="flex"
        alignItems={'center'}
        gap={1}
      >
        <Typography sx={{ color: theme.palette.text.secondary }}>
          {tr.CategorizedCheckBoxQuestion.hiddenHelpertext}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      component={motion.div as any}
      {...(!readOnly && {
        initial: {
          opacity: 0,
          height: 0,
          overflow: 'hidden',
          transform: 'translateX(-10%)',
        },
        animate: {
          opacity: 1,
          height: 'auto',
          overflow: 'visible',
          transform: 'translateX(0)',
          transition: {
            height: {
              duration: animationDuration,
              delay: 0,
              ease: animationEase,
            },
            default: {
              duration: animationDuration,
              delay: animationDuration,
              ease: animationEase,
            },
          },
        },
        exit: {
          opacity: 0,
          height: 0,
          margin: 0,
          overflow: 'hidden',
          transform: 'translateX(-10%)',
          transition: {
            height: {
              duration: animationDuration,
              delay: animationDuration,
              ease: animationEase,
            },
            margin: {
              duration: animationDuration,
              delay: animationDuration,
              ease: animationEase,
            },
            default: {
              duration: animationDuration,
              delay: 0,
              ease: animationEase,
            },
          },
        },
      })}
      ref={ref}
      key={option.id}
      display="flex"
      gap={1}
      sx={(theme) => ({
        alignItems: 'center',
        containerType: 'inline-size',
        [theme.containerQueries.down(mobileBreakPoint)]: {
          alignItems: 'flex-start',
          flexDirection: 'column',
          marginY: '0.75rem',
          gap: 0,
        },
      })}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing(1),
        }}
      >
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
              checked={optionChecked}
              onChange={(event) => {
                setDirty(true);
                const newValue = event.currentTarget.checked
                  ? // Add the value to the selected options
                    [...value, option.id]
                  : // Filter out the value from the selected options
                    value.filter((optionId) => optionId !== option.id);

                if (isVisible && doesNotMatchFilters && optionChecked) {
                  setPreviousValue(value);
                }

                onChange(newValue, selectedFilters);
              }}
              name={option.text?.[surveyLanguage]}
            />
          }
        />
        {option.info?.[surveyLanguage] && (
          <SectionInfo
            sx={(theme) => ({
              '& .MuiButtonBase-root': {
                padding: 0,
              },
              [theme.containerQueries.down(mobileBreakPoint)]: {
                marginLeft: 'auto',
              },
              [theme.containerQueries.down(mobileBreakPoint)]: {
                float: 'right',
                marginLeft: 'auto',
              },
            })}
            infoText={option.info?.[surveyLanguage]}
            subject={option.text?.[surveyLanguage]}
          />
        )}
      </Box>

      {!readOnly && (
        <>
          <AnimatePresence>
            {(!optionChecked || doesNotMatchFilters) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
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
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {!optionChecked && (
              <MotionButton
                initial={{ opacity: 0, maxHeight: 0 }}
                animate={{ opacity: 1, maxHeight: '4rem' }}
                exit={{ opacity: 0, maxHeight: 0, marginTop: 0 }}
                aria-description={option.text?.[surveyLanguage]}
                sx={(theme) => ({
                  paddingLeft: 0,
                  [theme.containerQueries.down(mobileBreakPoint)]: {
                    marginTop: '0.5rem',
                    paddingY: 0,
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
              </MotionButton>
            )}{' '}
          </AnimatePresence>
          <AnimatePresence>
            {doesNotMatchFilters && optionChecked && (
              <MotionTypography
                initial={{
                  opacity: 0,
                  maxHeight: 0,
                }}
                animate={{
                  opacity: 1,
                  maxHeight: '4rem',
                  transition: {
                    opacity: { delay: animationDuration },
                  },
                }}
                exit={{
                  opacity: 0,
                  maxHeight: 0,
                  transition: {
                    opacity: { delay: animationDuration },
                  },
                }}
                sx={{
                  color: orange[600],
                  height: 'fit-content',
                }}
              >
                {tr.CategorizedCheckBoxQuestion.doesNotMatchFilters}
              </MotionTypography>
            )}
          </AnimatePresence>
        </>
      )}
    </Box>
  );
});

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
  surveyHasSideSection?: boolean;
}

export function CategorizedCheckBoxQuestion({
  isFollowUp,
  value,
  selectedFilters,
  onChange,
  question,
  setDirty,
  readOnly,
  validationErrors,
  autoFocus,
  surveyHasSideSection,
}: Props) {
  const { tr, surveyLanguage } = useTranslations();
  const [
    visibleOptionsNotMatchingFilters,
    setVisibleOptionsNotMatchingFilters,
  ] = useState<number[]>([]);
  const [hiddenOptions, setHiddenOptions] = useState<
    (typeof question)['options']
  >([]);
  const optionInfoRef = useRef<HTMLDivElement>(null);
  const [optionsInfoSticky, setOptionsInfoSticky] = useState(false);
  const [observer] = useState<IntersectionObserver>(
    () =>
      new IntersectionObserver(
        (entries) => {
          setOptionsInfoSticky(entries[0].boundingClientRect.top < 1);
        },
        {
          rootMargin: '-1px 0px 0px 0px',
          threshold: [1],
        },
      ),
  );

  function getVisibleOptions(hiddenOptions: (typeof question)['options']) {
    return question.options.filter((option) => !hiddenOptions.includes(option));
  }

  const visibleOptions = getVisibleOptions(hiddenOptions);

  const actionRef = useRef([]);
  const checkBoxInputRef = useRef([]);
  const visibleOptionRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);

  visibleOptionRefs.current = visibleOptions.map(
    (_, i) => visibleOptionRefs.current[i] ?? createRef(),
  );

  actionRef.current = visibleOptions.map(
    (_, i) => actionRef.current[i] ?? createRef(),
  );

  checkBoxInputRef.current = visibleOptions.map(
    (_, i) => checkBoxInputRef.current[i] ?? createRef(),
  );

  useEffect(() => {
    if (optionInfoRef.current) {
      observer.observe(optionInfoRef.current);
    }

    return () => {
      if (optionInfoRef.current) {
        observer.unobserve(optionInfoRef.current);
      }
    };
  }, [optionInfoRef.current]);

  useEffect(() => {
    // autoFocus prop won't trigger focus styling, must be done manually
    autoFocus && actionRef.current[0]?.current.focusVisible();
  }, []);

  useEffect(() => {
    updateVisibleOptionsNotMatchingFilters(
      selectedFilters,
      getVisibleOptions(hiddenOptions),
    );
  }, [hiddenOptions, selectedFilters, value]);

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

  function updateVisibleOptionsNotMatchingFilters(
    selectedFilters: string[],
    visibleOptions: (typeof question)['options'],
  ) {
    const filterByGroups = question.categoryGroups.map((group) =>
      group.categories
        .map((category) => category.id)
        .filter((category) => selectedFilters.includes(category)),
    );

    setVisibleOptionsNotMatchingFilters(
      visibleOptions
        .filter((option) => {
          const optionCategoryIds = option.categories?.map((id) => id) ?? [];

          return (
            value.includes(option.id) && // Option checked
            !filterByGroups.every(
              (group) =>
                group.length === 0 ||
                group.some((catId) => optionCategoryIds.includes(catId)),
            )
          );
        })
        .map((option) => option.id),
    );
  }

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

        return (
          value.includes(option.id) || // Option checked
          filterByGroups.every(
            (group) =>
              group.length === 0 ||
              group.some((catId) => optionCategoryIds.includes(catId)),
          )
        );
      })
      .map((option) => option.id);

    onChange(value, newSelectedFilters);
    const newHiddenOptions = question.options.filter(
      (option) => !optionIdsToShow.includes(option.id),
    );

    // Animate the hiding of options
    visibleOptions.forEach((opt, idx) => {
      const element = visibleOptionRefs.current[idx];
      if (
        element.current &&
        newHiddenOptions.findIndex((o) => o.id === opt.id) !== -1
      ) {
        element.current.style.transform = 'translateX(-10%)';
        element.current.style.opacity = '0';
        setTimeout(() => {
          element.current.style.height = '0';
        }, animationDuration);
      }
    });

    // If options are being shown, wait until the hiding animation is done
    if (newHiddenOptions.length > hiddenOptions.length) {
      setTimeout(() => {
        setHiddenOptions(newHiddenOptions);
      }, animationDuration * 2);
    } else {
      setHiddenOptions(newHiddenOptions);
    }
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
        />
      )}
      {!readOnly && (
        <Box
          ref={optionInfoRef}
          sx={(theme) => ({
            minHeight: '3.5rem', // Prevent flickering when becoming sticky
            position: 'sticky',
            top: 0,
            zIndex: 1,

            ...(optionsInfoSticky && {
              border: `1px solid ${theme.palette.grey[400]}`,
              boxShadow: '0px 2px 10px 0px rgba(0, 0, 0, 0.25)',
              marginLeft: isFollowUp ? '-0.75rem' : '-3rem',
              marginRight: isFollowUp
                ? '-0.75rem'
                : surveyHasSideSection
                ? '-1.5rem'
                : 0,
              paddingX: isFollowUp ? '0.75rem' : '3rem',
              background: 'white',
              paddingBottom: 1,
              [theme.breakpoints.down('md')]: {
                ...(surveyHasSideSection && {
                  paddingTop: `${mobileTopDrawerHiddenHeight}px`,
                }),
              },
            }),
          })}
        >
          {optionsInfoSticky && (
            <Typography
              component="p"
              sx={(theme) => ({
                margin: theme.spacing(0.5, 0, 0, 0),
                fontSize: '1.125rem',
              })}
              variant={'questionTitle'}
            >
              {question.title[surveyLanguage]}
            </Typography>
          )}
          <Typography
            sx={(theme) => ({
              marginTop: theme.spacing(2),
              ...styles(theme).secondaryText,
              ...(validationErrors &&
                validationErrors.includes('answerLimits') &&
                styles(theme).errorText),
              ...(optionsInfoSticky && { display: 'inline' }),
            })}
          >
            {answerLimitText}{' '}
          </Typography>
          {validationErrors && validationErrors.includes('answerLimits') && (
            <Typography style={visuallyHidden} role="alert">
              {`${question.title?.[surveyLanguage]}, ${answerLimitText}`}
            </Typography>
          )}
          <Typography
            sx={(theme) => ({
              ...styles(theme).secondaryText,
              marginTop: theme.spacing(1),
              marginBottom: theme.spacing(2),
              ...(optionsInfoSticky && { display: 'inline' }),
            })}
            id={`${question.id}-indicator`}
          >
            {indicatorTextStart}
            <Box
              sx={(theme) => styles(theme).indicatorNumbers}
              component="span"
              className={[maxReached && 'max-reached']
                .filter(Boolean)
                .join(' ')}
            >
              {value.length}
              {question.answerLimits?.max && `/${question.answerLimits.max}`}
            </Box>
            {indicatorTextEnd}
          </Typography>
        </Box>
      )}
      <Box display={'flex'} flexDirection="column">
        <AnimatePresence>
          {visibleOptions.map((option, index) => (
            <Option
              key={option.id}
              ref={visibleOptionRefs.current[index]}
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
              doesNotMatchFilters={visibleOptionsNotMatchingFilters.includes(
                option.id,
              )}
              onHiddenChange={() => {
                const toFocusIndex =
                  index === visibleOptions.length - 1 ? index - 1 : index + 1;
                // For screen readers
                checkBoxInputRef.current[toFocusIndex]?.current?.focus();
                setHiddenOptions((prev) =>
                  Array.from(new Set([...prev, option])),
                );
              }}
            />
          ))}
        </AnimatePresence>
      </Box>
      <Box aria-live="polite" mt={2}>
        {hiddenOptions.length > 0 ? (
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
              <AnimatePresence>
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
                        // For screen readers
                        checkBoxInputRef.current[
                          checkBoxInputRef.current.length - 1
                        ]?.current?.focus();

                        setHiddenOptions((prev) =>
                          prev.filter(
                            (hiddenOption) => hiddenOption.id !== option.id,
                          ),
                        );
                      }}
                    />
                  );
                })}
              </AnimatePresence>
            </AccordionDetails>
          </Accordion>
        ) : (
          <Box height="3rem" />
        )}
      </Box>
    </Box>
  );
}
