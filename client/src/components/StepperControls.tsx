import { Box, Button } from '@mui/material';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { useState } from 'react';
import SaveAsUnfinishedDialog from './SaveAsUnfinishedDialog';
import { SurveyPage } from '@interfaces/survey';

const styles = {
  root: {
    display: 'flex',
    gap: '0.5rem',
    flexDirection: 'row',
    '& > *': {
      marginRight: '0.5rem',
    },
  },
};

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
  nextPage: SurveyPage;
  previousPage: SurveyPage;
  registrationId?: string;
}

export default function StepperControls(props: Props) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const { tr } = useTranslations();

  return (
    <>
      <Box sx={styles.root}>
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
      </Box>
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
          registrationId={props.registrationId}
        />
      )}
    </>
  );
}
