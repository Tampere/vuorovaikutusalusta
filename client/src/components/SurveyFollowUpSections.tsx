import { Box, Typography } from '@mui/material';
import { useSurveyAnswers } from '@src/stores/SurveyAnswerContext';
import React from 'react';
import { SurveyQuestion as SurveyQuestionType } from '@interfaces/survey';
import SurveyQuestion from './SurveyQuestion';
import DocumentSection from './DocumentSection';
import ImageSection from './ImageSection';
import TextSection from './TextSection';
import { useTranslations } from '@src/stores/TranslationContext';

interface Props {
  section: SurveyQuestionType;
  pageUnfinished: boolean;
  mobileDrawerOpen: boolean;
}

export function SurveyFollowUpSections({
  section,
  pageUnfinished,
  mobileDrawerOpen,
}: Props) {
  const { getFollowUpSectionsToDisplay } = useSurveyAnswers();
  const { tr } = useTranslations();

  const followUpSectionIds = getFollowUpSectionsToDisplay(section);

  if (followUpSectionIds.length === 0) return null;

  const followUpSectionsToDisplay = section.followUpSections.filter((sect) =>
    followUpSectionIds.includes(sect.id),
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#E4E4E4',
        borderRadius: '6px',
        padding: '0.75rem',
        margin: '0.75rem 0',
        '& .MuiInputBase-root': {
          backgroundColor: 'white',
        },
        gap: '30px',
      }}
      className="follow-up-sections-container"
    >
      <>
        <Typography
          variant="body1"
          component="h4"
          sx={{
            fontWeight: 700,
            color: '#676767',
          }}
        >
          {tr.SurveyStepper.followUpSections}
        </Typography>
        {followUpSectionsToDisplay.map((sect) =>
          sect.type === 'text' ? (
            <TextSection key={sect.id} section={sect} />
          ) : sect.type === 'image' ? (
            <ImageSection key={sect.id} section={sect} />
          ) : sect.type === 'document' ? (
            <DocumentSection key={sect.id} section={sect} />
          ) : (
            <SurveyQuestion
              isFollowUp
              key={sect.id}
              question={sect}
              pageUnfinished={pageUnfinished}
              mobileDrawerOpen={mobileDrawerOpen}
            />
          ),
        )}
      </>
    </Box>
  );
}
