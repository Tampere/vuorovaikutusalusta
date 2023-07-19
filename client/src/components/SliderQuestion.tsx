import { SurveySliderQuestion } from '@interfaces/survey';
import { FormLabel, Slider } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useTranslations } from '@src/stores/TranslationContext';
import { visuallyHidden } from '@mui/utils';
import React, { useMemo, useRef } from 'react';

interface Props {
  value: number;
  question: SurveySliderQuestion;
  onChange: (value: number) => void;
  setDirty: (dirty: boolean) => void;
}

const useStyles = makeStyles({
  label: {
    cursor: 'pointer',
  },
  emptyValue: {
    color: '#ccc',
  },
});

export default function SliderQuestion({
  value,
  question,
  onChange,
  setDirty,
}: Props) {
  const { surveyLanguage } = useTranslations();
  const classes = useStyles();
  const sliderRef = useRef<HTMLElement>();
  const { tr } = useTranslations();
  const verbalExtremes = question.presentationType === 'literal';
  const labels = useMemo(() => {
    return verbalExtremes
      ? {
          min:
            question.minLabel?.[surveyLanguage] ??
            tr.SliderQuestion.defaultMinLabel,
          max:
            question.maxLabel?.[surveyLanguage] ??
            tr.SliderQuestion.defaultMaxLabel,
        }
      : {
          min: question.minValue,
          max: question.maxValue,
        };
  }, [question, surveyLanguage]);

  // "Dummy" value to be displayed (in the middle) before a valid input is given
  const visibleEmptyValue = useMemo(() => {
    return (question.minValue + question.maxValue) / 2;
  }, [question]);

  return (
    <div
      id={`${question.id}-input`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '30rem',
      }}
    >
      <FormLabel
        sx={{ display: 'flex', justifyContent: 'space-between' }}
        id={`${question.id}-value-label`}
        className={classes.label}
        required={false}
      >
        <span style={visuallyHidden}>{tr.SliderQuestion.scale}: </span>
        <span>
          {question.minValue}
          {verbalExtremes && `: ${labels.min}`}
        </span>
        <span>
          {question.maxValue}
          {verbalExtremes && `: ${labels.max}`}
        </span>
      </FormLabel>
      <Slider
        aria-label={question.title?.[surveyLanguage]}
        ref={sliderRef}
        className={value === null ? classes.emptyValue : ''}
        slotProps={{
          input: {
            'aria-describedby': `${question.id}-value-label`,
            'aria-required': question.isRequired,
            'aria-invalid': question.isRequired && value === null,
          },
        }}
        value={value ?? visibleEmptyValue}
        min={question.minValue}
        max={question.maxValue}
        valueLabelDisplay="auto"
        getAriaValueText={(v) => v.toString()}
        step={1}
        marks
        onClick={() => {
          if (value === null) {
            onChange(visibleEmptyValue);
          }
        }}
        onChange={(_, value: number) => {
          setDirty(true);
          onChange(value);
        }}
      />
    </div>
  );
}
