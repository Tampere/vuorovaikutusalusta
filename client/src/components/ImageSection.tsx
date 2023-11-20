import { SurveyImageSection } from '@interfaces/survey';
import { FormLabel, Link, Typography } from '@mui/material';
import { useSurveyAnswers } from '@src/stores/SurveyAnswerContext';
import { useTranslations } from '@src/stores/TranslationContext';
import { getFullFilePath } from '@src/utils/path';
import React, { useMemo } from 'react';
import SectionInfo from './SectionInfo';

interface Props {
  section: SurveyImageSection;
  isFollowUp?: boolean;
}

export default function ImageSection({ section, isFollowUp = false }: Props) {
  const { survey } = useSurveyAnswers();
  const { tr, surveyLanguage, language } = useTranslations();

  const fullFilePath = useMemo(
    () => getFullFilePath(section.filePath, section.fileName),
    [section.filePath, section.fileName],
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
        <FormLabel>
          <Typography
            variant={isFollowUp ? 'followUpSectionTitle' : 'questionTitle'}
            sx={{ color: survey.sectionTitleColor ?? '#000000' }}
          >
            {section.title?.[surveyLanguage]}
          </Typography>
        </FormLabel>
        {section.info && section.info?.[surveyLanguage] && (
          <SectionInfo
            infoText={section.info?.[surveyLanguage]}
            subject={section.title?.[surveyLanguage]}
          />
        )}
      </div>
      <img
        style={{ maxWidth: '100%' }}
        src={`/api/file/${fullFilePath}`}
        alt={section.altText[language]}
      />
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <Link href={`/api/file/${fullFilePath}`} target={'__blank'}>
          {tr.ImageSection.openInNewTab}
        </Link>
      </div>
    </>
  );
}
