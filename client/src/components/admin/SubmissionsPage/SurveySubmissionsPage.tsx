import { Submission, Survey, SurveyQuestion } from '@interfaces/survey';
import {
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { Map } from '@mui/icons-material';
import {
  nonQuestionSectionTypes,
  useSurveyAnswers,
} from '@src/stores/SurveyAnswerContext';
import { useTranslations } from '@src/stores/TranslationContext';
import { request } from '@src/utils/request';
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import AnswerMap from './AnswerMap';
import AnswersList, { AnswerSelection } from './AnswersList';
import SplitPaneLayout from './SplitPaneLayout';
import DataExport from '../DataExport';
import { AdminAppBar } from '../AdminAppBar';
import { SurveyQuestionSummary } from './SurveyQuestionSummary';

export default function SurveySubmissionsPage() {
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
  const { tr, language } = useTranslations();

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
      const submissionUrl = `/api/surveys/${survey.id}/submissions`;
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

  // TODO: Could surveyQuestions and questions be combined into a single variable?
  const surveyQuestions = useMemo(() => {
    if (!survey) return;
    return survey?.pages.reduce((prevValue, currentValue) => {
      return [...prevValue, ...currentValue.sections];
    }, []);
  }, [survey]);

  // All map type questions across the entire survey
  const questions = useMemo(() => {
    if (!survey) return;
    return survey.pages.reduce(
      (questions, page) => [
        ...questions,
        ...page.sections.filter(
          (section): section is SurveyQuestion =>
            !nonQuestionSectionTypes.includes(section.type),
        ),
      ],
      [
        {
          id: 0,
          title: { [language]: tr.SurveySubmissionsPage.summary },
        },
      ] as SurveyQuestion[],
    );
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
    <>
      <AdminAppBar labels={[survey.name, tr.AnswersList.answers]} />
      <SplitPaneLayout
        defaultSize="30%"
        mainPane={
          <Box
            sx={{
              marginTop: '100px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <FormControl size="medium" variant="filled" fullWidth>
              <InputLabel id="select-label">
                {tr.SurveySection.question}
              </InputLabel>

              <Select
                sx={{ fontWeight: 400, fontSize: '24px' }}
                value={selectedQuestion?.id ?? 0}
                label={tr.SurveySection.question}
                onChange={(event) => {
                  if (!questions) return;
                  setSelectedQuestion(
                    questions.find(
                      (question) => question.id === event.target.value,
                    ),
                  );
                }}
              >
                {questions.map((question) => (
                  <MenuItem key={question.id} value={question.id}>
                    {question.title[language]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {submissions?.length && (
              <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>
                {tr.SurveySubmissionsPage.answerCount.replace(
                  '{x}',
                  String(submissions.length),
                )}
              </Typography>
            )}
            <DataExport surveyId={survey.id} />
            {selectedQuestion?.id === 0 ? (
              <SurveyQuestionSummary
                setSelectedQuestion={setSelectedQuestion}
              />
            ) : (
              <AnswersList
                modifyAnswerCallback={() => setRefreshSurvey((prev) => !prev)}
                submissions={submissions}
                selectedQuestion={selectedQuestion}
                selectedAnswer={selectedAnswer}
                setSelectedAnswer={setSelectedAnswer}
                surveyQuestions={surveyQuestions}
                surveyId={Number(surveyId)}
              />
            )}
          </Box>
        }
        sidePane={
          <AnswerMap
            survey={survey}
            submissions={submissions}
            selectedQuestion={selectedQuestion}
            onAnswerClick={(answer) => {
              setSelectedAnswer(answer);
            }}
            onSelectQuestion={(question) => setSelectedQuestion(question)}
            selectedAnswer={selectedAnswer}
            surveyQuestions={surveyQuestions}
            questions={questions}
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
    </>
  );
}
