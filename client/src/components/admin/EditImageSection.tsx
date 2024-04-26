import { SurveyImageSection } from '@interfaces/survey';
import { TextField } from '@mui/material';
import { useSurvey } from '@src/stores/SurveyContext';
import { useTranslations } from '@src/stores/TranslationContext';
import React from 'react';
import FileUpload from './FileUpload';

interface Props {
  section: SurveyImageSection;
  onChange: (section: SurveyImageSection) => void;
}

export default function EditImageSection({ section, onChange }: Props) {
  const { activeSurvey } = useSurvey();
  const { tr, surveyLanguage } = useTranslations();

  return (
    <>
      <FileUpload
        surveyId={activeSurvey.id}
        targetPath={[String(activeSurvey.id)]}
        surveyGroups={activeSurvey.groups}
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
            filePath: [],
          });
        }}
      />
      <TextField
        value={section.altText[surveyLanguage]}
        label={tr.EditImageSection.altText}
        onChange={(event) =>
          onChange({
            ...section,
            altText: {
              ...section.altText,
              [surveyLanguage]: event.target.value,
            },
          })
        }
      ></TextField>
    </>
  );
}
