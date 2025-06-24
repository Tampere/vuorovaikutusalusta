import { Survey } from '@interfaces/survey';
import {
  Box,
  Button,
  Link,
  Theme,
  Typography,
  Stack,
  useMediaQuery,
} from '@mui/material';
import { useTranslations } from '@src/stores/TranslationContext';
import React from 'react';
import Footer from './Footer';

const styles = (theme: Theme & { [customKey: string]: any }) => ({
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
      [theme.breakpoints.down(600)]: { padding: '2vw' },
    },
  },
  title: {
    fontFamily: '"Montserrat", sans-serif',
    fontSize: '3rem',
    ...theme.landingPage?.title,
    [theme.breakpoints.down(600)]: { fontSize: '9vw' },
  },
  subtitle: {
    fontFamily: '"Montserrat", sans-serif',
    fontSize: '2rem',
    textTransform: 'none',
    ...theme.landingPage?.subtitle,
    [theme.breakpoints.down(600)]: { fontSize: '6vw' },
  },
  start: {
    fontFamily: '"Montserrat", sans-serif',
    fontSize: '2rem',
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    padding: '0.5rem',
    textDecoration: 'none',
    transition: 'transform 200ms ease-out',
    '&:hover': { transform: 'scale(1.1)' },
    ...theme.landingPage?.start,
    [theme.breakpoints.down(600)]: { fontSize: '6vw' },
  },

  imageCopyright: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    padding: '0.6rem',
  },
  testSurveyHeader: {
    padding: '2px',
    background: 'red',
    color: 'white',
    textAlign: 'center',
  },
});

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
  const { tr, surveyLanguage } = useTranslations();
  const mediumWidth = useMediaQuery('(max-width: 640px)');
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
          <Box sx={(theme) => styles(theme).testSurveyHeader}>
            {tr.TestSurveyFrame.text}
          </Box>
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
          style={{ maxWidth: '60%', maxHeight: '100%' }}
          src={`/api/feature-styles/icons/logo`}
          alt={tr.IconAltTexts.logoAltText}
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
          <Box
            component="h1"
            sx={(theme) => ({
              ...styles(theme).heading,
              ...styles(theme).title,
            })}
          >
            <span>{survey.title?.[surveyLanguage]}</span>
          </Box>
          {survey.subtitle?.[surveyLanguage] && (
            <Box
              component="h2"
              sx={(theme) => ({
                ...styles(theme).heading,
                ...styles(theme).subtitle,
              })}
            >
              <span>{survey.subtitle?.[surveyLanguage]}</span>
            </Box>
          )}
        </div>
        <Button onClick={onStart}>
          <Typography variant="body1" sx={(theme) => styles(theme).start}>
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
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'center',
          whiteSpace: 'nowrap',
        }}
      >
        <Footer
          {...(mediumWidth && { style: { transform: 'translateY(-20%)' } })}
        >
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
        <img
          style={{
            minWidth: '130px',
            maxWidth: '20%',
            position: !mediumWidth ? 'absolute' : 'static',
            left: !mediumWidth ? '0' : 'auto',
            bottom: 0,
            marginLeft: '0.5rem',
            marginBottom: '0.5rem',
          }}
          src={`/api/feature-styles/icons/banner`}
          alt={tr.IconAltTexts.bannerAltText}
        />

        {surveyBackgroundImage?.attributions ? (
          <Typography
            sx={(theme) => styles(theme).imageCopyright}
            variant="body2"
          >
            {surveyBackgroundImage.attributions}
          </Typography>
        ) : null}
      </Box>
    </Stack>
  );
}
