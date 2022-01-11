import { SurveyPageSection } from '@interfaces/survey';
import { useSurvey } from '@src/stores/SurveyContext';
import React from 'react';
import SurveySectionAccordion from './SurveySectionAccordion';

interface Props {
  pageId: number;
  sections: SurveyPageSection[];
  expandedSection: number;
  disabled?: boolean;
  onExpandedSectionChange: (expandedSectionIndex: number) => void;
}

export default function SurveySections(props: Props) {
  const { editSection, deleteSection } = useSurvey();
  return (
    <div>
      {props.sections.map((section, index) => (
        <SurveySectionAccordion
          // Cannot rely on section.id, because it's null when the section doesn't exist in DB.
          key={`${props.pageId}/${index}`}
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
          }}
        />
      ))}
    </div>
  );
}
