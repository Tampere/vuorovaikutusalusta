import { SurveyDocumentSection } from '@interfaces/survey';
import { useSurvey } from '@src/stores/SurveyContext';
import React from 'react';
import FileUpload from './FileUpload';

interface Props {
  section: SurveyDocumentSection;
  onChange: (section: SurveyDocumentSection) => void;
  disabled?: boolean;
}

export default function EditDocumentSection({
  section,
  onChange,
  disabled,
}: Props) {
  const { activeSurvey } = useSurvey();

  return (
    <>
      <FileUpload
        disabled={disabled}
        surveyId={activeSurvey.id}
        targetPath={[String(activeSurvey.id)]}
        surveyOrganizationId={activeSurvey.organization.id}
        value={
          !section.fileUrl
            ? null
            : [
                {
                  url: section.fileUrl,
                },
              ]
        }
        onUpload={({ url }) => {
          onChange({
            ...section,
            fileUrl: url,
          });
        }}
        onDelete={() => {
          onChange({
            ...section,
            fileUrl: null,
          });
        }}
      />
    </>
  );
}
