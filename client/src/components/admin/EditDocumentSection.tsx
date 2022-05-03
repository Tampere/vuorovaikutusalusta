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
            fileName: name,
            filePath: path,
          });
        }}
        onDelete={() => {
          onChange({
            ...section,
            fileName: null,
            filePath: null,
          });
        }}
      />
    </>
  );
}
