import { Submission, Survey, SurveyQuestion } from '@interfaces/survey';
import { Box, CircularProgress, Link, Typography } from '@mui/material';
import { Map } from '@mui/icons-material';
import { useSurveyAnswers } from '@src/stores/SurveyAnswerContext';
import { useTranslations } from '@src/stores/TranslationContext';
import { request } from '@src/utils/request';
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import AnswerMap from './AnswerMap';
import AnswersList, { AnswerSelection } from './AnswersList';
import SplitPaneLayout from './SplitPaneLayout';

interface Props {
  isPublic?: boolean;
}

export default function SurveySubmissionsPage({ isPublic }: Props) {
  const { name, surveyId } = useParams<{ name: string; surveyId: string }>();
  const [error, setError] = useState(null);
  const [submissions, setSubmissions] = useState<Submission[]>(null);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [surveyLoading, setSurveyLoading] = useState(true);
  const [responsesLoading, setResponsesLoading] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerSelection>(null);
  const [refreshSurvey, setRefreshSurvey] = useState(false);
  const [selectedQuestion, setSelectedQuestion] =
    useState<SurveyQuestion>(null);

  const { survey, setSurvey } = useSurveyAnswers();
  const { tr } = useTranslations();

  const loading = useMemo(() => {
    return surveyLoading || submissionsLoading || responsesLoading;
  }, [surveyLoading, submissionsLoading, responsesLoading]);

  const errorMessage = useMemo(() => {
    if (!error) {
      return null;
    }
    if (error.status === 404) {
      return tr.SurveyPage.errorSurveyNotFound;
    }
    return tr.SurveyPage.errorFetchingSurvey;
  }, [error]);

  // Fetch survey data from server
  useEffect(() => {
    setSurveyLoading(true);
    async function fetchSurvey() {
      const requestUrl = name
        ? `/api/surveys/by-name/${name}`
        : `/api/surveys/${surveyId}`;
      try {
        const survey = await request<Survey>(requestUrl);
        setSurvey(survey);
      } catch (error) {
        setError(error);
      }
      setSurveyLoading(false);
    }
    fetchSurvey();
  }, [name, surveyId]);

  // Fetch submissions from server after the survey has been loaded
  useEffect(() => {
    if (survey == null) {
      return;
    }
    setSubmissionsLoading(true);
    async function fetchSubmissions() {
      const submissionUrl = isPublic
        ? `/api/surveys/${survey.id}/public-submissions`
        : `/api/surveys/${survey.id}/submissions`;
      try {
        const submissions = await request<Submission[]>(submissionUrl);
        setSubmissions(
          submissions.map((submission) => ({
            ...submission,
            timestamp: new Date(submission.timestamp),
          })),
        );
      } catch (error) {
        setError(error);
      }
      setSubmissionsLoading(false);
    }
    fetchSubmissions();
  }, [survey, refreshSurvey]);

  // Fetch submission/answer responses after the survey has been loaded
  useEffect(() => {
    if (survey == null) {
      return;
    }
    setResponsesLoading(true);
    async function fetchResponses() {
      try {
        //await loadResponses(survey.id);
      } catch (error) {
        setError(error);
      }
      setResponsesLoading(false);
    }
    fetchResponses();
  }, [survey]);

  const surveyQuestions = useMemo(() => {
    if (!survey) return;
    return survey?.pages.reduce((prevValue, currentValue) => {
      return [...prevValue, ...currentValue.sections];
    }, []);
  }, [survey]);

  return loading ? (
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
  ) : error ? (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography variant="body1">{errorMessage}</Typography>
    </Box>
  ) : (
    <SplitPaneLayout
      defaultSize="30%"
      mainPane={
        <>
          <Link href="/admin">
            <Typography>Etusivulle</Typography>
          </Link>
          <AnswersList
            modifyAnswerCallback={() => setRefreshSurvey((prev) => !prev)}
            isPublic={isPublic}
            submissions={submissions}
            selectedQuestion={selectedQuestion}
            selectedAnswer={selectedAnswer}
            setSelectedAnswer={setSelectedAnswer}
            surveyQuestions={surveyQuestions}
            surveyId={Number(surveyId)}
          />
        </>
      }
      sidePane={
        <AnswerMap
          isPublic={isPublic}
          survey={survey}
          submissions={submissions}
          selectedQuestion={selectedQuestion}
          onAnswerClick={(answer) => {
            setSelectedAnswer(answer);
          }}
          onSelectQuestion={(question) => {
            setSelectedQuestion(question);
          }}
          selectedAnswer={selectedAnswer}
          surveyQuestions={surveyQuestions}
        />
      }
      mobileDrawer={{
        open: mobileDrawerOpen,
        setOpen: (open) => {
          setMobileDrawerOpen(open);
        },
        chipProps: {
          color: 'secondary',
          icon: <Map />,
          label: tr.SurveyStepper.openMap,
        },
        helperText: null,
        title: null,
      }}
    />
  );
}
