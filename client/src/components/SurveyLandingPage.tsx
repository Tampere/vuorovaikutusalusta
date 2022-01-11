import { Survey } from '@interfaces/survey';
import { Box, Link, Theme, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { useTranslations } from '@src/stores/TranslationContext';
import { getClassList } from '@src/utils/classes';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  root: (props: any) => ({
    display: 'flex',
    width: '100%',
    height: '100%',
    maxHeight: '-webkit-fill-available',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    ...(props?.data && {
      backgroundImage: `url(data:image/;base64,${props.data})`,
    }),
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  }),
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
    },
  },
  title: {
    fontSize: '3rem',
  },
  subtitle: {
    fontSize: '2rem',
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
  },
  imageCopyright: {
    position: 'fixed',
    bottom: 0,
    right: 0,
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
  const classes = useStyles(surveyBackgroundImage ?? {});
  const { tr } = useTranslations();

  return (
    <Box className={classes.root}>
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
      {surveyBackgroundImage?.attributions ? (
        <Typography className={classes.imageCopyright} variant="body2">
          {surveyBackgroundImage.attributions}
        </Typography>
      ) : null}
    </Box>
  );
}
