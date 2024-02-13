import {
  Checkbox,
  FormControlLabel,
  FormHelperText,
  TextField,
  Typography,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useSurvey } from '@src/stores/SurveyContext';
import { useTranslations } from '@src/stores/TranslationContext';
import React from 'react';
import RichTextEditor from '../RichTextEditor';

const useStyles = makeStyles({
  infoFieldContainer: {
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem',
  },
  disabledField: {
    pointerEvents: 'none',
    opacity: 0.4,
  },
});

export default function EditSurveyInfoPage() {
  const { tr, language } = useTranslations();
  const { activeSurvey, activeSurveyLoading, editSurvey } = useSurvey();
  const classes = useStyles();

  return (
    <div>
      <div className={classes.infoFieldContainer}>
        <FormControlLabel
          control={
            <Checkbox
              name="info-page-enabled"
              disabled={activeSurveyLoading}
              checked={activeSurvey.infoPage.enabled ?? false}
              onChange={(event) => {
                editSurvey({
                  ...activeSurvey,
                  infoPage: {
                    ...activeSurvey.infoPage,
                    enabled: event.target.checked,
                  },
                });
              }}
            />
          }
          label={tr.EditSurveyInfoPage.enableInfoPage}
        />
        <FormHelperText style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
          {' '}
          {tr.EditSurveyInfoPage.infoPageTexts}{' '}
        </FormHelperText>
        <br />
        <TextField
          disabled={!activeSurvey.infoPage.enabled}
          style={{ paddingBottom: '1rem' }}
          label={tr.EditSurveyInfoPage.title}
          value={activeSurvey?.infoPage?.title?.[language] ?? ''}
          onChange={(event) => {
            editSurvey({
              ...activeSurvey,
              infoPage: {
                ...activeSurvey.infoPage,
                title: {
                  ...activeSurvey.infoPage.title,
                  [language]: event.target.value,
                },
              },
            });
          }}
        />
        <RichTextEditor
          disabled={!activeSurvey.infoPage.enabled}
          label={tr.EditSurveyInfoPage.text}
          value={activeSurvey?.infoPage?.text?.[language] ?? ''}
          onChange={(value) => {
            editSurvey({
              ...activeSurvey,
              infoPage: {
                ...activeSurvey.infoPage,
                text: {
                  ...activeSurvey.infoPage.text,
                  [language]: value,
                },
              },
            });
          }}
        />
      </div>

      <div className={classes.infoFieldContainer}>
        <FormHelperText style={{ paddingBottom: '1rem' }}>
          {tr.EditSurveyInfoPage.helperText}
        </FormHelperText>
        <Typography
          className={activeSurvey.infoPage.enabled ? '' : classes.disabledField}
        >
          {' '}
          {tr.EditSurveyInfoPage.askedInfo}:{' '}
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              name="name-field-enabled"
              disabled={activeSurveyLoading || !activeSurvey.infoPage.enabled}
              checked={activeSurvey.personalInfoQuery?.name ?? false}
              onChange={(event) => {
                editSurvey({
                  ...activeSurvey,
                  personalInfoQuery: {
                    ...activeSurvey.personalInfoQuery,
                    name: event.target.checked,
                  },
                });
              }}
            />
          }
          label={tr.EditSurveyInfoPage.name}
        />
        <FormControlLabel
          control={
            <Checkbox
              name="email-field-enabled"
              disabled={activeSurveyLoading || !activeSurvey.infoPage.enabled}
              checked={activeSurvey.personalInfoQuery?.email ?? false}
              onChange={(event) => {
                editSurvey({
                  ...activeSurvey,
                  personalInfoQuery: {
                    ...activeSurvey.personalInfoQuery,
                    email: event.target.checked,
                  },
                });
              }}
            />
          }
          label={tr.EditSurveyInfoPage.email}
        />
        <FormControlLabel
          control={
            <Checkbox
              name="phone-field-enabled"
              disabled={activeSurveyLoading || !activeSurvey.infoPage.enabled}
              checked={activeSurvey.personalInfoQuery?.phoneNumber ?? false}
              onChange={(event) => {
                editSurvey({
                  ...activeSurvey,
                  personalInfoQuery: {
                    ...activeSurvey.personalInfoQuery,
                    phoneNumber: event.target.checked,
                  },
                });
              }}
            />
          }
          label={tr.EditSurveyInfoPage.phoneNumber}
        />
      </div>
    </div>
  );
}
