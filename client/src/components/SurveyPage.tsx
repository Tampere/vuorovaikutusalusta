import React, { useEffect, useState } from 'react';
import { Survey } from '@interfaces/survey';
import { Box, CircularProgress } from '@material-ui/core';
import { request } from '@src/utils/request';
import { useParams } from 'react-router-dom';
import SurveyLandingPage from './SurveyLandingPage';
import { useSurveyAnswers } from '@src/stores/SurveyAnswerContext';
import SurveyStepper from './SurveyStepper';
import SurveyThanksPage from './SurveyThanksPage';
import { UnavailableSurvey } from './UnavailableSurvey';
import { NotFoundPage } from './NotFoundPage';
import { useSurveyTheme } from '@src/stores/SurveyThemeProvider';

export default function SurveyPage() {
  const [loading, setLoading] = useState(true);
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [showThanksPage, setShowThanksPage] = useState(false);
  const [surveyBackgroundImage, setSurveyBackgroundImage] = useState<any>(null);
  const [errorStatusCode, setErrorStatusCode] = useState<number>(null);

  const { name } = useParams<{ name: string }>();
  const { setSurvey, survey } = useSurveyAnswers();
  const { setThemeFromSurvey } = useSurveyTheme();

  // Fetch survey data from server
  useEffect(() => {
    async function fetchSurvey() {
      try {
        const survey = await request<Survey>(`/api/published-surveys/${name}`);
        if (
          survey.backgroundImagePath &&
          survey.backgroundImageName &&
          survey.backgroundImageName !== ''
        ) {
          const filePathString = survey.backgroundImagePath.join('/');
          const surveyBackgroundImage = await request<any>(
            `/api/file/${filePathString}${filePathString ? '/' : ''}${
              survey.backgroundImageName
            }`
          );
          setSurveyBackgroundImage(surveyBackgroundImage);
        }
        setSurvey(survey);
        setThemeFromSurvey(survey);
        setLoading(false);
      } catch (error) {
        setErrorStatusCode(error.status);
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
    loading ? (
      <Box
        sx={{
          display: 'flex',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    ) : errorStatusCode === 404 ? (
      <NotFoundPage />
    ) : (
      <UnavailableSurvey />
    )
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
