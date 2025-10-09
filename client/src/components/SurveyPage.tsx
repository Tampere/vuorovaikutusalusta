import { Survey, SurveyRegistration } from '@interfaces/survey';
import { Box, CircularProgress } from '@mui/material';
import { useSurveyAnswers } from '@src/stores/SurveyAnswerContext';
import { useSurveyTheme } from '@src/stores/SurveyThemeProvider';
import { useToasts } from '@src/stores/ToastContext';
import { useTranslations } from '@src/stores/TranslationContext';
import { getFullFilePath } from '@src/utils/path';
import { request } from '@src/utils/request';
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { NotFoundPage } from './NotFoundPage';
import SurveyLandingPage from './SurveyLandingPage';
import SurveyLanguageMenu from './SurveyLanguageMenu';
import SurveyStepper from './SurveyStepper';
import SurveyThanksPage from './SurveyThanksPage';
import TestSurveyFrame from './TestSurveyFrame';
import { UnavailableSurvey } from './UnavailableSurvey';
import { SurveyRegistrationPage } from './SurveyRegistrationPage';

interface Props {
  isTestSurvey?: boolean;
}

export default function SurveyPage({ isTestSurvey }: Props) {
  const [loading, setLoading] = useState(true);
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [showThanksPage, setShowThanksPage] = useState(false);
  const [surveyBackgroundImage, setSurveyBackgroundImage] = useState<{
    attributions: string;
  }>(null);
  const [errorStatusCode, setErrorStatusCode] = useState<number>(null);
  const [continueUnfinished, setContinueUnfinished] = useState(false);
  const [registration, setRegistration] = useState<SurveyRegistration | null>(
    null,
  );
  const [registrationLoading, setRegistrationLoading] = useState(false);

  const { name } = useParams<{ name: string }>();
  const { setSurvey, survey, loadUnfinishedEntries, setRegistrationId } =
    useSurveyAnswers();
  const { setThemeFromSurvey } = useSurveyTheme();
  const { search } = useLocation();
  const { tr, language } = useTranslations();
  const { showToast } = useToasts();

  const needsRegistration =
    survey?.emailRegistrationRequired && registration?.surveyId !== survey?.id;

  const registrationHasSubmission =
    survey?.emailRegistrationRequired &&
    registration?.surveyId === survey?.id &&
    registration?.hasSubmission;

  const unfinishedToken = useMemo(
    () => new URLSearchParams(search)?.get('token'),
    [search],
  );

  const registrationId = useMemo(
    () => new URLSearchParams(search)?.get('registration'),
    [search],
  );

  // Fetch survey data from server
  useEffect(() => {
    async function fetchSurvey() {
      try {
        const survey = await request<Survey>(
          `/api/published-surveys/${name}${isTestSurvey ? '?test=true' : ''}`,
        );
        if (
          survey.backgroundImagePath &&
          survey.backgroundImageName &&
          survey.backgroundImageName !== ''
        ) {
          const fullFilePath = getFullFilePath(
            survey.backgroundImagePath,
            survey.backgroundImageName,
          );
          const response = await fetch(`/api/file/${fullFilePath}`);
          const details = JSON.parse(
            response.headers.get('File-details') ?? '{}',
          );
          setSurveyBackgroundImage(details);
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
    document.title = [survey.title?.[language], survey.subtitle?.[language]]
      .filter(Boolean)
      .join(' - ');
  }, [survey]);

  // Check if survey has been registered with the provided registration ID
  useEffect(() => {
    if (!survey || !registrationId || registration) {
      return;
    }
    async function checkRegistration() {
      setRegistrationLoading(true);
      try {
        const response = await request<SurveyRegistration>(
          `/api/published-surveys/${survey.name}/registration/${registrationId}`,
        );
        if (response.surveyId === survey.id) {
          setRegistration(response);
          setRegistrationId(registrationId);
        }
      } catch (error) {
        if (error.status === 404) {
          showToast({
            message: tr.SurveyPage.registrationNotFound,
            severity: 'error',
          });
        } else {
          showToast({
            message: tr.SurveyPage.errorLoadingRegistration,
            severity: 'error',
          });
        }
      }
      setRegistrationLoading(false);
    }
    checkRegistration();
  }, [survey, registrationId, setRegistrationLoading]);

  // Try to continue unfinished submission if an unfinished token is provided in query parameters
  useEffect(() => {
    if (!survey || !unfinishedToken) {
      return;
    }
    async function continueSubmission() {
      try {
        await loadUnfinishedEntries(unfinishedToken);
        showToast({
          message: tr.SurveyPage.loadUnfinishedSuccessful,
          severity: 'success',
        });
        setContinueUnfinished(true);
      } catch (error) {
        switch (error.status) {
          case 400:
          case 404:
            showToast({
              message: tr.SurveyPage.errorTokenNotFound,
              severity: 'error',
            });
            break;
          default:
            showToast({
              message: tr.SurveyPage.errorLoadingUnfinished,
              severity: 'error',
            });
        }
      }
    }
    continueSubmission();
  }, [survey, unfinishedToken]);

  return !survey || registrationLoading ? (
    loading || registrationLoading ? (
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
    <>
      <Box
        sx={{
          height: '100vh',
          maxHeight: '-webkit-fill-available',
        }}
      >
        {(showLandingPage ||
          showThanksPage ||
          (survey.emailRegistrationRequired &&
            (needsRegistration || registrationHasSubmission))) &&
          survey.localisationEnabled && (
            <SurveyLanguageMenu
              changeUILanguage={true}
              style={{
                position: 'absolute',
                top: '1rem',
                left: '1rem',
                zIndex: 10,
              }}
            />
          )}
        {needsRegistration || registrationHasSubmission ? (
          <SurveyRegistrationPage
            isTestSurvey={isTestSurvey}
            survey={survey}
            isSubmitted={registration?.hasSubmission}
          />
        ) : (
          showLandingPage && (
            <SurveyLandingPage
              survey={survey}
              isTestSurvey={isTestSurvey}
              continueUnfinished={continueUnfinished}
              surveyBackgroundImage={surveyBackgroundImage}
              onStart={() => {
                setShowLandingPage(false);
              }}
            />
          )
        )}

        {/* Survey page */}
        {!showLandingPage && !showThanksPage && (
          <SurveyStepper
            survey={survey}
            isTestSurvey={isTestSurvey}
            onComplete={() => {
              setShowThanksPage(true);
            }}
          />
        )}
        {/* Thanks page */}
        {!showLandingPage && showThanksPage && (
          <SurveyThanksPage survey={survey} isTestSurvey={isTestSurvey} />
        )}
      </Box>
      {isTestSurvey && <TestSurveyFrame />}
    </>
  );
}
