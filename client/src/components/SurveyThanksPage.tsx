import { Survey } from '@interfaces/survey';
import {
  Link,
  Typography,
  SxProps,
  Theme,
  Box,
  useMediaQuery,
} from '@mui/material';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeExternalLinks from 'rehype-external-links';
import Footer from './Footer';
import { theme } from '@src/themes/admin';

type StyleKeys = 'root' | 'links' | 'testSurveyHeader';

const styles: Record<StyleKeys, SxProps<Theme>> = {
  root: {
    position: 'relative',
    height: '100%',
    width: '100%',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  testSurveyHeader: {
    padding: '1rem',
    width: '100%',
    background: 'red',
    color: 'white',
    textAlign: 'center',
  },
  links: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    minHeight: '3rem',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginTop: '2rem',
    gap: '1rem',
    [theme.breakpoints.down(800)]: {
      flexDirection: 'column',
      alignItems: 'center',
      bottom: '50px',
    },
  },
};

interface Props {
  survey: Survey;
  isTestSurvey: boolean;
}

export default function SurveyThanksPage({ survey, isTestSurvey }: Props) {
  const [imageAltText, setImageAltText] = useState<string | null>(null);
  const matches = useMediaQuery('(max-width:400px)');

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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'space-between',
      }}
    >
      {isTestSurvey && (
        <Box sx={{ ...styles.testSurveyHeader }}>{tr.TestSurveyFrame.text}</Box>
      )}
      <Box sx={{ ...styles.root }}>
        <div
          style={{
            position: 'absolute',
            top: '0',
            right: '0',
          }}
        >
          {' '}
          <img
            style={{ height: '125px', width: '351px' }}
            src={`/api/feature-styles/icons/tre_logo`}
            alt={tr.IconAltTexts.treLogoAltText}
          />
        </div>
        <Typography
          variant="h5"
          component="h1"
          mt={survey.thanksPage.imageName ? 10 : 0}
        >
          {survey.thanksPage.title?.[surveyLanguage]}
        </Typography>
        <ReactMarkdown rehypePlugins={[rehypeExternalLinks]}>
          {survey.thanksPage.text?.[surveyLanguage]}
        </ReactMarkdown>

        {survey.thanksPage.imageName && (
          <div
            style={{
              width: matches ? '100%' : '50%',
              height: '50%',
            }}
          >
            <img
              style={{ maxWidth: '100%', maxHeight: '100%' }}
              src={`/api/file/${survey.thanksPage.imagePath[0]}/${survey.thanksPage.imageName}`}
              alt={imageAltText ?? ''}
            />
          </div>
        )}
        <Box sx={{ ...styles.links }}>
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
          <div
            style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              paddingLeft: '1rem',
              paddingBottom: '0.5rem',
            }}
          >
            <img
              style={{ height: '2rem' }}
              src={`/api/feature-styles/icons/tre_banner`}
              alt={tr.IconAltTexts.treBannerAltText}
            />
          </div>
        </Box>
      </Box>
    </div>
  );
}
