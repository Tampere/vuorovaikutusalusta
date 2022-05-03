import {
  SurveyCheckboxQuestion,
  SurveyDocumentSection,
  SurveyFreeTextQuestion,
  SurveyGroupedCheckboxQuestion,
  SurveyImageSection,
  SurveyMapQuestion,
  SurveyMatrixQuestion,
  SurveyNumericQuestion,
  SurveyPageSection,
  SurveyRadioQuestion,
  SurveySliderQuestion,
  SurveySortingQuestion,
  SurveyTextSection,
} from '@interfaces/survey';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  TextField,
  Typography,
  Tooltip,
} from '@material-ui/core';
import {
  CheckBox,
  DragIndicator,
  ExpandMore,
  FormatListNumbered,
  LibraryAddCheck,
  LinearScale,
  Looks4,
  Map,
  RadioButtonChecked,
  Subject,
  TextFields,
  ViewComfy,
  Image,
  Article,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { ReactNode, useMemo, useState } from 'react';
import { DraggableProvided } from 'react-beautiful-dnd';
import ConfirmDialog from '../ConfirmDialog';
import RichTextEditor from '../RichTextEditor';
import EditCheckBoxQuestion from './EditCheckBoxQuestion';
import EditFreeTextQuestion from './EditFreeTextQuestion';
import EditMapQuestion from './EditMapQuestion';
import EditNumericQuestion from './EditNumericQuestion';
import EditRadioQuestion from './EditRadioQuestion';
import EditSliderQuestion from './EditSliderQuestion';
import EditSortingQuestion from './EditSortingQuestion';
import EditTextSection from './EditTextSection';
import EditMatrixQuestion from './EditMatrixQuestion';
import EditGroupedCheckBoxQuestion from './EditGroupedCheckBoxQuestion';
import EditImageSection from './EditImageSection';
import EditDocumentSection from './EditDocumentSection';

const useStyles = makeStyles({
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
});

interface Props {
  section: SurveyPageSection;
  expanded: boolean;
  className?: string;
  disabled?: boolean;
  onExpandedChange: (isExpanded: boolean) => void;
  name: string;
  onEdit: (section: SurveyPageSection) => void;
  onDelete: () => void;
  provided: DraggableProvided;
}

export default function SurveySectionAccordion(props: Props) {
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);

  const classes = useStyles();
  const { tr } = useTranslations();

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
          onChange={(section) => {
            props.onEdit(section);
          }}
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
          onChange={(section) => {
            props.onEdit(section);
          }}
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
          onChange={(section) => {
            props.onEdit(section);
          }}
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
          onChange={(section) => {
            props.onEdit(section);
          }}
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
          onChange={(section) => {
            props.onEdit(section);
          }}
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
          onChange={(section) => {
            props.onEdit(section);
          }}
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
          onChange={(section) => {
            props.onEdit(section);
          }}
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
          onChange={(section) => {
            props.onEdit(section);
          }}
        />
      ),
    },
    matrix: {
      icon: <ViewComfy />,
      tooltip: tr.SurveySection.matrixQuestion,
      form: (
        <EditMatrixQuestion
          disabled={props.disabled}
          section={props.section as SurveyMatrixQuestion}
          onChange={(section) => props.onEdit(section)}
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
          onChange={(section) => {
            props.onEdit(section);
          }}
        />
      ),
    },
    image: {
      icon: <Image />,
      tooltip: tr.SurveySection.imageSection,
      form: (
        <EditImageSection
          section={props.section as SurveyImageSection}
          onChange={(section) => props.onEdit(section)}
        />
      ),
    },
    document: {
      icon: <Article />,
      tooltip: tr.SurveySection.documentSection,
      form: (
        <EditDocumentSection
          section={props.section as SurveyDocumentSection}
          onChange={(section) => props.onEdit(section)}
        />
      ),
    },
  };

  const accordion = useMemo(() => {
    return accordions[props.section.type];
  }, [props.section, props.disabled]);

  return (
    <>
      <Accordion
        {...props.provided.draggableProps}
        ref={props.provided.innerRef}
        expanded={props.expanded}
        onChange={(_, isExpanded) => {
          props.onExpandedChange(isExpanded);
        }}
        className={props.className ?? classes.accordion}
      >
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls={`${props.name}-content`}
          id={`${props.name}-header`}
        >
          {accordion.tooltip ? (
            <Tooltip title={accordion.tooltip}>{accordion.icon as any}</Tooltip>
          ) : (
            accordion.icon
          )}
          <Typography className={classes.sectionTitle}>
            {props.section.title || (
              <em>{tr.EditSurveyPage.untitledSection}</em>
            )}
          </Typography>
          <div {...props.provided.dragHandleProps} style={{ display: 'flex' }}>
            <DragIndicator />
          </div>
        </AccordionSummary>
        <AccordionDetails className={classes.content}>
          <TextField
            autoFocus
            disabled={props.disabled}
            label={tr.EditSurveyPage.title}
            value={props.section.title}
            variant="standard"
            onChange={(event) => {
              props.onEdit({ ...props.section, title: event.target.value });
            }}
          />
          {accordion.form}
          <FormGroup row>
            <FormControlLabel
              label={tr.SurveySections.sectionInfo}
              control={
                <Checkbox
                  name="section-info"
                  checked={props.section.showInfo ?? false}
                  onChange={(event) =>
                    props.onEdit({
                      ...props.section,
                      showInfo: event.target.checked,
                      info: !event.target.checked ? '' : props.section.info,
                    })
                  }
                />
              }
            />
          </FormGroup>
          {props.section.showInfo && (
            <RichTextEditor
              value={props.section.info}
              label={tr.EditTextSection.text}
              onChange={(value) =>
                props.onEdit({ ...props.section, info: value })
              }
            />
          )}
          <FormGroup row>
            <Button
              variant="contained"
              disabled={props.disabled}
              onClick={() => {
                setDeleteConfirmDialogOpen(true);
              }}
            >
              {tr.EditSurveyPage.deleteSection}
            </Button>
          </FormGroup>
        </AccordionDetails>
      </Accordion>
      <ConfirmDialog
        open={deleteConfirmDialogOpen}
        text={tr.EditSurveyPage.confirmDeleteSection}
        onClose={(result) => {
          setDeleteConfirmDialogOpen(false);
          if (result) {
            props.onDelete();
          }
        }}
      />
    </>
  );
}
