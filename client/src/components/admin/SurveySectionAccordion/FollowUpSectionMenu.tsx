import { Divider, Typography, Box, Button } from '@mui/material';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { ReactNode, useEffect, useState } from 'react';
import AddSurveySectionActions from '../AddSurveySectionActions';
import { useSurvey } from '@src/stores/SurveyContext';
import { SurveyPageSection } from '@interfaces/survey';
import { FollowUpSectionDetails } from './FollowUpSectionDetails';

interface Props {
  accordion: {
    icon: ReactNode;
    tooltip: string;
    form: ReactNode;
  };
  pageId: number;
  parentTitle: string;
  section: SurveyPageSection;
  parentSection: SurveyPageSection;
  parentSectionIndex: number;
}

export function FollowUpSectionMenu({
  accordion,
  parentTitle,
  section,
  parentSection,
  parentSectionIndex,
  pageId,
}: Props) {
  const { tr } = useTranslations();
  const { activeSurveyLoading, editFollowUpSection } = useSurvey();
  const [loading, setLoading] = useState(true);
  const [sectionActionsOpen, setSectionActionsOpen] = useState(false);

  // Reflect loading status when e.g. the entire survey is being saved
  useEffect(() => {
    setLoading(activeSurveyLoading);
  }, [activeSurveyLoading]);

  return (
    <Box
      sx={{
        maxHeight: '960px',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        gap: 2,
        overflowY: 'auto',

        '& .MuiDivider-root': {
          color: '#BFBFBF',
          '&::before': {
            width: '0%',
          },
          '& .MuiDivider-wrapper': { paddingLeft: 0 },
          '& .MuiTypography-root': {
            color: '#7B7B7B',
            fontWeight: 700,
          },
        },
      }}
    >
      <Typography>
        {`${tr.EditSurveyPage.followUpSection.title} `}
        <i>{parentTitle}</i>
      </Typography>
      <Divider orientation="horizontal">
        <Typography>{tr.EditSurveyPage.followUpSection.conditions}</Typography>
      </Divider>
      <div></div>
      <Divider orientation="horizontal">
        <Typography>{tr.EditSurveyPage.followUpSection.question}</Typography>
      </Divider>
      {!sectionActionsOpen && section?.type ? (
        <FollowUpSectionDetails
          setDeleteConfirmDialogOpen={() =>
            console.log('setting delete confirm dialog open')
          }
          accordion={accordion}
          handleEdit={(section) =>
            editFollowUpSection(
              pageId,
              parentSection.id,
              parentSectionIndex,
              section,
            )
          }
          section={section}
        />
      ) : (
        <AddSurveySectionActions
          disabled={loading}
          onAdd={(section) =>
            editFollowUpSection(
              pageId,
              parentSection.id,
              parentSectionIndex,
              section,
            )
          }
          followUpSectionId={section.id}
        />
      )}
      {section?.type && (
        <Button
          variant="contained"
          sx={{ marginLeft: 'auto' }}
          onClick={() => setSectionActionsOpen((prev) => !prev)}
        >
          {!sectionActionsOpen && section?.type
            ? tr.EditSurveyPage.followUpSection.changeType
            : tr.EditSurveyPage.followUpSection.cancel}
        </Button>
      )}
    </Box>
  );
}
