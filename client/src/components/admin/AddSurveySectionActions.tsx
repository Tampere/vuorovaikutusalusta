import { SurveyPageSection } from '@interfaces/survey';
import { Fab, Grid, Typography } from '@material-ui/core';
import {
  CheckBox,
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
  AttachFile,
  Article,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { ReactNode, useState } from 'react';

const useStyles = makeStyles({
  actionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
});

interface Props {
  types?: SurveyPageSection['type'][];
  disabled?: boolean;
  onAdd: (newSection: SurveyPageSection) => void;
}

export default function AddSurveySectionActions(props: Props) {
  const classes = useStyles();
  const { tr } = useTranslations();
  // Sequence for making each section ID unique before they're added to database
  const [sectionSequence, setSectionSequence] = useState(-1);

  const defaultSections: {
    [type in SurveyPageSection['type']]: SurveyPageSection;
  } = {
    checkbox: {
      type: 'checkbox',
      title: '',
      isRequired: false,
      info: null,
      options: [{ text: '' }],
      answerLimits: null,
      allowCustomAnswer: false,
    },
    radio: {
      type: 'radio',
      title: '',
      isRequired: false,
      info: null,
      options: [{ text: '' }],
      allowCustomAnswer: false,
    },
    numeric: {
      type: 'numeric',
      title: '',
      isRequired: false,
      info: null,
      minValue: null,
      maxValue: null,
    },
    map: {
      type: 'map',
      title: '',
      isRequired: false,
      info: null,
      selectionTypes: [],
      subQuestions: [],
    },
    'free-text': {
      type: 'free-text',
      isRequired: false,
      info: null,
      title: '',
    },
    text: {
      type: 'text',
      title: '',
      body: '',
      bodyColor: '#000000',
      info: null,
    },
    sorting: {
      type: 'sorting',
      title: '',
      options: [{ text: '' }],
      isRequired: false,
      info: null,
    },
    slider: {
      type: 'slider',
      isRequired: false,
      info: null,
      title: '',
      presentationType: 'literal',
      minValue: 0,
      maxValue: 10,
      minLabel: {
        fi: tr.EditSliderQuestion.defaultMinLabel,
      },
      maxLabel: {
        fi: tr.EditSliderQuestion.defaultMaxLabel,
      },
    },
    matrix: {
      type: 'matrix',
      isRequired: false,
      title: '',
      info: null,
      classes: [],
      subjects: [],
      allowEmptyAnswer: false,
    },
    'grouped-checkbox': {
      type: 'grouped-checkbox',
      isRequired: false,
      title: '',
      answerLimits: {
        min: 0,
        max: 2,
      },
      groups: [],
    },
    image: {
      type: 'image',
      title: '',
      fileName: null,
      filePath: [],
      altText: '',
    },
    document: {
      type: 'document',
      title: '',
      fileName: null,
      filePath: [],
    },
    attachment: {
      type: 'attachment',
      isRequired: false,
      title: '',
    },
  };

  function handleAdd(type: SurveyPageSection['type']) {
    return () => {
      const id = sectionSequence;
      setSectionSequence(sectionSequence - 1);
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
      {props.types ?? (
        <Grid container direction="row">
          <Grid item xs={12} md={6}>
            {questionButtons.map((button) => (
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
            {sectionButtons.map((button) => (
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
          </Grid>
        </Grid>
      )}
    </Grid>
  );
}
