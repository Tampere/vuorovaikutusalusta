import { SurveyMapQuestion, SurveyMapSubQuestion } from '@interfaces/survey';
import React from 'react';
import { DndWrapper } from '../DragAndDrop/DndWrapper';
import SurveySectionAccordion from './SurveySectionAccordion/SurveySectionAccordion';

interface Props {
  mapQuestion: SurveyMapQuestion;
  expandedSection: number;
  onChange: (subQuestions: SurveyMapSubQuestion[]) => void;
  disabled?: boolean;
  onExpandedSectionChange: (expandedSectionIndex: number) => void;
}

const styles = {
  accordion: {
    background: '#bbb',
  },
};

export default function EditMapSubQuestions(props: Props) {
  return (
    <div>
      <DndWrapper
        sortableItems={props.mapQuestion.subQuestions.map((section, index) => ({
          id: String(section.id),
          renderElement: (isDragging) => (
            <SurveySectionAccordion
              isDragging={isDragging}
              copyingSettings={{ copyingDisabled: true }}
              index={index}
              key={index}
              sx={styles.accordion}
              disabled={props.disabled}
              section={section}
              name={`section-${index}`}
              expanded={props.expandedSection === index}
              onExpandedChange={(isExpanded) => {
                props.onExpandedSectionChange(isExpanded ? index : null);
              }}
              onEdit={(index, editedSection: SurveyMapSubQuestion) => {
                // Replace the edited subquestion in the array
                const subQuestions = props.mapQuestion.subQuestions.map(
                  (section, i) => (i === index ? editedSection : section),
                );
                props.onChange(subQuestions);
              }}
              onDelete={(index) => {
                // Filter out the subquestion from the array
                const subQuestions = props.mapQuestion.subQuestions.filter(
                  (_, i) => i !== index,
                );
                props.onChange(subQuestions);
                // Reset expanded section to null
                props.onExpandedSectionChange(null);
              }}
            />
          ),
        }))}
        onDragEnd={(opts) => {
          const { oldIndex, newIndex, movedItemId } = opts;

          const subQuestion = props.mapQuestion.subQuestions[oldIndex];

          const otherSubQuestions = props.mapQuestion.subQuestions.filter(
            (subQuestion) => String(subQuestion.id) !== String(movedItemId),
          );

          props.onChange([
            ...otherSubQuestions.slice(0, newIndex),
            subQuestion,
            ...otherSubQuestions.slice(newIndex),
          ]);
          // If the section was expanded, re-expand with the new index
          if (props.expandedSection === oldIndex) {
            props.onExpandedSectionChange(newIndex);
          }
        }}
      />
    </div>
  );
}
