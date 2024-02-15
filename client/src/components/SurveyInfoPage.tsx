import { LocalizedText, PersonalInfo } from '@interfaces/survey';
import { Button, Grid, TextField, Theme, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useSurveyAnswers } from '@src/stores/SurveyAnswerContext';
import { useTranslations } from '@src/stores/TranslationContext';
import { getClassList } from '@src/utils/classes';
import React, { useState } from 'react';

const useStyles = makeStyles((theme: Theme & { [customKey: string]: any }) => ({
  root: {
    display: 'flex',
    width: '60%',
    minHeight: '-webkit-fill-available',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 0,
    [theme.breakpoints.down(600)]: {
      fontSize: '9vw',
      width: '100%',
    },
  },
  queryContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  infoPageContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textField: {
    marginBottom: '1rem',
  },
  title: {
    fontFamily: '"Montserrat", sans-serif',
    fontSize: '3rem',
    [theme.breakpoints.down(600)]: {
      fontSize: '9vw',
    },
  },
  subtitle: {
    fontFamily: '"Montserrat", sans-serif',
    fontSize: '1rem',
    textTransform: 'none',
    paddingBottom: '1rem',
    [theme.breakpoints.down(600)]: {
      fontSize: '4vw',
      paddingLeft: '1rem',
    },
  },
  heading: {
    textTransform: 'uppercase',
    fontSize: '2rem',
    wordBreak: 'break-word',
    hyphens: 'auto',
    textAlign: 'center',
    fontWeight: 800,
    lineHeight: 1.5,
    margin: '1rem',
    '& span': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      padding: '1rem',
      boxDecorationBreak: 'clone',
      [theme.breakpoints.down(600)]: {
        padding: '1vw',
      },
    },
  },
}));

interface Props {
  infoPageContent: { title: LocalizedText; text: LocalizedText };
  personalInfoQuery?: {
    name?: boolean;
    email?: boolean;
    phoneNumber?: boolean;
  };
  onStart: () => void;
}

export default function SurveyInfoPage({
  onStart,
  infoPageContent,
  personalInfoQuery,
}: Props) {
  const { tr, surveyLanguage } = useTranslations();
  const classes = useStyles();
  const { setPersonalInfo } = useSurveyAnswers();
  const [personalInfoValues, setPersonalInfoValues] =
    useState<PersonalInfo>(null);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setPersonalInfo(personalInfoValues);
        onStart();
      }}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Grid container spacing={4} className={classes.root}>
        <Grid item xs={12} style={{ padding: 0 }}>
          {infoPageContent?.title?.[surveyLanguage] && (
            <Typography
              className={getClassList([classes.heading, classes.title])}
              variant="h3"
            >
              {infoPageContent.title[surveyLanguage]}
            </Typography>
          )}
          {infoPageContent?.text?.[surveyLanguage] && (
            <Typography
              className={getClassList([classes.subtitle])}
              variant="body1"
            >
              {infoPageContent?.text[surveyLanguage]}
            </Typography>
          )}
        </Grid>
        <Grid
          item
          xs={12}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 0 0 0',
          }}
        >
          <Typography style={{ paddingBottom: '1rem' }}>
            {' '}
            {tr.SurveyInfoPage.fillEntries}:{' '}
          </Typography>
          {personalInfoQuery.name && (
            <TextField
              className={classes.textField}
              label={tr.SurveyInfoPage.name}
              value={personalInfoValues?.name ?? ''}
              onChange={(event) => {
                setPersonalInfoValues({
                  ...personalInfoValues,
                  name: event.target.value,
                });
              }}
            />
          )}
          {personalInfoQuery.phoneNumber && (
            <TextField
              type="tel"
              inputProps={{
                pattern: '\\+?[0-9\\s-]+',
              }}
              className={classes.textField}
              label={tr.SurveyInfoPage.phoneNumber}
              value={personalInfoValues?.phoneNumber ?? ''}
              onChange={(event) => {
                setPersonalInfoValues({
                  ...personalInfoValues,
                  phoneNumber: event.target.value,
                });
              }}
            ></TextField>
          )}
          {personalInfoQuery.email && (
            <TextField
              type="email"
              className={classes.textField}
              label={tr.SurveyInfoPage.email}
              value={personalInfoValues?.email ?? ''}
              onChange={(event) => {
                setPersonalInfoValues({
                  ...personalInfoValues,
                  email: event.target.value,
                });
              }}
            ></TextField>
          )}
        </Grid>
        <Grid item xs={12} style={{ padding: 0 }}>
          <Button type="submit" variant="contained">
            {tr.SurveyInfoPage.startSurvey}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
