import {
  Autocomplete,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  TextField,
} from '@material-ui/core';
import { useSurvey } from '@src/stores/SurveyContext';
import { useTranslations } from '@src/stores/TranslationContext';
import { request } from '@src/utils/request';
import React, { useEffect, useState } from 'react';
import Fieldset from '../Fieldset';
import RichTextEditor from '../RichTextEditor';

export default function EditSurveyEmail() {
  const [autocompleteEmailsLoading, setAutocompleteEmailsLoading] =
    useState(true);
  const [autocompleteEmails, setAutocompleteEmails] = useState<string[]>([]);

  const { activeSurvey, activeSurveyLoading, editSurvey } = useSurvey();
  const { tr } = useTranslations();

  useEffect(() => {
    async function fetchAutocompleteEmails() {
      setAutocompleteEmailsLoading(true);
      try {
        const emails = await request<string[]>('/api/surveys/report-emails');
        setAutocompleteEmails(emails);
      } catch (error) {
        // Ignore network errors
        setAutocompleteEmails([]);
      }
      setAutocompleteEmailsLoading(false);
    }
    fetchAutocompleteEmails();
  }, []);

  return (
    <>
      <Fieldset loading={activeSurveyLoading}>
        <div>
          <FormControlLabel
            control={
              <Checkbox
                name="email-enabled"
                disabled={activeSurveyLoading}
                checked={activeSurvey.email.enabled ?? false}
                onChange={(event) => {
                  editSurvey({
                    ...activeSurvey,
                    email: {
                      ...activeSurvey.email,
                      enabled: event.target.checked,
                    },
                  });
                }}
              />
            }
            label={tr.EditSurveyEmail.enable}
          />
          <FormHelperText>{tr.EditSurveyEmail.enableHelperText}</FormHelperText>
        </div>
        {activeSurvey.email.enabled && (
          <>
            <Autocomplete
              multiple
              freeSolo
              filterSelectedOptions
              loading={autocompleteEmailsLoading}
              options={autocompleteEmails}
              value={activeSurvey.email.autoSendTo ?? []}
              onChange={(_, value: string[]) => {
                editSurvey({
                  ...activeSurvey,
                  email: {
                    ...activeSurvey.email,
                    autoSendTo: value,
                  },
                });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="standard"
                  label={tr.EditSurveyEmail.autoSendTo}
                  helperText={tr.EditSurveyEmail.autoSendToHelperText}
                />
              )}
            />
            <TextField
              label={tr.EditSurveyEmail.emailSubject}
              value={activeSurvey.email.subject ?? ''}
              onChange={(event) => {
                editSurvey({
                  ...activeSurvey,
                  email: {
                    ...activeSurvey.email,
                    subject: event.target.value,
                  },
                });
              }}
            />
            <RichTextEditor
              label={tr.EditSurveyEmail.emailBody}
              value={activeSurvey.email.body ?? ''}
              onChange={(value) => {
                editSurvey({
                  ...activeSurvey,
                  email: {
                    ...activeSurvey.email,
                    body: value,
                  },
                });
              }}
            />
          </>
        )}
      </Fieldset>
    </>
  );
}
