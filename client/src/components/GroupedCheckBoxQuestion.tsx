import { SurveyGroupedCheckboxQuestion } from '@interfaces/survey';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Checkbox,
  Chip,
  FormControlLabel,
  FormGroup,
  Theme,
  Typography,
} from '@material-ui/core';
import { ArrowForwardIosSharp } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { useMemo, useState } from 'react';
import SectionInfo from './SectionInfo';

interface Props {
  value: number[];
  onChange: (value: number[]) => void;
  question: SurveyGroupedCheckboxQuestion;
  setDirty: (dirty: boolean) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  accordion: {
    border: `1px solid ${theme.palette.divider}`,
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
  },
  accordionSummary: {
    backgroundColor:
      theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, .05)'
        : 'rgba(0, 0, 0, .03)',
    flexDirection: 'row-reverse',
    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
      transform: 'rotate(90deg)',
    },
    '& .MuiAccordionSummary-content': {
      marginLeft: theme.spacing(1),
    },
  },
  accordionDetails: {
    padding: theme.spacing(2),
    borderTop: '1px solid rgba(0, 0, 0, .125)',
  },
  indicatorNumbers: {
    fontWeight: 'bold',
    color: '#22437b',
    '&.max-reached': {
      // TODO change this to something else if needed to highlight when max is reached?
      color: '#22437b',
    },
  },
}));

export default function GroupedCheckBoxQuestion({
  value,
  onChange,
  question,
  setDirty,
}: Props) {
  const [expanded, setExpanded] = useState<number>(null);

  const { tr, surveyLanguage } = useTranslations();
  const classes = useStyles();

  const amountsByGroup = useMemo(
    () =>
      question.groups?.map(
        (group) =>
          value.filter((id) => group.options.some((option) => option.id === id))
            .length ?? 0
      ),
    [question.groups, value]
  );

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

  return (
    <>
      <Typography style={{ marginTop: '1rem' }}>
        {question.answerLimits?.min && question.answerLimits?.max
          ? // Both min & max limits are set
            tr.GroupedCheckBoxQuestion.helperTextMinMax
              .replace('{min}', question.answerLimits.min.toString())
              .replace('{max}', question.answerLimits.max.toString())
          : question.answerLimits?.min
          ? // Only min limit is set
            tr.GroupedCheckBoxQuestion.helperTextMin.replace(
              '{min}',
              question.answerLimits.min.toString()
            )
          : question.answerLimits?.max
          ? // Only max limit is set
            tr.GroupedCheckBoxQuestion.helperTextMax.replace(
              '{max}',
              question.answerLimits.max.toString()
            )
          : // No limits are set
            tr.GroupedCheckBoxQuestion.helperText}
      </Typography>
      <Typography style={{ marginTop: '1rem' }} id={`${question.id}-indicator`}>
        {indicatorTextStart}
        <span
          className={[classes.indicatorNumbers, maxReached && 'max-reached']
            .filter(Boolean)
            .join(' ')}
        >
          {value.length}
          {question.answerLimits?.max && `/${question.answerLimits.max}`}
        </span>
        {indicatorTextEnd}
      </Typography>
      <div style={{ marginTop: '1rem' }}>
        {question.groups.map((group, index) => (
          <Accordion
            expanded={expanded === group.id}
            onChange={(_, newExpanded) => {
              setExpanded(newExpanded ? group.id : null);
            }}
            key={group.id}
            className={classes.accordion}
            disableGutters
            elevation={0}
            square
          >
            <AccordionSummary
              className={classes.accordionSummary}
              expandIcon={<ArrowForwardIosSharp sx={{ fontSize: '0.9rem' }} />}
            >
              {group.name?.[surveyLanguage]}
              {amountsByGroup[index] > 0 && (
                <Chip
                  style={{ marginLeft: '1rem' }}
                  label={amountsByGroup[index]}
                  size="small"
                  color="primary"
                />
              )}
            </AccordionSummary>
            <AccordionDetails className={classes.accordionDetails}>
              <FormGroup
                // Indicate the amount of selections inside the group for screen readers
                aria-label={`${
                  group.name?.[surveyLanguage]
                }: ${tr.GroupedCheckBoxQuestion.optionsSelectedInGroup.replace(
                  '{number}',
                  String(amountsByGroup[index])
                )}`}
                aria-describedby={`${question.id}-indicator`}
                onBlur={() => {
                  setDirty(true);
                }}
              >
                {group.options.map((option) => (
                  <div
                    key={option.id}
                    style={{ display: 'flex', flexDirection: 'row' }}
                  >
                    <FormControlLabel
                      label={option.text?.[surveyLanguage] ?? ''}
                      control={
                        <Checkbox
                          checked={value.includes(option.id)}
                          disabled={maxReached && !value.includes(option.id)}
                          onChange={(event) => {
                            setDirty(true);
                            const newValue = event.currentTarget.checked
                              ? // Add the value to the selected options
                                [...value, option.id]
                              : // Filter out the value from the selected options
                                value.filter(
                                  (optionId) => optionId !== option.id
                                );
                            onChange(newValue);
                          }}
                          name={option.text?.[surveyLanguage]}
                        />
                      }
                    />
                    {option.info?.[surveyLanguage] && (
                      <SectionInfo
                        infoText={option.info?.[surveyLanguage]}
                        subject={option.text?.[surveyLanguage]}
                      />
                    )}
                  </div>
                ))}
              </FormGroup>
            </AccordionDetails>
          </Accordion>
        ))}
      </div>
    </>
  );
}
