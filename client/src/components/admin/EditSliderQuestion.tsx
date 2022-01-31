import { SurveySliderQuestion } from '@interfaces/survey';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  TextField
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { useEffect } from 'react';

interface Props {
  section: SurveySliderQuestion;
  disabled?: boolean;
  onChange: (section: SurveySliderQuestion) => void;
}

const useStyles = makeStyles({
  numberField: {
    maxWidth: '10rem',
  },
});

export default function EditSliderQuestion({
  section,
  disabled,
  onChange,
}: Props) {
  const { tr } = useTranslations();

  const classes = useStyles();

  // When switching to literal presentation type, change numeric value boundaries accordingly
  useEffect(() => {
    if (section.presentationType === 'literal') {
      onChange({
        ...section,
        minValue: 0,
        maxValue: 10,
      });
    }
  }, [section.presentationType]);

  return (
    <>
      <FormControlLabel
        label={tr.SurveySections.isRequired}
        control={
          <Checkbox
            name="is-required"
            disabled={disabled}
            checked={section.isRequired}
            onChange={(event) => {
              onChange({
                ...section,
                isRequired: event.target.checked,
              });
            }}
          />
        }
      />
      <FormControl>
        <FormLabel id="presentation-type-label">
          {tr.EditSliderQuestion.presentationType}
        </FormLabel>
        <RadioGroup
          row
          aria-labelledby="presentation-type-label"
          name="presentation-type-group"
          value={section.presentationType}
          onChange={(event) => {
            onChange({
              ...section,
              presentationType: event.target.value as 'literal' | 'numeric',
            });
          }}
        >
          <FormControlLabel
            value="literal"
            control={<Radio />}
            label={tr.EditSliderQuestion.literal}
          />
          <FormControlLabel
            value="numeric"
            control={<Radio />}
            label={tr.EditSliderQuestion.numeric}
          />
        </RadioGroup>
      </FormControl>
      {section.presentationType === 'literal' && (
        <>
          <TextField
            label={tr.EditSliderQuestion.minValue}
            value={section.minLabel.fi}
            onChange={(event) => {
              onChange({
                ...section,
                minLabel: {
                  fi: event.target.value,
                },
              });
            }}
          />
          <TextField
            label={tr.EditSliderQuestion.maxValue}
            value={section.maxLabel.fi}
            onChange={(event) => {
              onChange({
                ...section,
                maxLabel: {
                  fi: event.target.value,
                },
              });
            }}
          />
          <FormHelperText>
            {tr.EditSliderQuestion.literalHelperText}
          </FormHelperText>
        </>
      )}
      {section.presentationType === 'numeric' && (
        <>
          <TextField
            type="number"
            className={classes.numberField}
            label={tr.EditSliderQuestion.minValue}
            value={section.minValue}
            onChange={(event) => {
              onChange({
                ...section,
                minValue: Number(event.target.value),
              });
            }}
          />
          <TextField
            type="number"
            className={classes.numberField}
            label={tr.EditSliderQuestion.maxValue}
            value={section.maxValue}
            onChange={(event) => {
              onChange({
                ...section,
                maxValue: Number(event.target.value),
              });
            }}
          />
        </>
      )}
    </>
  );
}
