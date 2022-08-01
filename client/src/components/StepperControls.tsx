import { Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { useState } from 'react';
import SaveAsUnfinishedDialog from './SaveAsUnfinishedDialog';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'row',
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
  isTestSurvey: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  allowSavingUnfinished?: boolean;
  onSaveUnfinished?: (token: string) => void;
}

export default function StepperControls(props: Props) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const { tr } = useTranslations();
  const classes = useStyles();

  return (
    <>
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
        <div style={{ flexGrow: 1 }} />
        {props.allowSavingUnfinished && (
          <Button
            variant="outlined"
            onClick={() => {
              setSaveDialogOpen(true);
            }}
          >
            {tr.SurveyStepper.saveAsUnfinished}
          </Button>
        )}
      </div>
      {props.allowSavingUnfinished && (
        <SaveAsUnfinishedDialog
          open={saveDialogOpen}
          isTestSurvey={props.isTestSurvey}
          onCancel={() => {
            setSaveDialogOpen(false);
          }}
          onSave={async (token) => {
            props.onSaveUnfinished?.(token);
            setSaveDialogOpen(false);
          }}
        />
      )}
    </>
  );
}
