import { SurveyPageSection } from '@interfaces/survey';
import { useSurvey } from '@src/stores/SurveyContext';
import React from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import SurveySectionAccordion from './SurveySectionAccordion';

interface Props {
  pageId: number;
  sections: SurveyPageSection[];
  expandedSection: number;
  disabled?: boolean;
  onExpandedSectionChange: (expandedSectionIndex: number) => void;
}

export default function SurveySections(props: Props) {
  const { editSection, deleteSection, moveSection } = useSurvey();

  return (
    <DragDropContext
      onDragEnd={(event) => {
        if (!event.destination) {
          return;
        }
        const id = Number(event.draggableId);
        const oldIndex = props.sections.findIndex(
          (section) => section.id === id
        );
        const newIndex = event.destination.index;
        moveSection(props.pageId, oldIndex, event.destination.index);
        // If the section was expanded, re-expand with the new index
        if (props.expandedSection === oldIndex) {
          props.onExpandedSectionChange(newIndex);
        }
      }}
    >
      <Droppable droppableId="sections">
        {(provided, _snapshot) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {props.sections.map((section, index) => (
              <Draggable
                key={section.id}
                draggableId={String(section.id)}
                index={index}
              >
                {(provided, _snapshot) => (
                  <SurveySectionAccordion
                    provided={provided}
                    disabled={props.disabled}
                    section={section}
                    name={`section-${index}`}
                    expanded={props.expandedSection === index}
                    onExpandedChange={(isExpanded) => {
                      props.onExpandedSectionChange(isExpanded ? index : null);
                    }}
                    onEdit={(section) => {
                      editSection(props.pageId, index, section);
                    }}
                    onDelete={() => {
                      deleteSection(props.pageId, index);
                      // Reset expanded section to null
                      props.onExpandedSectionChange(null);
                    }}
                  />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
