import { Survey } from '@interfaces/survey';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { useTranslations } from '@src/stores/TranslationContext';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeExternalLinks from 'rehype-external-links';
import TreBanner from './logos/TreBanner';
import TreLogo from './logos/TreLogo';

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
          <TreLogo width="351px" height="125px" />
        </div>
        <Typography variant="h5">
          {survey.thanksPage.title?.[surveyLanguage]}
        </Typography>
        <ReactMarkdown rehypePlugins={[rehypeExternalLinks]}>
          {survey.thanksPage.text?.[surveyLanguage]}
        </ReactMarkdown>
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            paddingLeft: '1rem',
            paddingBottom: '0.5rem',
          }}
        >
          <TreBanner />
        </div>
      </div>
    </div>
  );
}
