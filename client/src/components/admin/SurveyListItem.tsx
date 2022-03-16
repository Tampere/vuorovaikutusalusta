import React, { useState, useMemo } from 'react';
import { Survey } from '@interfaces/survey';
import { Button, Card, Link, Theme, Typography } from '@material-ui/core';
import { CardContent } from '@material-ui/core';
import { CardActions } from '@material-ui/core';
import { useTranslations } from '@src/stores/TranslationContext';
import { format } from 'date-fns';
import CopyToClipboard from '../CopyToClipboard';
import ConfirmDialog from '../ConfirmDialog';
import {
  publishSurvey,
  unpublishSurvey,
} from '@src/controllers/SurveyController';
import { useToasts } from '@src/stores/ToastContext';
import { makeStyles } from '@material-ui/styles';
import DataExport from './DataExport';

const useStyles = makeStyles((theme: Theme) => ({
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
  loading: {
    animation: `$pulse 1s ${theme.transitions.easing.easeIn} infinite`,
    pointerEvents: 'none',
    filter: 'grayscale(100%)',
  },
}));

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

  const classes = useStyles();
  const { tr } = useTranslations();
  const { showToast } = useToasts();

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
      <Card className={loading ? classes.loading : ''}>
        <CardContent>
          <Typography variant="h5" component="h2">
            {!survey.title ? (
              <em>{tr.SurveyList.untitledSurvey}</em>
            ) : (
              survey.title
            )}
          </Typography>
          <Typography
            variant="h6"
            color="textSecondary"
            component="h3"
            gutterBottom
          >
            {survey.subtitle}
          </Typography>
          <Typography variant="body1" color="textSecondary" gutterBottom>
            {survey.author}
            {survey.authorUnit && `, ${survey.authorUnit}`}
          </Typography>
          {surveyUrl && (
            <Typography variant="body1" color="textSecondary" gutterBottom>
              <Link href={surveyUrl} target="_blank" rel="noopener noreferrer">
                {surveyUrl}
              </Link>
              <CopyToClipboard data={surveyUrl} />
            </Typography>
          )}
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
          <Typography variant="body1">
            {survey.isPublished
              ? tr.SurveyList.published
              : tr.SurveyList.notPublished}
          </Typography>
        </CardContent>
        <CardActions
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
          }}
        >
          <Button onClick={() => window.open(`/admin/kyselyt/${survey.id}`)}>
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
          <DataExport surveyId={survey.id} />
        </CardActions>
      </Card>
      <ConfirmDialog
        open={publishConfirmDialogOpen}
        title={survey.title}
        text={tr.SurveyList.confirmPublish}
        onClose={async (result) => {
          setPublishConfirmDialogOpen(false);
          if (!result) {
            return;
          }
          setLoading(true);
          try {
            const updatedSurvey = await publishSurvey(survey);
            setSurvey(updatedSurvey);
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
        title={survey.title}
        text={tr.SurveyList.confirmUnpublish}
        onClose={async (result) => {
          setUnpublishConfirmDialogOpen(false);
          if (!result) {
            return;
          }
          setLoading(true);
          try {
            const updatedSurvey = await unpublishSurvey(survey);
            setSurvey(updatedSurvey);
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
