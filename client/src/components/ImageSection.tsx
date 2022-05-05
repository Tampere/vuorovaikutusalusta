import { SurveyImageSection } from '@interfaces/survey';
import { FormLabel, Link } from '@material-ui/core';
import { useSurveyAnswers } from '@src/stores/SurveyAnswerContext';
import { useTranslations } from '@src/stores/TranslationContext';
import { getFullFilePath } from '@src/utils/path';
import React, { useMemo } from 'react';
import SectionInfo from './SectionInfo';

interface Props {
  section: SurveyImageSection;
}

export default function ImageSection({ section }: Props) {
  const { survey } = useSurveyAnswers();
  const { tr } = useTranslations();

  const fullFilePath = useMemo(
    () => getFullFilePath(section.filePath, section.fileName),
    [section.filePath, section.fileName]
  );

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <FormLabel
          component="legend"
          style={{ color: survey.sectionTitleColor ?? '#000000' }}
        >
          {section.title}
        </FormLabel>
        {section.info && (
          <SectionInfo infoText={section.info} subject={section.title} />
        )}
      </div>
      <img
        style={{ maxWidth: '100%' }}
        src={`/api/file/${fullFilePath}`}
        alt={section.altText}
      />
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <Link href={`/api/file/${fullFilePath}`} target={'__blank'}>
          {tr.ImageSection.openInNewTab}
        </Link>
      </div>
    </>
  );
}
