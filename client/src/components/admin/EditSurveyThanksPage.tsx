import React from 'react';
import { useSurvey } from '@src/stores/SurveyContext';
import Fieldset from '../Fieldset';
import { TextField } from '@material-ui/core';
import { useTranslations } from '@src/stores/TranslationContext';
import RichTextEditor from '../RichTextEditor';

export default function EditSurveyThanksPage() {
  const { activeSurvey, activeSurveyLoading, editSurvey } = useSurvey();
  const { tr } = useTranslations();
  return (
    <Fieldset loading={activeSurveyLoading}>
      <TextField
        label={tr.EditSurveyThanksPage.title}
        value={activeSurvey.thanksPage.title ?? ''}
        onChange={(event) => {
          editSurvey({
            ...activeSurvey,
            thanksPage: {
              ...activeSurvey.thanksPage,
              title: event.target.value,
            },
          });
        }}
      />
      <RichTextEditor
        label={tr.EditSurveyThanksPage.text}
        value={activeSurvey.thanksPage.text ?? ''}
        onChange={(value) => {
          editSurvey({
            ...activeSurvey,
            thanksPage: {
              ...activeSurvey.thanksPage,
              text: value,
            },
          });
        }}
      />
    </Fieldset>
  );
}
