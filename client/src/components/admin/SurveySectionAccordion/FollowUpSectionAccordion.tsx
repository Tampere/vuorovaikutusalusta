import {
  SurveyCategorizedCheckboxQuestion,
  SurveyCheckboxQuestion,
  SurveyDocumentSection,
  SurveyFollowUpSection,
  SurveyFollowUpSectionParent,
  SurveyFreeTextQuestion,
  SurveyGroupedCheckboxQuestion,
  SurveyImageSection,
  SurveyMapQuestion,
  SurveyMatrixQuestion,
  SurveyMultiMatrixQuestion,
  SurveyNumericQuestion,
  SurveyPageSection,
  SurveyRadioQuestion,
  SurveySliderQuestion,
  SurveySortingQuestion,
  SurveyTextSection,
} from '@interfaces/survey';
import {
  Article,
  AttachFile,
  CheckBox,
  DragIndicator,
  ExpandMore,
  FormatListNumbered,
  Image,
  LibraryAddCheck,
  LinearScale,
  Looks4,
  Map,
  RadioButtonChecked,
  Subject,
  TextFields,
  ViewComfy,
  ViewComfyAlt,
} from '@mui/icons-material';
import {
  Accordion,
  AccordionSummary,
  Tooltip,
  Typography,
} from '@mui/material';

import { FollowUpListItemIcon } from '@src/components/icons/FollowUpListItemIcon';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { ReactNode, useMemo, useRef, useState } from 'react';

import ConfirmDialog from '../../ConfirmDialog';
import EditAttachmentSection from '../EditAttachmentSection';
import EditCheckBoxQuestion from '../EditCheckBoxQuestion';
import EditDocumentSection from '../EditDocumentSection';
import EditFreeTextQuestion from '../EditFreeTextQuestion';
import EditGroupedCheckBoxQuestion from '../EditGroupedCheckBoxQuestion';
import EditImageSection from '../EditImageSection';
import EditMapQuestion from '../EditMapQuestion';
import EditMatrixQuestion from '../EditMatrixQuestion';
import { EditMultiMatrixQuestion } from '../EditMultiMatrixQuestion';
import EditNumericQuestion from '../EditNumericQuestion';
import EditRadioQuestion from '../EditRadioQuestion';
import EditSliderQuestion from '../EditSliderQuestion';
import EditSortingQuestion from '../EditSortingQuestion';
import EditTextSection from '../EditTextSection';
import { FollowUpSectionMenu } from './FollowUpSectionMenu';
import { DragHandle } from '@src/components/DragAndDrop/SortableItem';
import EditCategorizedCheckBoxQuestion from '../EditCategorizedCheckBoxQuestion/EditCategorizedCheckBoxQuestion';

const styles = {
  accordion: {
    background: '#ddd',
  },
  sectionTitle: {
    marginLeft: '0.5rem',
    flexGrow: 1,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  answerLimitInput: {
    marginRight: '1rem',
  },
  customAccordionSummary: {
    flexDirection: 'row-reverse',
    margin: 0,
  },
  contentGutters: {
    alignItems: 'center',
    margin: 0,
  },
};

interface Props {
  pageId: number;
  isLastItem: boolean;
  index: number;
  parentSectionIndex: number;
  section: SurveyFollowUpSection;
  parentSection: SurveyFollowUpSectionParent;
  expanded: boolean;
  className?: string;
  disabled?: boolean;
  onExpandedChange: (isExpanded: boolean) => void;
  name: string;
  onEdit: (section: SurveyPageSection | SurveyFollowUpSection) => void;
  onDelete: (index: number) => void;
  isDragging?: boolean;
}

export function FollowUpSectionAccordion(props: Props) {
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);

  const { tr, surveyLanguage } = useTranslations();

  // Index is used inside a callback function -> useRef is required in React to catch all updates
  const indexRef = useRef<number>(null);
  indexRef.current = props.index;

  function handleEdit(section: SurveyPageSection | SurveyFollowUpSection) {
    props.onEdit(section);
  }

  function handleDelete() {
    props.onDelete(indexRef.current);
  }

  const accordions: {
    [type in SurveyPageSection['type']]: {
      icon: ReactNode;
      tooltip: string;
      form: ReactNode;
    };
  } = {
    checkbox: {
      icon: <CheckBox />,
      tooltip: tr.SurveySection.checkBoxQuestion,
      form: (
        <EditCheckBoxQuestion
          disabled={props.disabled}
          section={props.section as SurveyCheckboxQuestion}
          onChange={handleEdit}
        />
      ),
    },
    radio: {
      icon: <RadioButtonChecked />,
      tooltip: tr.SurveySection.radioQuestion,
      form: (
        <EditRadioQuestion
          disabled={props.disabled}
          section={props.section as SurveyRadioQuestion}
          onChange={handleEdit}
        />
      ),
    },
    numeric: {
      icon: <Looks4 />,
      tooltip: tr.SurveySection.numericQuestion,
      form: (
        <EditNumericQuestion
          disabled={props.disabled}
          section={props.section as SurveyNumericQuestion}
          onChange={handleEdit}
        />
      ),
    },
    map: {
      icon: <Map />,
      tooltip: tr.SurveySection.mapQuestion,
      form: (
        <EditMapQuestion
          disabled={props.disabled}
          section={props.section as SurveyMapQuestion}
          onChange={handleEdit}
        />
      ),
    },
    'free-text': {
      icon: <TextFields />,
      tooltip: tr.SurveySection.freeTextQuestion,
      form: (
        <EditFreeTextQuestion
          disabled={props.disabled}
          section={props.section as SurveyFreeTextQuestion}
          onChange={handleEdit}
        />
      ),
    },
    text: {
      icon: <Subject />,
      tooltip: tr.SurveySection.textSection,
      form: (
        <EditTextSection
          disabled={props.disabled}
          section={props.section as SurveyTextSection}
          onChange={handleEdit}
        />
      ),
    },
    sorting: {
      icon: <FormatListNumbered />,
      tooltip: tr.SurveySection.sortingQuestion,
      form: (
        <EditSortingQuestion
          disabled={props.disabled}
          section={props.section as SurveySortingQuestion}
          onChange={handleEdit}
        />
      ),
    },
    slider: {
      icon: <LinearScale />,
      tooltip: tr.SurveySection.sliderQuestion,
      form: (
        <EditSliderQuestion
          disabled={props.disabled}
          section={props.section as SurveySliderQuestion}
          onChange={handleEdit}
        />
      ),
    },
    matrix: {
      icon: <ViewComfy />,
      tooltip: tr.SurveySection.matrixQuestion,
      form: (
        <EditMatrixQuestion
          section={props.section as SurveyMatrixQuestion}
          onChange={handleEdit}
        />
      ),
    },
    'multi-matrix': {
      icon: <ViewComfyAlt />,
      tooltip: tr.SurveySection.multiMatrixQuestion,
      form: (
        <EditMultiMatrixQuestion
          disabled={props.disabled}
          section={props.section as SurveyMultiMatrixQuestion}
          onChange={handleEdit}
        />
      ),
    },
    'grouped-checkbox': {
      icon: <LibraryAddCheck />,
      tooltip: tr.SurveySection.groupedCheckboxQuestion,
      form: (
        <EditGroupedCheckBoxQuestion
          disabled={props.disabled}
          section={props.section as SurveyGroupedCheckboxQuestion}
          onChange={handleEdit}
        />
      ),
    },
    'categorized-checkbox': {
      icon: <LibraryAddCheck />,
      tooltip: tr.SurveySection.categorizedCheckboxQuestion,
      form: (
        <EditCategorizedCheckBoxQuestion
          disabled={props.disabled}
          section={props.section as SurveyCategorizedCheckboxQuestion}
          onChange={handleEdit}
        />
      ),
    },
    image: {
      icon: <Image />,
      tooltip: tr.SurveySection.imageSection,
      form: (
        <EditImageSection
          section={props.section as SurveyImageSection}
          onChange={handleEdit}
        />
      ),
    },
    document: {
      icon: <Article />,
      tooltip: tr.SurveySection.documentSection,
      form: (
        <EditDocumentSection
          section={props.section as SurveyDocumentSection}
          onChange={handleEdit}
        />
      ),
    },
    attachment: {
      icon: <AttachFile />,
      tooltip: tr.SurveySection.attachmentSection,
      form: <EditAttachmentSection />,
    },
  };

  const accordion = useMemo(() => {
    return accordions[props.section.type];
  }, [props.section, props.disabled]);

  return (
    <>
      <Accordion
        expanded={props.expanded}
        onChange={(_, isExpanded) => {
          props.onExpandedChange(isExpanded);
        }}
        {...(props.className && { className: props.className })}
        sx={styles.accordion}
        style={{ backgroundColor: '#FDE1FF' }}
        slotProps={{ heading: { component: 'div' } }}
      >
        <AccordionSummary
          component="div"
          expandIcon={<ExpandMore />}
          aria-controls={`${props.name}-content`}
          id={`${props.name}-header`}
          sx={{
            ...styles.customAccordionSummary,
            '& .MuiAccordionSummary-contentGutters': styles.contentGutters,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '1rem',
            }}
          >
            {accordion?.tooltip ? (
              <Tooltip title={accordion.tooltip}>
                <div style={{ display: 'flex' }}>
                  <FollowUpListItemIcon lastItem={props.isLastItem} />
                  {accordion.icon as any}
                </div>
              </Tooltip>
            ) : (
              <div style={{ display: 'flex' }}>
                <FollowUpListItemIcon lastItem={props.isLastItem} />
                {accordion?.icon}
              </div>
            )}
          </div>

          <Typography sx={styles.sectionTitle}>
            {props.section.title?.[surveyLanguage] || (
              <em>{tr.EditSurveyPage.untitledSection}</em>
            )}
          </Typography>
          <DragHandle isDragging={props.isDragging}>
            <DragIndicator />
          </DragHandle>
        </AccordionSummary>

        <FollowUpSectionMenu
          accordion={accordion}
          pageId={props.pageId}
          section={props.section}
          parentTitle={props.parentSection?.title?.[surveyLanguage]}
          parentSection={props.parentSection}
          parentSectionIndex={props.parentSectionIndex}
        />
      </Accordion>
      <ConfirmDialog
        open={deleteConfirmDialogOpen}
        text={tr.EditSurveyPage.confirmDeleteSection}
        submitColor="error"
        onClose={(result) => {
          setDeleteConfirmDialogOpen(false);
          if (result) {
            handleDelete();
          }
        }}
      />
    </>
  );
}
