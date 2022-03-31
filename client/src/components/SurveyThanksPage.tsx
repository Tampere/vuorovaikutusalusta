import React from 'react';
import { Survey } from '@interfaces/survey';
import ReactMarkdown from 'react-markdown';
import rehypeExternalLinks from 'rehype-external-links';
import { makeStyles } from '@material-ui/styles';
import TreLogo from './logos/TreLogo';
import TreBanner from './logos/TreBanner';
import { Typography } from '@material-ui/core';

const useStyles = makeStyles({
  root: {
    height: '100%',
    width: '100%',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

interface Props {
  survey: Survey;
}

export default function SurveyThanksPage({ survey }: Props) {
  const classes = useStyles();

  return (
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
      <Typography variant="h5">{survey.thanksPage.title}</Typography>
      <ReactMarkdown rehypePlugins={[rehypeExternalLinks]}>
        {survey.thanksPage.text}
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
  );
}
