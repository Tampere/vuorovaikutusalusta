import React, { useEffect } from 'react';
import { Survey } from '@interfaces/survey';
import { useState } from 'react';
import { createNewSurvey, getSurveys } from '@src/controllers/SurveyController';
import { useToasts } from '@src/stores/ToastContext';
import SurveyListItem from './SurveyListItem';
import { Box, FormControlLabel, Skeleton, Switch } from '@mui/material';

import { useTranslations } from '@src/stores/TranslationContext';
import LoadingButton from '../LoadingButton';
import { useHistory } from 'react-router-dom';

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
  },
};

export default function SurveyList() {
  const [surveysLoading, setSurveysLoading] = useState(true);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [newSurveyLoading, setNewSurveyLoading] = useState(false);
  const [showAuthoredOnly, setShowAuthoredOnly] = useState<boolean>(false);
  const [showPublishedOnly, setShowPublishedOnly] = useState<boolean>(false);

  const { showToast } = useToasts();
  const { tr } = useTranslations();
  const history = useHistory();

  useEffect(() => {
    let abortController = new AbortController();
    async function updateSurveys() {
      try {
        setSurveys(
          await getSurveys(
            abortController,
            showAuthoredOnly,
            showPublishedOnly,
          ),
        );
        abortController = null;
      } catch (error) {
        showToast({
          severity: 'error',
          message: tr.SurveyList.errorFetchingSurveys,
        });
      }
      setSurveysLoading(false);
    }
    updateSurveys();

    // Abort request if component gets unmounted
    // TODO: still some problems on unmount when creating a new survey....
    return () => {
      abortController?.abort();
    };
  }, [showAuthoredOnly, showPublishedOnly]);

  return (
    <Box sx={styles.root}>
      <Box sx={styles.actions}>
        <FormControlLabel
          value="showAuthored"
          control={
            <Switch
              checked={showAuthoredOnly}
              onChange={(event) => setShowAuthoredOnly(event.target.checked)}
            />
          }
          label={tr.SurveyList.showAuthoredOnly}
        />
      </Box>
      <Box sx={styles.actions}>
        <FormControlLabel
          value="showPublished"
          control={
            <Switch
              checked={showPublishedOnly}
              onChange={(event) => setShowPublishedOnly(event.target.checked)}
            />
          }
          label={tr.SurveyList.showPublishedOnly}
        />
        <LoadingButton
          variant="contained"
          loading={newSurveyLoading}
          onClick={async () => {
            setNewSurveyLoading(true);
            try {
              const newSurvey = await createNewSurvey();
              history.push(`/kyselyt/${newSurvey.id}`);
            } catch (error) {
              showToast({
                severity: 'error',
                message: tr.SurveyList.errorCreatingNewSurvey,
              });
            } finally {
              setNewSurveyLoading(false);
            }
          }}
        >
          {tr.SurveyList.createNewSurvey}
        </LoadingButton>
      </Box>
      {surveysLoading ? (
        <Skeleton variant="rectangular" width="100%" height={300} />
      ) : (
        <>
          {surveys.map((survey) => (
            <SurveyListItem key={survey.id} survey={survey} />
          ))}
        </>
      )}
    </Box>
  );
}
