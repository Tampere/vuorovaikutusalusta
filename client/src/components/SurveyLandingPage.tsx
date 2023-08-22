import { Survey } from '@interfaces/survey';
import { Box, Button, Link, Theme, Typography, Stack } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useTranslations } from '@src/stores/TranslationContext';
import { getClassList } from '@src/utils/classes';
import React from 'react';
import Footer from './Footer';

const useStyles = makeStyles((theme: Theme & { [customKey: string]: any }) => ({
  heading: {
    fontSize: '2rem',
    wordBreak: 'break-word',
    hyphens: 'auto',
    textAlign: 'center',
    fontWeight: 800,
    lineHeight: 1.5,
    margin: '2rem',
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
    transition: 'transform 200ms ease-out',
    '&:hover': {
      transform: 'scale(1.1)',
    },
    ...theme.landingPage?.start,
    [theme.breakpoints.down(600)]: {
      fontSize: '6vw',
    },
  },

  imageCopyright: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    padding: '0.75rem',
  },
  testSurveyHeader: {
    padding: '2px',
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
    <Stack
      direction="column"
      justifyContent="space-between"
      alignItems="stretch"
      style={{ minHeight: '100svh' }} // primary
      sx={{
        width: '100%',
        minHeight: '100vh', // as a fallback if svh not supported
        ...(survey?.backgroundImageName && {
          backgroundImage: `url("/api/file/background-images/${survey?.backgroundImageName}")`,
        }),
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {isTestSurvey && (
        <Box
          className="test-survey-header"
          sx={{ position: 'absolute', width: '100%' }}
        >
          <div className={classes.testSurveyHeader}>
            {tr.TestSurveyFrame.text}
          </div>
        </Box>
      )}
      <Box
        className="header-content"
        sx={{
          position: 'relative',
          height: '20vh',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'flex-start',
        }}
      >
        <img
          style={{
            maxWidth: '60%',
            maxHeight: '100%',
          }}
          src={`/api/feature-styles/icons/tre_logo`}
          alt={tr.IconAltTexts.treLogoAltText}
        />
      </Box>
      <Box
        className="middle-content"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div>
          <h1 className={getClassList([classes.heading, classes.title])}>
            <span>{survey.title?.[surveyLanguage]}</span>
          </h1>
          {survey.subtitle?.[surveyLanguage] && (
            <h2 className={getClassList([classes.heading, classes.subtitle])}>
              <span>{survey.subtitle?.[surveyLanguage]}</span>
            </h2>
          )}
        </div>
        <Button onClick={onStart}>
          <Typography variant="body1" className={classes.start}>
            {continueUnfinished
              ? tr.SurveyPage.continueSurveyLink
              : tr.SurveyPage.startSurveyLink}
          </Typography>
        </Button>
      </Box>
      <Box
        className="footer-content"
        sx={{
          position: 'relative',
          minHeight: '20vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: { xs: 'center', md: 'flex-end' },
          whiteSpace: 'nowrap',
        }}
      >
        <img
          style={{
            minWidth: '130px',
            maxWidth: '20%',
            position: 'absolute',
            left: 0,
            bottom: 0,
            marginLeft: '0.5rem',
            marginBottom: '0.5rem',
          }}
          src={`/api/feature-styles/icons/tre_banner`}
          alt={tr.IconAltTexts.treBannerAltText}
        />
        <Footer>
          <Link
            color="primary"
            underline="hover"
            href="https://www.tampere.fi/asioi-kaupungin-kanssa/oskari-karttakyselypalvelun-saavutettavuusseloste"
            target="_blank"
          >
            {tr.FooterLinks.accessibility}
          </Link>
          {survey.displayPrivacyStatement && (
            <Link
              color="primary"
              underline="hover"
              href="https://www.tampere.fi/tietosuoja-ja-tiedonhallinta/tietosuojaselosteet"
              target="_blank"
            >
              {tr.FooterLinks.privacyStatement}
            </Link>
          )}
        </Footer>

        {surveyBackgroundImage?.attributions ? (
          <Typography className={classes.imageCopyright} variant="body2">
            {surveyBackgroundImage.attributions}
          </Typography>
        ) : null}
      </Box>
    </Stack>
  );
}
