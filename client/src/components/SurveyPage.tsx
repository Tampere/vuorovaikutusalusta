import React, { useEffect, useState } from 'react';
import { Survey } from '@interfaces/survey';
import { Box, CircularProgress, Typography } from '@material-ui/core';
import { useTranslations } from '@src/stores/TranslationContext';
import { request } from '@src/utils/request';
import { useParams } from 'react-router-dom';
import SurveyLandingPage from './SurveyLandingPage';
import { useSurveyAnswers } from '@src/stores/SurveyAnswerContext';
import SurveyStepper from './SurveyStepper';
import SurveyThanksPage from './SurveyThanksPage';

export default function SurveyPage() {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>(null);
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [showThanksPage, setShowThanksPage] = useState(false);
  const [surveyBackgroundImage, setSurveyBackgroundImage] = useState<any>(null);

  const { name } = useParams<{ name: string }>();
  const { tr } = useTranslations();
  const { setSurvey, survey } = useSurveyAnswers();

  // Fetch survey data from server
  useEffect(() => {
    async function fetchSurvey() {
      try {
        const survey = await request<Survey>(`/api/published-surveys/${name}`);
        if (survey.backgroundImageId && survey.backgroundImageId !== 0) {
          const surveyBackgroundImage = await request<any>(
            `/api/image/${survey.backgroundImageId}`
          );
          setSurveyBackgroundImage(surveyBackgroundImage);
        }
        setSurvey(survey);
        setLoading(false);
      } catch (error) {
        setErrorMessage(
          error.status === 404
            ? tr.SurveyPage.errorSurveyNotFound
            : tr.SurveyPage.errorFetchingSurvey
        );
        setLoading(false);
        throw error;
      }
    }
    fetchSurvey();
  }, [name]);

  // Update page title from survey data
  useEffect(() => {
    if (!survey) {
      return;
    }
    document.title = [survey.title, survey.subtitle]
      .filter(Boolean)
      .join(' - ');
  }, [survey]);

  return !survey ? (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {loading ? (
        <CircularProgress />
      ) : (
        <Typography variant="body1">{errorMessage}</Typography>
      )}
    </Box>
  ) : (
    <Box sx={{ height: '100vh', maxHeight: '-webkit-fill-available' }}>
      {/* Landing page */}
      {showLandingPage && (
        <SurveyLandingPage
          survey={survey}
          surveyBackgroundImage={surveyBackgroundImage}
          onStart={() => {
            setShowLandingPage(false);
          }}
        />
      )}
      {/* Survey page */}
      {!showLandingPage && !showThanksPage && (
        <SurveyStepper
          survey={survey}
          onComplete={() => {
            setShowThanksPage(true);
          }}
        />
      )}
      {/* Thanks page */}
      {!showLandingPage && showThanksPage && (
        <SurveyThanksPage survey={survey} />
      )}
    </Box>
  );
}
