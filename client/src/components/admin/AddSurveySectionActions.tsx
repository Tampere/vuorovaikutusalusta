import { SurveyPageSection } from '@interfaces/survey';
import { Fab, Grid, Typography } from '@material-ui/core';
import {
  CheckBox,
  Map,
  RadioButtonChecked,
  Subject,
  TextFields,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { ReactNode } from 'react';

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

const defaultSections: {
  [type in SurveyPageSection['type']]: SurveyPageSection;
} = {
  checkbox: {
    type: 'checkbox',
    title: '',
    isRequired: false,
    options: [{ text: '' }],
    answerLimits: null,
    allowCustomAnswer: false,
  },
  radio: {
    type: 'radio',
    title: '',
    isRequired: false,
    options: [{ text: '' }],
    allowCustomAnswer: false,
  },
  numeric: {
    type: 'numeric',
    title: '',
    isRequired: false,
  },
  map: {
    type: 'map',
    title: '',
    isRequired: false,
    selectionTypes: [],
    subQuestions: [],
  },
  'free-text': {
    type: 'free-text',
    isRequired: false,
    title: '',
  },
  text: {
    type: 'text',
    title: '',
    body: '',
  },
};

export default function AddSurveySectionActions(props: Props) {
  const classes = useStyles();
  const { tr } = useTranslations();

  function handleAdd(type: SurveyPageSection['type']) {
    return () => {
      props.onAdd({
        ...defaultSections[type],
      });
    };
  }

  const buttons: {
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
      type: 'map',
      label: tr.AddSurveySectionActions.mapQuestion,
      ariaLabel: 'add-map-question',
      icon: <Map />,
    },
  ];

  return (
    <Grid container spacing={3}>
      {(props.types ?? buttons.map((button) => button.type))
        .map((type) => buttons.find((button) => button.type === type))
        .map((button) => (
          <Grid key={button.type} item xs={12} md={6}>
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
  );
}
