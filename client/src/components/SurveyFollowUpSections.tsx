import { Box, Collapse, Grow, Typography } from '@mui/material';
import { useSurveyAnswers } from '@src/stores/SurveyAnswerContext';
import React, { useState } from 'react';
import {
  SurveyFollowUpSection,
  SurveyQuestion as SurveyQuestionType,
} from '@interfaces/survey';
import SurveyQuestion from './SurveyQuestion';
import DocumentSection from './DocumentSection';
import ImageSection from './ImageSection';
import TextSection from './TextSection';
import { useTranslations } from '@src/stores/TranslationContext';
import { AnswerItem } from './admin/SubmissionsPage/AnswersList';

interface Props {
  section: SurveyQuestionType;
  pageUnfinished: boolean;
  mobileDrawerOpen: boolean;
  answer?: AnswerItem; // For submissions page
}

export function SurveyFollowUpSections({
  section,
  pageUnfinished,
  mobileDrawerOpen,
  answer,
}: Props) {
  const { getFollowUpSectionsToDisplay } = useSurveyAnswers();

  const { tr } = useTranslations();

  if (!section.followUpSections) return null;

  let followUpSectionsToDisplay: SurveyFollowUpSection[];
  // Sections are displayed in a survey
  if (!answer) {
    const followUpSectionIds = getFollowUpSectionsToDisplay(section);

    followUpSectionsToDisplay = section.followUpSections?.filter((sect) =>
      followUpSectionIds.includes(sect.id),
    );
    // Sections are displayed in submissions page answer list
  } else {
    const answeredSectionIds = answer.submission.answerEntries
      .filter((answer) => answer.value)
      .map((answer) => answer.sectionId);

    followUpSectionsToDisplay = section.followUpSections?.filter((sect) =>
      answeredSectionIds.includes(sect.id),
    );
  }

  return (
    <Collapse in={!!followUpSectionsToDisplay?.length} appear={!!answer}>
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
          sect.type !== 'text' &&
          sect.type !== 'image' &&
          sect.type !== 'document' &&
          answer ? (
            <SurveyQuestion
              readOnly
              value={
                answer.submission.answerEntries.find(
                  (entry) => entry.sectionId === sect.id,
                ).value
              }
              isFollowUp
              key={sect.id}
              question={sect}
              pageUnfinished={pageUnfinished}
              mobileDrawerOpen={mobileDrawerOpen}
            />
          ) : sect.type === 'text' ? (
            <TextSection isFollowUp key={sect.id} section={sect} />
          ) : sect.type === 'image' ? (
            <ImageSection isFollowUp key={sect.id} section={sect} />
          ) : sect.type === 'document' ? (
            <DocumentSection isFollowUp key={sect.id} section={sect} />
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
      </Box>
    </Collapse>
  );
}
