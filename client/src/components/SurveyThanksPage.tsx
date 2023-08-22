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
import { getFileDetails } from '@src/controllers/FileController';

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

  useEffect(() => {
    async function getImageHeaders() {
      const details = await getFileDetails(
        `${survey.thanksPage.imagePath[0]}/${survey.thanksPage.imageName}`,
      );

      setImageAltText(details?.imageAltText);
    }
    survey.thanksPage.imagePath.length > 0 &&
      survey.thanksPage.imageName &&
      getImageHeaders();
  }, []);

  const { tr, surveyLanguage } = useTranslations();
  const hasImage = survey.thanksPage.imageName !== null;
  const lowWidth = useMediaQuery('(max-width:400px)');
  const lowHeight = useMediaQuery('(max-height:400px');
  const landscape = useMediaQuery('(orientation:landscape)');
  const mobileLandscape = lowHeight && landscape;

  return (
    <Stack
      sx={{
        maxHeight: '100vh',
        height: '100vh',
        width: '100%',
        minHeight: '-webkit-fill-available',
        display: 'flex',
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
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'flex-start',
        }}
      >
        <img
          style={{ maxWidth: '60%', maxHeight: '15vh' }}
          src={`/api/feature-styles/icons/tre_logo`}
          alt={tr.IconAltTexts.treLogoAltText}
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
          <ReactMarkdown rehypePlugins={[rehypeExternalLinks]}>
            {survey.thanksPage.text?.[surveyLanguage]}
          </ReactMarkdown>
        </div>
        {survey.thanksPage.imageName && (
          <div className="spacer" style={{ minHeight: '40vh', width: '100%' }}>
            <img
              style={{
                maxHeight: !mobileLandscape ? '40vh' : '100vh',
                maxWidth: '100%',
              }}
              src={`/api/file/${survey.thanksPage.imagePath[0]}/${survey.thanksPage.imageName}`}
              alt={imageAltText ?? ''}
            />
          </div>
        )}
      </Box>
      <Box
        className="footer-content"
        sx={{
          position: 'relative',
          height: '10em',
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
            width: '10vw',
            position: 'absolute',
            left: !lowWidth ? '0' : 'auto',
            bottom: 0,
            margin: '0.5rem',
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
