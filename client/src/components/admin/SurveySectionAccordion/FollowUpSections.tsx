import { SurveyPage, SurveyPageSection } from '@interfaces/survey';
import React, { useState } from 'react';
import { FollowUpSectionAccordion } from './FollowUpSectionAccordion';
import { useSurvey } from '@src/stores/SurveyContext';
import { DndWrapper } from '@src/components/DragAndDrop/DndWrapper';

interface Props {
  parentSection: Extract<
    SurveyPageSection,
    { type: 'numeric' | 'slider' | 'checkbox' | 'radio' }
  >;
  page: SurveyPage;
  disabled: boolean;
  parentSectionIndex: number;
}

export function FollowUpSections({
  parentSection,
  disabled,
  page,
  parentSectionIndex,
}: Props) {
  const [expandedFollowUpSection, setExpandedFollowUpSection] =
    useState<number>(null);
  const { editFollowUpSection, moveFollowUpSection, deleteSection } =
    useSurvey();

  return (
    <DndWrapper
      onDragEnd={(opts) => {
        moveFollowUpSection(
          page.id,
          parentSection.id,
          opts.oldIndex,
          opts.newIndex,
        );
      }}
      sortableItems={
        parentSection?.followUpSections?.map((sect, index) => ({
          id: String(sect.id),
          renderElement: (isDragging) => (
            <FollowUpSectionAccordion
              isDragging={isDragging}
              pageId={page.id}
              isLastItem={parentSection.followUpSections.length === index + 1}
              parentSectionIndex={parentSectionIndex}
              index={index}
              disabled={disabled}
              parentSection={parentSection}
              section={sect}
              name={`section-${index}`}
              expanded={expandedFollowUpSection === index}
              onExpandedChange={(isExpanded) => {
                setExpandedFollowUpSection(isExpanded ? index : null);
              }}
              onEdit={(section) => {
                editFollowUpSection(page.id, parentSection.id, section);
              }}
              onDelete={(index) => {
                deleteSection(page.id, index);
                // Reset expanded section to null
                setExpandedFollowUpSection(null);
              }}
            />
          ),
        })) ?? []
      }
    />
  );
}
