import { SurveyMapQuestion, SurveyMapSubQuestion } from '@interfaces/survey';
import { makeStyles } from '@material-ui/styles';
import React from 'react';
import SurveySectionAccordion from './SurveySectionAccordion';

interface Props {
  mapQuestion: SurveyMapQuestion;
  expandedSection: number;
  onChange: (subQuestions: SurveyMapSubQuestion[]) => void;
  disabled?: boolean;
  onExpandedSectionChange: (expandedSectionIndex: number) => void;
}

const useStyles = makeStyles({
  accordion: {
    background: '#bbb',
  },
});

export default function EditMapSubQuestions(props: Props) {
  const classes = useStyles();
  return (
    <div>
      {(props.mapQuestion.subQuestions ?? []).map((section, index) => (
        <SurveySectionAccordion
          key={index}
          className={classes.accordion}
          disabled={props.disabled}
          section={section}
          name={`section-${index}`}
          expanded={props.expandedSection === index}
          onExpandedChange={(isExpanded) => {
            props.onExpandedSectionChange(isExpanded ? index : null);
          }}
          onEdit={(editedSection: SurveyMapSubQuestion) => {
            // Replace the edited subquestion in the array
            const subQuestions = props.mapQuestion.subQuestions.map(
              (section, i) => (i === index ? editedSection : section)
            );
            props.onChange(subQuestions);
          }}
          onDelete={() => {
            // Filter out the subquestion from the array
            const subQuestions = props.mapQuestion.subQuestions.filter(
              (_, i) => i !== index
            );
            props.onChange(subQuestions);
          }}
        />
      ))}
    </div>
  );
}
