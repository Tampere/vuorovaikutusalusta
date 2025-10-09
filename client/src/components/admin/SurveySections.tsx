import { SurveyPage } from '@interfaces/survey';
import { useSurvey } from '@src/stores/SurveyContext';
import { isFollowUpSectionParentType } from '@src/utils/typeCheck';
import React from 'react';
import { FollowUpSections } from './SurveySectionAccordion/FollowUpSections';
import SurveySectionAccordion from './SurveySectionAccordion/SurveySectionAccordion';
import { DndWrapper } from '../DragAndDrop/DndWrapper';

interface Props {
  page: SurveyPage;
  expandedSection: number;
  disabled?: boolean;
  onExpandedSectionChange: (section: number) => void;
}

export default function SurveySections(props: Props) {
  const { editSection, deleteSection, moveSection } = useSurvey();

  return (
    <div>
      <DndWrapper
        onDragEnd={(opts) => {
          const { oldIndex, newIndex } = opts;

          moveSection(props.page.id, oldIndex, newIndex);
          // If the section was expanded, re-expand with the new index
          if (props.expandedSection === oldIndex) {
            props.onExpandedSectionChange(newIndex);
          }
        }}
        sortableItems={props.page.sections.map((section, index) => ({
          id: String(section.id),
          renderElement: (isDragging) => (
            <div>
              <SurveySectionAccordion
                isDragging={isDragging}
                pageId={props.page.id}
                index={index}
                disabled={props.disabled}
                section={section}
                name={`section-${index}`}
                expanded={props.expandedSection === index}
                onExpandedChange={(isExpanded) => {
                  props.onExpandedSectionChange(isExpanded ? index : null);
                }}
                onEdit={(index, section) => {
                  editSection(props.page.id, index, section);
                }}
                onDelete={(index) => {
                  deleteSection(props.page.id, index);
                  // Reset expanded section to null
                  props.onExpandedSectionChange(null);
                }}
              />
              {isFollowUpSectionParentType(section) && (
                <FollowUpSections
                  parentSectionIndex={index}
                  disabled={props.disabled}
                  page={props.page}
                  parentSection={section}
                />
              )}
            </div>
          ),
        }))}
      />
    </div>
  );
}
