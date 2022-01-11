import {
  SurveyCheckboxQuestion,
  SurveyFreeTextQuestion,
  SurveyMapQuestion,
  SurveyPageSection,
  SurveyRadioQuestion,
  SurveyTextSection,
} from '@interfaces/survey';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  FormGroup,
  TextField,
  Typography,
} from '@material-ui/core';
import {
  CheckBox,
  ExpandMore,
  Map,
  RadioButtonChecked,
  Subject,
  TextFields,
  Tune,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { ReactNode, useMemo, useState } from 'react';
import ConfirmDialog from '../ConfirmDialog';
import EditCheckBoxQuestion from './EditCheckBoxQuestion';
import EditFreeTextQuestion from './EditFreeTextQuestion';
import EditMapQuestion from './EditMapQuestion';
import EditRadioQuestion from './EditRadioQuestion';
import EditTextSection from './EditTextSection';

const useStyles = makeStyles({
  accordion: {
    background: '#ddd',
  },
  sectionTitle: {
    marginLeft: '0.5rem',
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
}

export default function SurveySectionAccordion(props: Props) {
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);

  const classes = useStyles();
  const { tr } = useTranslations();

  const accordions: {
    [type in SurveyPageSection['type']]: { icon: ReactNode; form: ReactNode };
  } = {
    checkbox: {
      icon: <CheckBox />,
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
      icon: <Tune />,
      form: <></>,
    },
    map: {
      icon: <Map />,
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
        className={props.className ?? classes.accordion}
      >
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls={`${props.name}-content`}
          id={`${props.name}-header`}
        >
          {accordion.icon}
          <Typography className={classes.sectionTitle}>
            {props.section.title || (
              <em>{tr.EditSurveyPage.untitledSection}</em>
            )}
          </Typography>
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
          {accordion.form}
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
