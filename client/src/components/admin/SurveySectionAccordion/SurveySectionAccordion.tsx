import {
  Conditions,
  SurveyCategorizedCheckboxQuestion,
  SurveyCheckboxQuestion,
  SurveyDocumentSection,
  SurveyFollowUpSection,
  SurveyFreeTextQuestion,
  SurveyGroupedCheckboxQuestion,
  SurveyImageSection,
  SurveyMapQuestion,
  SurveyMatrixQuestion,
  SurveyMultiMatrixQuestion,
  SurveyNumericQuestion,
  SurveyPageSection,
  SurveyPersonalInfoQuestion,
  SurveyRadioQuestion,
  SurveySliderQuestion,
  SurveySortingQuestion,
  SurveyTextSection,
} from '@interfaces/survey';
import {
  Article,
  AttachFile,
  CheckBox,
  ContentCopy,
  DragIndicator,
  ExpandMore,
  FormatListNumbered,
  Image,
  LibraryAddCheck,
  LinearScale,
  Looks4,
  Map,
  Person,
  RadioButtonChecked,
  Subject,
  TextFields,
  ViewComfy,
  ViewComfyAlt,
} from '@mui/icons-material';
import {
  Accordion,
  AccordionSummary,
  IconButton,
  SxProps,
  Tooltip,
  Typography,
} from '@mui/material';

import { useClipboard } from '@src/stores/ClipboardContext';
import { useToasts } from '@src/stores/ToastContext';
import { useTranslations } from '@src/stores/TranslationContext';
import {
  replaceIdsWithNull,
  replaceTranslationsWithNull,
} from '@src/utils/schemaValidation';
import React, {
  Component,
  ReactElement,
  ReactNode,
  useMemo,
  useRef,
  useState,
} from 'react';
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
import { SectionDetails } from './SectionDetails';
import { DragHandle } from '@src/components/DragAndDrop/SortableItem';
import { EditPersonalInfoQuestion } from '../EditPersonalInfoQuestion';
import EditCategorizedCheckBoxQuestion from '../EditCategorizedCheckBoxQuestion/EditCategorizedCheckBoxQuestion';
import { CategorizedCheckboxIcon } from '@src/components/icons/CategorizedCheckboxIcon';

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
  index: number;
  section: SurveyPageSection;
  expanded: boolean;
  className?: string;
  disabled?: boolean;
  onExpandedChange: (isExpanded: boolean) => void;
  name: string;
  onEdit: (index: number, section: SurveyPageSection) => void;
  onDelete: (index: number) => void;
  disableSectionCopying?: boolean;
  pageId?: number;
  isDragging?: boolean;
  sx?: SxProps;
}

export default function SurveySectionAccordion(props: Props) {
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);

  const { tr, surveyLanguage } = useTranslations();
  const { setSection, clipboardPage } = useClipboard();
  const { showToast } = useToasts();

  // Index is used inside a callback function -> useRef is required in React to catch all updates
  const indexRef = useRef<number>(null);
  indexRef.current = props.index;

  function handleEdit(section: SurveyPageSection) {
    props.onEdit(indexRef.current, section);
  }

  function handleDelete() {
    props.onDelete(indexRef.current);
  }

  const accordions: {
    [type in SurveyPageSection['type']]: {
      icon: ReactElement;
      tooltip: string;
      form: ReactNode;
    };
  } = {
    'personal-info': {
      icon: <Person />,
      tooltip: tr.SurveySection.personalInfoQuestion,
      form: (
        <EditPersonalInfoQuestion
          section={props.section as SurveyPersonalInfoQuestion}
          onChange={handleEdit}
        />
      ),
    },
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
      icon: <CategorizedCheckboxIcon />,
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
      icon: <CategorizedCheckboxIcon />,
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
        {...(props.sx && { sx: props.sx })}
        slotProps={{ heading: { component: 'div' } }}
        expanded={props.expanded}
        onChange={(_, isExpanded) => {
          props.onExpandedChange(isExpanded);
        }}
        {...(props.className && { className: props.className })}
        sx={styles.accordion}
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
          <div style={{ display: 'flex', paddingLeft: '1rem' }}>
            {accordion.tooltip ? (
              <Tooltip title={accordion.tooltip}>{accordion.icon}</Tooltip>
            ) : (
              accordion.icon
            )}
          </div>

          <Typography sx={styles.sectionTitle}>
            {props.section.title?.[surveyLanguage] || (
              <em>{tr.EditSurveyPage.untitledSection}</em>
            )}
          </Typography>
          {!props.disableSectionCopying && (
            <IconButton
              onClick={async (event) => {
                event.stopPropagation();
                event.preventDefault();

                // Remove all IDs from the section JSON to prevent unwanted references
                // Create deep copy to avoid unwanted side effects on original

                const deepCopy = replaceTranslationsWithNull(
                  replaceIdsWithNull({
                    ...structuredClone(props.section),
                  }),
                );
                const copiedSurveySection: SurveyPageSection = {
                  ...deepCopy,
                  followUpSections: deepCopy.followUpSections?.map(
                    (fus: SurveyFollowUpSection) => {
                      return {
                        ...fus,
                        conditions: {
                          equals: [],
                          lessThan: [],
                          greaterThan: [],
                        } as Conditions,
                      };
                    },
                  ),
                };
                // Store section to locale storage for other browser tabs to get access to it
                localStorage.setItem(
                  'clipboard-content',
                  JSON.stringify({
                    clipboardSection: copiedSurveySection,
                    clipboardPage,
                  }),
                );
                // Store section to context for the currently active browser tab to get access to it
                setSection(copiedSurveySection);
                showToast({
                  message: tr.EditSurveyPage.sectionCopied,
                  severity: 'success',
                });
              }}
            >
              <ContentCopy />
            </IconButton>
          )}
          <DragHandle isDragging={props.isDragging}>
            <DragIndicator />
          </DragHandle>
        </AccordionSummary>

        <SectionDetails
          pageId={props.pageId}
          disabled={props.disabled}
          section={props.section}
          handleEdit={handleEdit}
          accordion={accordion}
          setDeleteConfirmDialogOpen={setDeleteConfirmDialogOpen}
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
