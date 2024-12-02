import { SurveyImageSection } from '@interfaces/survey';
import { Card, CardMedia, FormLabel, Link, Typography } from '@mui/material';
import { useSurveyAnswers } from '@src/stores/SurveyAnswerContext';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { useEffect, useState } from 'react';
import SectionInfo from './SectionInfo';

interface Props {
  section: SurveyImageSection;
  isFollowUp?: boolean;
}

export default function ImageSection({ section, isFollowUp = false }: Props) {
  const { survey } = useSurveyAnswers();
  const { tr, surveyLanguage, language } = useTranslations();
  const [isVideo, setIsVideo] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const cancelSignal = controller.signal;
    const checkHeader = async () => {
      try {
        const res = await fetch(`/api/file/${section.fileUrl}`, {
          method: 'HEAD',
          signal: cancelSignal,
        });
        const contentType = res.headers.get('Content-Type');
        setIsVideo(contentType && contentType.startsWith('video/'));
      } catch (error) {}
    };
    checkHeader();
    return () => {
      controller.abort();
    };
  }, []);

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
      {isVideo ? (
        <Card>
          <CardMedia
            controls
            component="video"
            src={`/api/file/${section.fileUrl}`}
          />
        </Card>
      ) : (
        <img
          style={{ maxWidth: '100%' }}
          src={`/api/file/${section.fileUrl}`}
          alt={section.altText[language]}
        />
      )}
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <Link href={`/api/file/${section.fileUrl}`} target={'__blank'}>
          {tr.ImageSection.openInNewTab}
        </Link>
      </div>
    </>
  );
}
