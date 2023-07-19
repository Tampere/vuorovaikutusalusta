import { Survey } from '@interfaces/survey';
import { Box, Link, Theme, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useTranslations } from '@src/stores/TranslationContext';
import { getClassList } from '@src/utils/classes';
import React from 'react';

const useStyles = makeStyles((theme: Theme & { [customKey: string]: any }) => ({
  root: (props: any) => ({
    display: 'flex',
    width: '100%',
    minHeight: '-webkit-fill-available',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    ...(props?.imageName && {
      backgroundImage: `url("/api/file/background-images/${props.imageName}")`,
    }),
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    backgroundColor: theme.landingPage?.backgroundColor ?? '#fff',
  }),
  header: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-end',
  },
  headerLogo: {
    width: '30rem',
    maxWidth: '100%',
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
      ...theme.landingPage?.title,
      [theme.breakpoints.down(600)]: {
        padding: '2vw',
      },
    },
  },
  title: {
    fontFamily: '"Montserrat", sans-serif',
    fontSize: '3rem',
    ...theme.landingPage?.title,
    [theme.breakpoints.down(600)]: {
      fontSize: '9vw',
    },
  },
  subtitle: {
    fontFamily: '"Montserrat", sans-serif',
    fontSize: '2rem',
    textTransform: 'none',
    ...theme.landingPage?.subtitle,
    [theme.breakpoints.down(600)]: {
      fontSize: '6vw',
    },
  },
  start: {
    fontFamily: '"Montserrat", sans-serif',
    fontSize: '2rem',
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    padding: '0.5rem',
    textDecoration: 'none',
    marginTop: '1.5rem',
    '&:hover': {
      // TODO: hover effect for start button?
    },
    ...theme.landingPage?.start,
    [theme.breakpoints.down(600)]: {
      fontSize: '6vw',
    },
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: '2rem',
    gap: '1rem',
  },
  footerLogo: {
    display: 'flex',
    marginLeft: '0.5rem',
    marginBottom: '0.5rem',
    alignItems: 'flex-end',
  },
  imageCopyright: {
    alignSelf: 'flex-end',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    padding: '1rem',
  },
  testSurveyHeader: {
    padding: '1rem',
    width: '100%',
    background: 'red',
    color: 'white',
    textAlign: 'center',
  },
}));

interface Props {
  survey: Survey;
  isTestSurvey: boolean;
  continueUnfinished: boolean;
  onStart: () => void;
  surveyBackgroundImage?: { attributions: string };
}

export default function SurveyLandingPage({
  survey,
  isTestSurvey,
  continueUnfinished,
  onStart,
  surveyBackgroundImage,
}: Props) {
  const classes = useStyles({ imageName: survey?.backgroundImageName ?? '' });
  const { tr, surveyLanguage } = useTranslations();

  return (
    <Box className={classes.root}>
      {isTestSurvey && (
        <div className={classes.testSurveyHeader}>
          {tr.TestSurveyFrame.text}
        </div>
      )}
      <div className={classes.header}>
        <div className={classes.headerLogo}>
          <img
            src={`api/feature-styles/icons/tre_logo`}
            alt={tr.IconAltTexts.treLogoAltText}
          />
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flexGrow: 1,
        }}
      >
        <h1 className={getClassList([classes.heading, classes.title])}>
          <span>{survey.title?.[surveyLanguage]}</span>
        </h1>
        {survey.subtitle?.[surveyLanguage] && (
          <h2 className={getClassList([classes.heading, classes.subtitle])}>
            <span>{survey.subtitle?.[surveyLanguage]}</span>
          </h2>
        )}
        <Link
          component="button"
          variant="body2"
          className={classes.start}
          onClick={onStart}
        >
          {continueUnfinished
            ? tr.SurveyPage.continueSurveyLink
            : tr.SurveyPage.startSurveyLink}
        </Link>
      </div>
      <div className={classes.footer}>
        <div className={classes.footerLogo}>
          <img
            src={`api/feature-styles/icons/tre_banner`}
            alt={tr.IconAltTexts.treBannerAltText}
          />
        </div>
        {surveyBackgroundImage?.attributions ? (
          <Typography className={classes.imageCopyright} variant="body2">
            {surveyBackgroundImage.attributions}
          </Typography>
        ) : null}
      </div>
    </Box>
  );
}
