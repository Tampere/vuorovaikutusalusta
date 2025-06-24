import React, { useState, useMemo } from 'react';
import { Survey } from '@interfaces/survey';
import { Button, Card, Link, Theme, Typography } from '@mui/material';
import { CardContent } from '@mui/material';
import { CardActions } from '@mui/material';
import { useTranslations } from '@src/stores/TranslationContext';
import { format } from 'date-fns';
import CopyToClipboard from '../CopyToClipboard';
import ConfirmDialog from '../ConfirmDialog';
import {
  creteSurveyFromPrevious,
  publishSurvey,
  unpublishSurvey,
} from '@src/controllers/SurveyController';
import { useToasts } from '@src/stores/ToastContext';
import LoadingButton from '../LoadingButton';
import { NavLink, useRouteMatch } from 'react-router-dom';

const styles = (theme: Theme) => ({
  loading: {
    '@keyframes pulse': {
      '0%': {
        opacity: 0.4,
      },
      '50%': {
        opacity: 0.7,
      },
      '100%': {
        opacity: 0.4,
      },
    },
    animation: `pulse 1s ${theme.transitions.easing.easeIn} infinite`,
    pointerEvents: 'none',
    filter: 'grayscale(100%)',
  },
  cardRoot: {
    paddingBottom: '8px',
  },
});

interface Props {
  survey: Survey;
}

export default function SurveyListItem(props: Props) {
  const [survey, setSurvey] = useState(props.survey);
  const [publishConfirmDialogOpen, setPublishConfirmDialogOpen] =
    useState(false);
  const [unpublishConfirmDialogOpen, setUnpublishConfirmDialogOpen] =
    useState(false);
  const [loading, setLoading] = useState(false);

  const { tr, surveyLanguage } = useTranslations();
  const { showToast } = useToasts();
  const { url } = useRouteMatch();

  const surveyUrl = useMemo(() => {
    if (!survey.name) {
      return null;
    }
    return `${window.location.protocol}//${window.location.hostname}${
      window.location.port ? `:${window.location.port}` : ''
    }/${survey.name}`;
  }, [survey.name]);

  return (
    <>
      <Card
        sx={(theme) => (loading ? styles(theme).loading : {})}
        style={
          survey.isPublished ? { filter: 'drop-shadow(0 0 0.15rem green)' } : {}
        }
      >
        <CardContent sx={(theme) => styles(theme).cardRoot}>
          <Typography variant="h6" component="h3">
            {!survey.title?.[surveyLanguage] ? (
              <em>{tr.SurveyList.untitledSurvey}</em>
            ) : (
              survey?.title?.[surveyLanguage] ?? ''
            )}
          </Typography>
          <Typography color="textSecondary" component="h4" gutterBottom>
            {survey.subtitle?.[surveyLanguage]}
          </Typography>
          <Typography variant="body1" color="textSecondary" gutterBottom>
            {survey.author}
            {survey.authorUnit && `, ${survey.authorUnit}`}
          </Typography>
          {surveyUrl && (
            <Typography variant="body1" color="textSecondary" gutterBottom>
              <Link
                href={`${surveyUrl}${
                  survey.localisationEnabled ? '?lang=' + surveyLanguage : ''
                }`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {`${surveyUrl}${
                  survey.localisationEnabled ? '?lang=' + surveyLanguage : ''
                }`}
              </Link>
              <CopyToClipboard
                data={`${surveyUrl}${
                  survey.localisationEnabled ? '?lang=' + surveyLanguage : ''
                }`}
              />
            </Typography>
          )}
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            {/* Scheduling info (start/end dates) */}
            {survey.startDate && survey.endDate ? (
              <Typography variant="body1" color="textSecondary" gutterBottom>
                {tr.SurveyList.open} {format(survey.startDate, 'd.M.yyyy')} -{' '}
                {format(survey.endDate, 'd.M.yyyy')}
              </Typography>
            ) : survey.startDate ? (
              <Typography variant="body1" color="textSecondary" gutterBottom>
                {tr.SurveyList.openFrom} {format(survey.startDate, 'd.M.yyyy')}
              </Typography>
            ) : null}
            {/* Current publish status */}
            {survey.isPublished ? (
              <Typography style={{ paddingLeft: '0.5rem', color: 'green' }}>
                {' '}
                - {tr.SurveyList.published}
              </Typography>
            ) : (
              <Typography style={{ paddingLeft: '0.5rem' }}>
                {' '}
                - {tr.SurveyList.notPublished}
              </Typography>
            )}
          </div>
        </CardContent>
        <CardActions
          style={{
            paddingTop: '0',
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
          }}
        >
          <Button component={NavLink} to={`${url}kyselyt/${survey.id}`}>
            {tr.SurveyList.editSurvey}
          </Button>
          {/* Allow publish only if it isn't yet published and has a name */}
          {!survey.isPublished && survey.name && (
            <Button
              onClick={() => {
                setPublishConfirmDialogOpen(true);
              }}
            >
              {tr.SurveyList.publishNow}
            </Button>
          )}
          {/* Allow unpublish when survey is published */}
          {survey.isPublished && (
            <Button
              onClick={() => {
                setUnpublishConfirmDialogOpen(true);
              }}
            >
              {tr.SurveyList.unpublish}
            </Button>
          )}
          <LoadingButton
            onClick={async () => {
              const newSurveyId = await creteSurveyFromPrevious(survey.id);
              if (!newSurveyId) return;
              window.open(`/admin/kyselyt/${newSurveyId}`);
            }}
          >
            {' '}
            {tr.SurveyList.copySurvey}{' '}
          </LoadingButton>
          <Button
            component={NavLink}
            style={{ marginLeft: 'auto' }}
            variant="contained"
            to={`vastaukset/${survey.id}`}
            disabled={survey?.submissionCount === 0}
          >
            {`${tr.SurveyList.answers} (${survey?.submissionCount ?? 0})`}
          </Button>
        </CardActions>
      </Card>
      <ConfirmDialog
        open={publishConfirmDialogOpen}
        submitColor="primary"
        title={survey.title?.[surveyLanguage] ?? ''}
        text={tr.SurveyList.confirmPublish}
        onClose={async (result) => {
          setPublishConfirmDialogOpen(false);
          if (!result) {
            return;
          }
          setLoading(true);
          try {
            const updatedSurvey = await publishSurvey(survey);
            setSurvey({
              ...updatedSurvey,
              submissionCount: survey.submissionCount,
            });
            showToast({
              severity: 'success',
              message: tr.SurveyList.publishSuccessful,
            });
          } catch (error) {
            showToast({
              severity: 'error',
              message: tr.SurveyList.publishFailed,
            });
          }
          setLoading(false);
        }}
      />
      <ConfirmDialog
        open={unpublishConfirmDialogOpen}
        submitColor="error"
        title={survey.title?.[surveyLanguage] ?? ''}
        text={tr.SurveyList.confirmUnpublish}
        onClose={async (result) => {
          setUnpublishConfirmDialogOpen(false);
          if (!result) {
            return;
          }
          setLoading(true);
          try {
            const updatedSurvey = await unpublishSurvey(survey);
            setSurvey({
              ...updatedSurvey,
              submissionCount: survey.submissionCount,
            });
            showToast({
              severity: 'success',
              message: tr.SurveyList.unpublishSuccessful,
            });
          } catch (error) {
            showToast({
              severity: 'error',
              message: tr.SurveyList.unpublishFailed,
            });
          }
          setLoading(false);
        }}
      />
    </>
  );
}
