import { Survey } from '@interfaces/survey';
import {
  Box,
  Link,
  Stack,
  Theme,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTranslations } from '@src/stores/TranslationContext';
import { useImageHeaderQuery } from '@src/utils/useImageHeaderQuery';
import React, { useEffect, useState } from 'react';
import Footer from './Footer';
import MarkdownViewer from './MarkdownViewer';

const styles = (theme: Theme) => ({
  testSurveyHeader: {
    padding: '2px',
    width: '100%',
    background: 'red',
    color: 'white',
    textAlign: 'center',
    position: 'absolute',
  },
  imageCopyright: {
    position: 'absolute',
    right: 0,
    bottom: '.5em',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    padding: '0.6rem',
  },
});

interface Props {
  survey: Survey;
  isTestSurvey: boolean;
}

export default function SurveyThanksPage({ survey, isTestSurvey }: Props) {
  const [imageAltText, setImageAltText] = useState<string | null>(null);
  const thanksPageImageQuery = useImageHeaderQuery(
    `/api/file/${survey.thanksPage.imagePath.join('/')}/${
      survey.thanksPage.imageName
    }`,
  );

  useEffect(() => {
    async function getImageHeaders() {
      const res = await fetch(
        `api/file/${survey.thanksPage.imagePath[0]}/${survey.thanksPage.imageName}`,
        { method: 'HEAD' },
      );

      const details = JSON.parse(res.headers.get('File-details'));

      setImageAltText(details?.imageAltText);
    }
    survey.thanksPage.imagePath.length > 0 &&
      survey.thanksPage.imageName &&
      getImageHeaders();
  }, []);

  const { tr, surveyLanguage } = useTranslations();
  const hasImage = survey.thanksPage.imageName !== null;
  const lowWidth = useMediaQuery('(max-width: 400px)');
  const mediumWidth = useMediaQuery('(max-width: 640px)');
  const lowHeight = useMediaQuery('(max-height: 400px');
  const landscape = useMediaQuery('(orientation: landscape)');
  const mobileLandscape = lowHeight && landscape;

  return (
    <Stack
      style={{ minHeight: '100svh' }} // primary
      sx={{
        maxHeight: '100vh',
        width: '100%',
        minHeight: '100vh', // as fallback if svh is not supported
        display: 'flex',
      }}
      direction="column"
      justifyContent="space-between"
    >
      {isTestSurvey && (
        <Box sx={(theme) => ({ ...styles(theme).testSurveyHeader })}>
          {tr.TestSurveyFrame.text}
        </Box>
      )}
      <Box
        className="header-content"
        sx={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'flex-start',
        }}
      >
        <img
          style={{ maxWidth: '60%', maxHeight: '15vh' }}
          src={`/api/feature-styles/icons/logo`}
          alt={tr.IconAltTexts.logoAltText}
        />
      </Box>
      <Box
        className="middle-content"
        sx={{
          flexGrow: 1,
          maxHeight: !lowHeight ? '80vh' : 'auto',
          maxWidth: '60em',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: !lowWidth || !hasImage ? 'center' : 'start',
          alignItems: 'center',
          padding: '1em',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            flexGrow: !lowWidth ? 1 : 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: hasImage ? 'end' : 'center',
          }}
        >
          <Typography variant="h5" component="h1">
            {survey.thanksPage.title?.[surveyLanguage]}
          </Typography>
          <MarkdownViewer>
            {survey.thanksPage.text?.[surveyLanguage]}
          </MarkdownViewer>
        </div>
        {survey.thanksPage.imageName && (
          <Box
            position={'relative'}
            className="spacer"
            display={'inline-block'}
          >
            <img
              style={{
                maxHeight: !mobileLandscape ? '40vh' : '100vh',
                maxWidth: '100%',
              }}
              src={`/api/file/${survey.thanksPage.imagePath[0]}/${survey.thanksPage.imageName}`}
              alt={imageAltText ?? ''}
            />
            {survey.displayThanksAttributions &&
              thanksPageImageQuery.imageHeaders?.attributions && (
                <Typography
                  sx={(theme) => styles(theme).imageCopyright}
                  variant="body2"
                  maxWidth={'100%'}
                  display={'inline-block'}
                >
                  {thanksPageImageQuery.imageHeaders?.attributions}
                </Typography>
              )}
          </Box>
        )}
      </Box>
      <Box
        className="footer-content"
        sx={{
          position: 'relative',
          height: '10em',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginBottom: { xs: '10px', sm: 0 },
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
            width: '10vw',
            position: !mediumWidth ? 'absolute' : 'static',
            left: !mediumWidth ? '0' : 'auto',
            bottom: 0,
            margin: '0.5rem',
          }}
          src={`/api/feature-styles/icons/banner`}
          alt={tr.IconAltTexts.bannerAltText}
        />
      </Box>
    </Stack>
  );
}
