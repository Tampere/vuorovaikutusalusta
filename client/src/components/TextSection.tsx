import { SurveyTextSection } from '@interfaces/survey';
import { useSurveyAnswers } from '@src/stores/SurveyAnswerContext';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeExternalLinks from 'rehype-external-links';
import remarkBreaks from 'remark-breaks';

interface Props {
  section: SurveyTextSection;
}

export default function TextSection({ section }: Props) {
  const { survey } = useSurveyAnswers();

  return (
    <>
      {section.title && (
        <h2 style={{ color: survey.sectionTitleColor ?? '#000000' }}>
          {section.title}
        </h2>
      )}
      <div style={{ color: section.bodyColor ?? '#000000' }}>
        <ReactMarkdown
          rehypePlugins={[rehypeExternalLinks]}
          remarkPlugins={[remarkBreaks]}
        >
          {section.body}
        </ReactMarkdown>
      </div>
    </>
  );
}
