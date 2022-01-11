import React from 'react';
import { Survey } from '@interfaces/survey';
import ReactMarkdown from 'react-markdown';
import rehypeExternalLinks from 'rehype-external-links';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles({
  root: {
    padding: '1rem',
  },
});

interface Props {
  survey: Survey;
}

export default function SurveyThanksPage({ survey }: Props) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <h2>{survey.thanksPage.title}</h2>
      <ReactMarkdown rehypePlugins={[rehypeExternalLinks]}>
        {survey.thanksPage.text}
      </ReactMarkdown>
    </div>
  );
}
