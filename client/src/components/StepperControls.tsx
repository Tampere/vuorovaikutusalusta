import { Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { useTranslations } from '@src/stores/TranslationContext';
import React from 'react';

const useStyles = makeStyles({
  root: {
    '& > *': {
      marginRight: '0.5rem',
    },
  },
});

interface Props {
  activeStep: number;
  totalSteps: number;
  disabled: boolean;
  nextDisabled: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export default function StepperControls(props: Props) {
  const { tr } = useTranslations();
  const classes = useStyles();

  return (
    <div className={classes.root}>
      {props.activeStep > 0 && (
        <Button
          disabled={props.disabled}
          onClick={props.onPrevious}
          variant="outlined"
          color="primary"
        >
          {tr.SurveyStepper.previous}
        </Button>
      )}
      {props.activeStep < props.totalSteps - 1 && (
        <Button
          disabled={props.disabled || props.nextDisabled}
          onClick={props.onNext}
          variant="contained"
          color="primary"
        >
          {tr.SurveyStepper.next}
        </Button>
      )}
      {props.activeStep === props.totalSteps - 1 && (
        <Button
          disabled={props.disabled || props.nextDisabled}
          onClick={props.onSubmit}
          variant="contained"
          color="primary"
        >
          {tr.SurveyStepper.submit}
        </Button>
      )}
    </div>
  );
}
