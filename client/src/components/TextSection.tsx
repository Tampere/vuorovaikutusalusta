import { SurveyTextSection } from '@interfaces/survey';
import { useSurveyAnswers } from '@src/stores/SurveyAnswerContext';
import { useTranslations } from '@src/stores/TranslationContext';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeExternalLinks from 'rehype-external-links';
import remarkBreaks from 'remark-breaks';
import SectionInfo from './SectionInfo';

interface Props {
  section: SurveyTextSection;
}

export default function TextSection({ section }: Props) {
  const { survey } = useSurveyAnswers();
  const { surveyLanguage } = useTranslations();

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        {section.title?.[surveyLanguage] && (
          <h2
            style={{ color: survey.sectionTitleColor ?? '#000000', margin: 0 }}
          >
            {section.title?.[surveyLanguage]}
          </h2>
        )}
        {section.info && section.info?.[surveyLanguage] && (
          <SectionInfo
            infoText={section.info?.[surveyLanguage]}
            subject={section.title?.[surveyLanguage]}
          />
        )}
      </div>
      <div style={{ color: section.bodyColor ?? '#000000' }}>
        <ReactMarkdown
          rehypePlugins={[rehypeExternalLinks]}
          remarkPlugins={[remarkBreaks]}
        >
          {section.body?.[surveyLanguage]}
        </ReactMarkdown>
      </div>
    </>
  );
}
