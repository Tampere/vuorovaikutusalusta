import { SurveyDocumentSection } from '@interfaces/survey';
import { FormLabel, Link } from '@material-ui/core';
import { useSurveyAnswers } from '@src/stores/SurveyAnswerContext';
import React, { useMemo } from 'react';
import SectionInfo from './SectionInfo';
import { useTranslations } from '@src/stores/TranslationContext';
import { getFullFilePath } from '@src/utils/path';

interface Props {
  section: SurveyDocumentSection;
}

export default function DocumentSection({ section }: Props) {
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
        {section.info && <SectionInfo infoText={section.info} />}
      </div>
      <Link href={`/api/file/${fullFilePath}`} target="_blank" rel="noreferrer">
        {tr.DocumentSection.attachment}: {section.fileName}
      </Link>
    </>
  );
}
