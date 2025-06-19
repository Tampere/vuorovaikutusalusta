import { Survey } from '@interfaces/survey';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  Link,
  Stack,
  TextField,
  Theme,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { useState } from 'react';
import Footer from './Footer';
import { request } from '@src/utils/request';
import { useToasts } from '@src/stores/ToastContext';

const helperText = (
  theme: Theme,
  padding?: string | number,
  margin?: string | number,
) => ({
  padding: padding ?? '0.5rem',
  margin: margin ?? '2rem',
  textAlign: 'center',
  fontSize: '1.25rem',
  backgroundColor: theme.palette.secondary.main,
});

interface Props {
  isTestSurvey: boolean;
  survey: Survey;
  isSubmitted?: boolean;
}

export function SurveyRegistrationPage({
  isTestSurvey,
  survey,
  isSubmitted,
}: Props) {
  const { tr, surveyLanguage } = useTranslations();
  const mediumWidth = useMediaQuery('(max-width: 640px)');
  const [error, setError] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [sendingRegistration, setSendingRegistration] = useState(false);
  const { showToast } = useToasts();

  async function registerUserToSurvey(email: string) {
    try {
      setSendingRegistration(true);
      await request(
        `/api/published-surveys/${survey.name}/register${
          isTestSurvey ? '?test=true' : ''
        }`,
        {
          method: 'POST',
          body: {
            surveyId: survey.id,
            email: email,
            language: surveyLanguage,
          },
        },
      );
      setIsRegistered(true);
      setSendingRegistration(false);
    } catch (error) {
      showToast({ message: error.message, severity: 'error' });
      setSendingRegistration(false);
    }
  }

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
          sx={{
            position: 'absolute',
            width: '100%',
            padding: '2px',
            background: 'red',
            color: 'white',
            textAlign: 'center',
          }}
        >
          <div>{tr.TestSurveyFrame.text}</div>
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
          src={`/api/feature-styles/icons/logo`}
          alt={tr.IconAltTexts.logoAltText}
        />
      </Box>
      <Stack
        className="middle-content"
        sx={{
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          component={'h1'}
          sx={(theme: Theme & { landingPage?: { title: object } }) => ({
            fontSize: '3rem',
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
            fontFamily: '"Montserrat", sans-serif',
            ...theme.landingPage?.title,
            [theme.breakpoints.down(600)]: {
              fontSize: '9vw',
            },
          })}
        >
          <span>{survey.title?.[surveyLanguage]}</span>
        </Typography>
        {isSubmitted ? (
          <Typography sx={helperText}>
            {tr.SurveyRegistrationPage.alreadySubmitted}
          </Typography>
        ) : isRegistered ? (
          <Typography sx={helperText}>
            {tr.SurveyRegistrationPage.registrationSuccessful}
          </Typography>
        ) : sendingRegistration ? (
          <Box
            sx={(theme) => ({
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              backgroundColor: theme.palette.secondary.main,
              padding: '1rem',
            })}
          >
            <Typography
              aria-hidden="true"
              sx={(theme) => helperText(theme, 0, 0)}
            >
              {tr.SurveyRegistrationPage.sendingLink}
            </Typography>
            <CircularProgress title={tr.SurveyRegistrationPage.sendingLink} />
          </Box>
        ) : (
          <>
            <Typography sx={helperText}>
              {tr.SurveyRegistrationPage.registrationHelper}
            </Typography>
            <FormControl>
              <Stack
                sx={{
                  gap: '1.5rem',
                  minWidth: '300px',
                }}
                component={'form'}
              >
                <TextField
                  sx={(theme) => ({
                    borderRadius: 0,
                    '& .Mui-focused.Mui-focused': { outline: 'none' },

                    '& .MuiInputLabel-animated[data-shrink=true]': {
                      padding: '0.25rem 0.25rem',
                      borderRadius: '0rem',
                      transform: 'translate(9%, -50%) scale(0.85)',
                      border: `1px solid ${
                        error
                          ? theme.palette.error.main
                          : theme.palette.primary.main
                      }`,
                      backgroundColor: 'white',
                    },
                    '& .MuiInputBase-root.MuiInputBase-root': {
                      backgroundColor: 'white',
                      borderRadius: '0rem',
                    },
                    '& .MuiFormHelperText-root': {
                      border: `1px solid ${theme.palette.error.main}`,
                      padding: '0.25rem',
                      borderRadius: '0rem',
                      backgroundColor: 'white',
                    },
                  })}
                  variant="outlined"
                  label={tr.SurveyRegistrationPage.email}
                  type="email"
                  name="email"
                  aria-live="polite"
                  error={error}
                  {...(error && {
                    helperText: tr.SurveyRegistrationPage.emailHelperText,
                  })}
                  autoComplete="off"
                  inputProps={{
                    pattern:
                      '[a-zA-Z0-9\\+._%\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}',
                    maxLength: 80,
                  }}
                  required
                  onChange={(e) => {
                    if (e.target.validity.valid) {
                      setError(false);
                    }
                  }}
                />

                <Button
                  type="submit"
                  sx={(theme: Theme & { landingPage: { start: object } }) => ({
                    backgroundColor: theme.palette.secondary.main,
                    color: theme.palette.secondary.contrastText,
                    borderRadius: 0,
                    fontSize: '1.125rem',
                    padding: '0.5rem',
                    transition: 'transform 200ms ease-out',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      backgroundColor: theme.palette.secondary.light,
                    },
                    '&:focus&:focus': {
                      backgroundColor: theme.palette.secondary.main,
                      outlineOffset: 0,
                    },
                    ...theme.landingPage?.start,
                    [theme.breakpoints.down(600)]: {
                      fontSize: '4vw',
                    },
                  })}
                  onClick={async (e) => {
                    e.preventDefault();
                    const form = e.currentTarget.form as HTMLFormElement;

                    if (form.email.checkValidity()) {
                      const email = form.email.value;
                      await registerUserToSurvey(email);
                    } else {
                      setError(true);
                    }
                  }}
                >
                  {tr.SurveyRegistrationPage.submit}
                </Button>
              </Stack>
            </FormControl>
          </>
        )}
      </Stack>

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
      </Box>
    </Stack>
  );
}
