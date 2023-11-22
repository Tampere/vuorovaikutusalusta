import { SurveyFollowUpSection, SurveyPageSection } from '@interfaces/survey';
import { Fab, Grid, Typography } from '@mui/material';
import {
  Article,
  AttachFile,
  CheckBox,
  ContentPaste,
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
import { makeStyles } from '@mui/styles';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { ReactNode, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useClipboard } from '@src/stores/ClipboardContext';
import { useSurvey } from '@src/stores/SurveyContext';
import { useToasts } from '@src/stores/ToastContext';

const useStyles = makeStyles({
  actionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
});

interface Props {
  followUpSectionId?: number;
  types?: SurveyPageSection['type'][];
  disabled?: boolean;
  onAdd: (newSection: SurveyPageSection | SurveyFollowUpSection) => void;
}

export default function AddSurveySectionActions(props: Props) {
  const classes = useStyles();
  const { tr, initializeLocalizedObject } = useTranslations();
  const { addSection } = useSurvey();
  const { clipboardSection } = useClipboard();
  const { showToast } = useToasts();
  const { pageId } = useParams<{
    pageId: string;
  }>();

  // Sequence for making each section ID unique before they're added to database
  const [sectionSequence, setSectionSequence] = useState(-1);

  const defaultSections: {
    [type in SurveyPageSection['type']]: SurveyPageSection;
  } = {
    checkbox: {
      type: 'checkbox',
      title: initializeLocalizedObject(''),
      isRequired: false,
      info: null,
      options: [{ text: initializeLocalizedObject('') }],
      answerLimits: null,
      allowCustomAnswer: false,
    },
    radio: {
      type: 'radio',
      title: initializeLocalizedObject(''),
      isRequired: false,
      info: null,
      options: [{ text: initializeLocalizedObject('') }],
      allowCustomAnswer: false,
    },
    numeric: {
      type: 'numeric',
      title: initializeLocalizedObject(''),
      isRequired: false,
      info: null,
      minValue: null,
      maxValue: null,
    },
    map: {
      type: 'map',
      title: initializeLocalizedObject(''),
      isRequired: false,
      info: null,
      selectionTypes: [],
      featureStyles: {
        point: {
          markerIcon: null,
        },
        line: {
          strokeStyle: null,
          strokeColor: null,
        },
        area: {
          strokeStyle: null,
          strokeColor: null,
        },
      },
      subQuestions: [],
    },
    'free-text': {
      type: 'free-text',
      isRequired: false,
      info: null,
      title: initializeLocalizedObject(''),
    },
    text: {
      type: 'text',
      title: initializeLocalizedObject(''),
      body: initializeLocalizedObject(''),
      bodyColor: '#000000',
      info: null,
    },
    sorting: {
      type: 'sorting',
      title: initializeLocalizedObject(''),
      options: [{ text: initializeLocalizedObject('') }],
      isRequired: false,
      info: null,
    },
    slider: {
      type: 'slider',
      isRequired: false,
      info: null,
      title: initializeLocalizedObject(''),
      presentationType: 'literal',
      minValue: 0,
      maxValue: 10,
      minLabel: initializeLocalizedObject(''),
      maxLabel: initializeLocalizedObject(''),
    },
    matrix: {
      type: 'matrix',
      isRequired: false,
      title: initializeLocalizedObject(''),
      info: null,
      classes: [],
      subjects: [],
      allowEmptyAnswer: false,
    },
    'multi-matrix': {
      type: 'multi-matrix',
      isRequired: false,
      title: initializeLocalizedObject(''),
      info: null,
      classes: [],
      subjects: [],
      allowEmptyAnswer: false,
      answerLimits: {
        min: 0,
        max: 1,
      },
    },
    'grouped-checkbox': {
      type: 'grouped-checkbox',
      isRequired: false,
      title: initializeLocalizedObject(''),
      answerLimits: {
        min: 0,
        max: 2,
      },
      groups: [],
    },
    image: {
      type: 'image',
      title: initializeLocalizedObject(''),
      fileName: null,
      filePath: [],
      altText: initializeLocalizedObject(''),
    },
    document: {
      type: 'document',
      title: initializeLocalizedObject(''),
      fileName: null,
      filePath: [],
    },
    attachment: {
      type: 'attachment',
      isRequired: false,
      title: initializeLocalizedObject(''),
    },
  };

  function handleAdd(type: SurveyPageSection['type']) {
    return () => {
      const id = props.followUpSectionId ?? sectionSequence;
      if (!props.followUpSectionId) setSectionSequence(sectionSequence - 1);
      props.onAdd({
        ...defaultSections[type],
        id,
      });
    };
  }

  const questionButtons: {
    type: SurveyPageSection['type'];
    label: string;
    ariaLabel: string;
    icon: ReactNode;
  }[] = [
    {
      type: 'radio',
      label: tr.AddSurveySectionActions.radioQuestion,
      ariaLabel: 'add-radio-question',
      icon: <RadioButtonChecked />,
    },
    {
      type: 'checkbox',
      label: tr.AddSurveySectionActions.checkBoxQuestion,
      ariaLabel: 'add-checkbox-question',
      icon: <CheckBox />,
    },
    {
      type: 'free-text',
      label: tr.AddSurveySectionActions.freeTextQuestion,
      ariaLabel: 'add-free-text-question',
      icon: <TextFields />,
    },
    {
      type: 'numeric',
      label: tr.AddSurveySectionActions.numericQuestion,
      ariaLabel: 'add-numeric-question',
      icon: <Looks4 />,
    },
    {
      type: 'map',
      label: tr.AddSurveySectionActions.mapQuestion,
      ariaLabel: 'add-map-question',
      icon: <Map />,
    },
    {
      type: 'sorting',
      label: tr.AddSurveySectionActions.sortingQuestion,
      ariaLabel: 'add-sorting-question',
      icon: <FormatListNumbered />,
    },
    {
      type: 'slider',
      label: tr.AddSurveySectionActions.sliderQuestion,
      ariaLabel: 'add-slider-question',
      icon: <LinearScale />,
    },
    {
      type: 'matrix',
      label: tr.AddSurveySectionActions.matrixQuestion,
      ariaLabel: 'add-matrix-question',
      icon: <ViewComfy />,
    },
    {
      type: 'multi-matrix',
      label: tr.AddSurveySectionActions.multiMatrixQuestion,
      ariaLabel: 'add-multiple-choice-matrix-question',
      icon: <ViewComfyAlt />,
    },
    {
      type: 'grouped-checkbox',
      label: tr.AddSurveySectionActions.groupedCheckboxQuestion,
      ariaLabel: 'add-grouped-checkbox-question',
      icon: <LibraryAddCheck />,
    },
    {
      type: 'attachment',
      label: tr.AddSurveySectionActions.attachmentSection,
      ariaLabel: 'add-attachment-section',
      icon: <AttachFile />,
    },
  ];

  const sectionButtons: {
    type: SurveyPageSection['type'];
    label: string;
    ariaLabel: string;
    icon: ReactNode;
  }[] = [
    {
      type: 'text',
      label: tr.AddSurveySectionActions.textSection,
      ariaLabel: 'add-text-section',
      icon: <Subject />,
    },
    {
      type: 'image',
      label: tr.AddSurveySectionActions.imageSection,
      ariaLabel: 'add-image-section',
      icon: <Image />,
    },
    {
      type: 'document',
      label: tr.AddSurveySectionActions.documentSection,
      ariaLabel: 'add-document-section',
      icon: <Article />,
    },
  ];

  return (
    <Grid container>
      <Grid container direction="row">
        <Grid item xs={12} md={6}>
          {questionButtons
            .filter(
              (button) => !props.types || props.types.includes(button.type),
            )
            .map((button) => (
              <Grid item key={button.type} style={{ padding: '0.5rem' }}>
                <div className={classes.actionItem}>
                  <Fab
                    color="primary"
                    aria-label={button.ariaLabel}
                    size="small"
                    onClick={handleAdd(button.type)}
                    disabled={props.disabled}
                    style={{ minWidth: '40px' }}
                  >
                    {button.icon}
                  </Fab>
                  <Typography>{button.label}</Typography>
                </div>
              </Grid>
            ))}
        </Grid>
        <Grid item xs={12} md={6}>
          {sectionButtons
            .filter(
              (button) => !props.types || props.types.includes(button.type),
            )
            .map((button) => (
              <Grid item key={button.type} style={{ padding: '0.5rem' }}>
                <div className={classes.actionItem}>
                  <Fab
                    color="primary"
                    aria-label={button.ariaLabel}
                    size="small"
                    onClick={handleAdd(button.type)}
                    disabled={props.disabled}
                  >
                    {button.icon}
                  </Fab>
                  <Typography>{button.label}</Typography>
                </div>
              </Grid>
            ))}
          <Grid item style={{ padding: '0.5rem' }}>
            <div className={classes.actionItem}>
              <Fab
                disabled={!clipboardSection}
                color="secondary"
                aria-label={'attach-section-from-clipboard'}
                size="small"
                onClick={() => {
                  // Copy content from Clipboard context to active survey
                  if (clipboardSection) {
                    addSection(Number(pageId), {
                      ...clipboardSection,
                      id: sectionSequence,
                    });
                    setSectionSequence((prev) => prev - 1);

                    if (clipboardSection.type === 'map') {
                      showToast({
                        severity: 'warning',
                        autoHideDuration: 30000,
                        message: tr.EditSurveyPage.sectionAttached,
                      });
                    }
                  }
                }}
              >
                <ContentPaste />
              </Fab>
              <Typography>{tr.EditSurveyPage.attachSection}</Typography>
            </div>
          </Grid>

          <Grid
            item
            style={{
              padding: '0.5rem',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          ></Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
