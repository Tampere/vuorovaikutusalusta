import { SurveyDocumentSection } from '@interfaces/survey';
import { useSurvey } from '@src/stores/SurveyContext';
import React from 'react';
import FileUpload from './FileUpload';

interface Props {
  section: SurveyDocumentSection;
  onChange: (section: SurveyDocumentSection) => void;
}

export default function EditDocumentSection({ section, onChange }: Props) {
  const { activeSurvey } = useSurvey();

  return (
    <>
      <FileUpload
        surveyId={activeSurvey.id}
        targetPath={[String(activeSurvey.id)]}
        surveyOrganization={activeSurvey.organization}
        value={
          !section.fileName
            ? null
            : [
                {
                  name: section.fileName,
                  path: section.filePath,
                },
              ]
        }
        onUpload={({ name, path }) => {
          onChange({
            ...section,
            fileOrganization: activeSurvey.organization,
            fileName: name,
            filePath: path,
          });
        }}
        onDelete={() => {
          onChange({
            ...section,
            fileOrganization: null,
            fileName: null,
            filePath: [],
          });
        }}
      />
    </>
  );
}
