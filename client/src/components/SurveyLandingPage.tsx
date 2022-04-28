import { Survey } from '@interfaces/survey';
import { Box, Link, Theme, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { useTranslations } from '@src/stores/TranslationContext';
import { getClassList } from '@src/utils/classes';
import React from 'react';
import TreBanner from './logos/TreBanner';
import TreLogo from './logos/TreLogo';

const useStyles = makeStyles((theme: Theme) => ({
  root: (props: any) => ({
    display: 'flex',
    width: '100%',
    minHeight: '-webkit-fill-available',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    ...(props?.imageName && {
      backgroundImage: `url("/api/file/${props.imageName}")`,
    }),
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
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
    fontFamily: '"Montserrat", sans-serif',
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
        padding: '2vw',
      },
    },
  },
  title: {
    fontSize: '3rem',
    [theme.breakpoints.down(600)]: {
      fontSize: '9vw',
    },
  },
  subtitle: {
    fontSize: '2rem',
    [theme.breakpoints.down(600)]: {
      fontSize: '6vw',
    },
  },
  start: {
    fontFamily: '"Montserrat", sans-serif',
    fontWeight: 600,
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    fontSize: '2rem',
    padding: '0.5rem',
    textDecoration: 'none',
    marginTop: '1.5rem',
    '&:hover': {
      // TODO: hover effect for start button?
    },
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
}));

interface Props {
  survey: Survey;
  onStart: () => void;
  surveyBackgroundImage: any;
}

export default function SurveyLandingPage({
  survey,
  onStart,
  surveyBackgroundImage,
}: Props) {
  const classes = useStyles({ imageName: survey?.backgroundImageName ?? '' });
  const { tr } = useTranslations();

  return (
    <Box className={classes.root}>
      <div className={classes.header}>
        <div className={classes.headerLogo}>
          <TreLogo />
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
          <span>{survey.title}</span>
        </h1>
        {survey.subtitle && (
          <h2 className={getClassList([classes.heading, classes.subtitle])}>
            <span>{survey.subtitle}</span>
          </h2>
        )}
        <Link
          component="button"
          variant="body2"
          className={classes.start}
          onClick={onStart}
        >
          {tr.SurveyPage.startSurveyLink}
        </Link>
      </div>
      <div className={classes.footer}>
        <div className={classes.footerLogo}>
          <TreBanner />
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
