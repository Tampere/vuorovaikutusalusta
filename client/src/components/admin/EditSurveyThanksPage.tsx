import React from 'react';
import { useSurvey } from '@src/stores/SurveyContext';
import Fieldset from '../Fieldset';
import { TextField } from '@mui/material';
import { useTranslations } from '@src/stores/TranslationContext';
import RichTextEditor from '../RichTextEditor';

export default function EditSurveyThanksPage() {
  const { activeSurvey, activeSurveyLoading, editSurvey } = useSurvey();
  const { tr, surveyLanguage } = useTranslations();
  return (
    <Fieldset loading={activeSurveyLoading}>
      <TextField
        label={tr.EditSurveyThanksPage.title}
        value={activeSurvey.thanksPage?.title?.[surveyLanguage] ?? ''}
        onChange={(event) => {
          editSurvey({
            ...activeSurvey,
            thanksPage: {
              ...activeSurvey.thanksPage,
              title: {
                ...activeSurvey.thanksPage.title,
                [surveyLanguage]: event.target.value,
              },
            },
          });
        }}
      />
      <RichTextEditor
        label={tr.EditSurveyThanksPage.text}
        value={activeSurvey.thanksPage.text?.[surveyLanguage] ?? ''}
        onChange={(value) => {
          editSurvey({
            ...activeSurvey,
            thanksPage: {
              ...activeSurvey.thanksPage,
              text: {
                ...activeSurvey.thanksPage.text,
                [surveyLanguage]: value,
              },
            },
          });
        }}
      />
    </Fieldset>
  );
}
