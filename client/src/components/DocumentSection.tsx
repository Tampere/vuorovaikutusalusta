import { SurveyDocumentSection } from '@interfaces/survey';
import { FormLabel, Link, Typography } from '@mui/material';
import { useSurveyAnswers } from '@src/stores/SurveyAnswerContext';
import React, { useMemo } from 'react';
import SectionInfo from './SectionInfo';
import { useTranslations } from '@src/stores/TranslationContext';
import { getFullFilePath } from '@src/utils/path';

interface Props {
  section: SurveyDocumentSection;
  isFollowUp?: boolean;
}

export default function DocumentSection({
  section,
  isFollowUp = false,
}: Props) {
  const { survey } = useSurveyAnswers();
  const { tr, surveyLanguage } = useTranslations();

  const fullFilePath = useMemo(
    () =>
      getFullFilePath(
        section.fileOrganization,
        section.filePath,
        section.fileName,
      ),
    [section.fileOrganization, section.filePath, section.fileName],
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
      <Link href={`/api/file/${fullFilePath}`} target="_blank" rel="noreferrer">
        {tr.DocumentSection.attachment}: {section.fileName}
      </Link>
    </>
  );
}
