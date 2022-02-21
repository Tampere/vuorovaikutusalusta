import { SurveyTextSection } from '@interfaces/survey';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeExternalLinks from 'rehype-external-links';
import remarkBreaks from 'remark-breaks';

interface Props {
  section: SurveyTextSection;
}

export default function TextSection({ section }: Props) {
  return (
    <>
      {section.title && <h2>{section.title}</h2>}
      <ReactMarkdown
        rehypePlugins={[rehypeExternalLinks]}
        remarkPlugins={[remarkBreaks]}
      >
        {section.body}
      </ReactMarkdown>
    </>
  );
}
