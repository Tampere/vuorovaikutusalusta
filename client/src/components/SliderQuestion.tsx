import { SurveySliderQuestion } from '@interfaces/survey';
import { FormLabel, Slider } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { useTranslations } from '@src/stores/TranslationContext';
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
    color: '#ccc'
  }
})

export default function SliderQuestion({
  value,
  question,
  onChange,
  setDirty,
}: Props) {
  const { language } = useTranslations();
  const classes = useStyles();
  const sliderRef = useRef<HTMLElement>();

  const labels = useMemo(() => {
    return question.presentationType === 'literal' ? {
      min: question.minLabel[language],
      max: question.maxLabel[language]
    } : {
      min: question.minValue,
      max: question.maxValue
    }
  }, [question]);

  // "Dummy" value to be displayed (in the middle) before a valid input is given
  const visibleEmptyValue = useMemo(() => {
    return (question.minValue + question.maxValue) / 2
  }, [question]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '30rem' }}>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <FormLabel
          className={classes.label}
          onClick={() => {
            onChange(question.minValue);
            sliderRef.current.querySelector('input').focus();
          }}
        >{labels.min}</FormLabel>
        <div style={{
          flexGrow: 1
        }} />
        <FormLabel
          className={classes.label}
          onClick={() => {
            onChange(question.maxValue);
            sliderRef.current.querySelector('input').focus();
          }}
        >{labels.max}</FormLabel>
      </div>
      <Slider
        ref={sliderRef}
        className={value == null ? classes.emptyValue : ''}
        value={value ?? visibleEmptyValue}
        min={question.minValue}
        max={question.maxValue}
        valueLabelDisplay="auto"
        step={1}
        marks
        onClick={() => {
          if (!value) {
            onChange(visibleEmptyValue);
          }
        }}
        onChange={(_, value: number) => {
          setDirty(true);
          onChange(value);
        }}
        onBlur={() => {
          setDirty(true);
        }}
      />
    </div>
  );
}
