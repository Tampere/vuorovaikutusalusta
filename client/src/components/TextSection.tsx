import { SurveyTextSection } from '@interfaces/survey';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeExternalLinks from 'rehype-external-links';

interface Props {
  section: SurveyTextSection;
}

export default function TextSection({ section }: Props) {
  return (
    <>
      {section.title && <h2>{section.title}</h2>}
      <ReactMarkdown rehypePlugins={[rehypeExternalLinks]}>
        {section.body}
      </ReactMarkdown>
    </>
  );
}
