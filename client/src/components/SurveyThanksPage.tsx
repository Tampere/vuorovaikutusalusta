import { Survey } from '@interfaces/survey';
import {
  Link,
  Typography,
  SxProps,
  Theme,
  Box,
  useMediaQuery,
  Stack,
} from '@mui/material';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeExternalLinks from 'rehype-external-links';
import Footer from './Footer';

type StyleKeys = 'testSurveyHeader';

const styles: Record<StyleKeys, SxProps<Theme>> = {
  testSurveyHeader: {
    padding: '2px',
    width: '100%',
    background: 'red',
    color: 'white',
    textAlign: 'center',
    position: 'absolute',
  },
};

interface Props {
  survey: Survey;
  isTestSurvey: boolean;
}

export default function SurveyThanksPage({ survey, isTestSurvey }: Props) {
  const [imageAltText, setImageAltText] = useState<string | null>(null);
  const widthFourHundred = useMediaQuery('(max-width:400px)');

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

  return (
    <Stack
      sx={{
        maxHeight: '100vh',
        height: '100vh',
        width: '100%',
        minHeight: '-webkit-fill-available',
      }}
      direction="column"
      justifyContent="space-between"
    >
      {isTestSurvey && (
        <Box sx={{ ...styles.testSurveyHeader }}>{tr.TestSurveyFrame.text}</Box>
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
          src={`/api/feature-styles/icons/tre_logo`}
          alt={tr.IconAltTexts.treLogoAltText}
        />
      </Box>
      <Box
        className="middle-content"
        sx={{
          maxHeight: '60vh',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 1em 0 1em',
        }}
      >
        <div>
          <Typography variant="h5" component="h1">
            {survey.thanksPage.title?.[surveyLanguage]}
          </Typography>
          <ReactMarkdown rehypePlugins={[rehypeExternalLinks]}>
            {survey.thanksPage.text?.[surveyLanguage]}
          </ReactMarkdown>
        </div>
        {survey.thanksPage.imageName && (
          <img
            style={{ maxHeight: '40%' }}
            src={`/api/file/${survey.thanksPage.imagePath[0]}/${survey.thanksPage.imageName}`}
            alt={imageAltText ?? ''}
          />
        )}
      </Box>
      <Box
        className="footer-content"
        sx={{
          position: 'relative',
          height: '20vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: { xs: 'center', md: 'flex-end' },
          marginBottom: { xs: '10px', sm: 0 },
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
      </Box>
    </Stack>
  );
}
