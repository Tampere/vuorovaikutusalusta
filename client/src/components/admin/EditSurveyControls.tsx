import React, { useMemo } from 'react';
import { useSurvey } from '@src/stores/SurveyContext';
import { makeStyles } from '@mui/styles';
import { Fab, Tooltip } from '@mui/material';
import { Save, Undo } from '@mui/icons-material';
import { useToasts } from '@src/stores/ToastContext';
import { useTranslations } from '@src/stores/TranslationContext';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    gap: '1rem',
    position: 'fixed',
    bottom: '1rem',
    right: '1rem',
  },
});

export default function EditSurveyControls() {
  const classes = useStyles();
  const {
    hasActiveSurveyChanged,
    activeSurveyLoading,
    saveChanges,
    discardChanges,
    validationErrors,
  } = useSurvey();
  const { showToast } = useToasts();
  const { tr } = useTranslations();

  const validationErrorTooltip = useMemo(() => {
    return (
      <>
        {tr.EditSurvey.invalidFields}
        <ul>
          {validationErrors.map((error) => (
            <li key={error}>{tr.EditSurvey.validationError[error]}</li>
          ))}
        </ul>
      </>
    );
  }, [validationErrors]);

  return (
    <div className={classes.root}>
      <Tooltip
        title={
          validationErrors.length > 0
            ? validationErrorTooltip
            : tr.commands.save
        }
      >
        <span>
          <Fab
            disabled={
              !hasActiveSurveyChanged ||
              activeSurveyLoading ||
              validationErrors.length > 0
            }
            color="primary"
            aria-label="save-changes"
            onClick={async () => {
              try {
                await saveChanges();
                showToast({
                  severity: 'success',
                  message: tr.EditSurvey.saveSuccessful,
                });
              } catch (error) {
                showToast({
                  severity: 'error',
                  message:
                    error.info === 'duplicate_survey_name'
                      ? tr.EditSurvey.saveFailedDuplicateName
                      : tr.EditSurvey.saveFailed,
                });
              }
            }}
          >
            <Save />
          </Fab>
        </span>
      </Tooltip>
      <Tooltip title={tr.commands.discard}>
        <span>
          <Fab
            disabled={!hasActiveSurveyChanged || activeSurveyLoading}
            color="secondary"
            aria-label="discard-changes"
            onClick={() => {
              discardChanges();
            }}
          >
            <Undo />
          </Fab>
        </span>
      </Tooltip>
    </div>
  );
}
