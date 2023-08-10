import { Survey } from '@interfaces/survey';
import { Typography, useMediaQuery } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeExternalLinks from 'rehype-external-links';

const useStyles = makeStyles({
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
});

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
        `/api/file/${survey.thanksPage.imagePath[0]}/${survey.thanksPage.imageName}`,
        { method: 'HEAD' }
      );

      const details = JSON.parse(res.headers.get('File-details'));

      setImageAltText(details?.imageAltText);
    }
    survey.thanksPage.imagePath.length > 0 &&
      survey.thanksPage.imageName &&
      getImageHeaders();
  }, []);

  const classes = useStyles();
  const { tr, surveyLanguage } = useTranslations();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {isTestSurvey && (
        <div className={classes.testSurveyHeader}>
          {tr.TestSurveyFrame.text}
        </div>
      )}
      <div className={classes.root}>
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
        <Typography variant="h5" mt={survey.thanksPage.imageName ? 10 : 0}>
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
              alt={imageAltText}
            />
          </div>
        )}

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
      </div>
    </div>
  );
}
