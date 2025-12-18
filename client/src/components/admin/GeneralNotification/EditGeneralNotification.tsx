import {
  GeneralNotification,
  NotificationFormData,
} from '@interfaces/generalNotification';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  InputLabel,
  OutlinedInput,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';

import { LocalizedText } from '@interfaces/survey';
import { Add, Delete } from '@mui/icons-material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useTranslations } from '@src/stores/TranslationContext';
import { assertNever } from '@src/utils/typeCheck';
import { enGB, fi } from 'date-fns/locale';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  GeneralNotificationTextEditor,
  GeneralNotificationTextEditorRef,
} from './GeneralNotificationTextEditor';

const DEFAULT_LOCALIZED_TEXT: LocalizedText = { fi: '', en: '' };

function isLocalizedFilled(obj: LocalizedText) {
  return Object.values(obj).some((val) => val.length > 0);
}

interface FormElements extends HTMLFormControlsCollection {
  notificationTitle: HTMLInputElement;
}
interface NotificationFormElements extends HTMLFormElement {
  readonly elements: FormElements;
}

interface Props {
  notification: GeneralNotification | null;
  editing: boolean;
  onEdit: () => void;
  onSubmit: (
    formData: NotificationFormData,
    notificationId?: string,
  ) => Promise<boolean>;
  onCancel: () => void;
  onDelete: (notificationId: string) => Promise<void>;
}

export function EditGeneralNotification({
  notification,
  onSubmit,
  onCancel,
  editing,
  onEdit,
  onDelete,
}: Props) {
  const { tr, languages, language } = useTranslations();

  const localLanguage = useMemo(() => {
    switch (language) {
      case 'fi':
        return fi;
      case 'en':
        return enGB;
      default:
        return assertNever(language);
    }
  }, [language]);

  const parsedNotificationData = useMemo<NotificationFormData>(
    () => ({
      title: notification?.title ?? DEFAULT_LOCALIZED_TEXT,
      message: notification?.message ?? DEFAULT_LOCALIZED_TEXT,
      startDate: notification?.startDate ?? null,
      endDate: notification?.endDate ?? null,
      publishedInternally: notification?.publishedInternally ?? false,
      publishedExternally: notification?.publishedExternally ?? false,
    }),
    [notification],
  );

  const [selectedLanguage, setSelectedLanguage] =
    useState<(typeof languages)[number]>('fi');
  const [formData, setFormData] = useState(parsedNotificationData);

  useEffect(() => {
    setFormData(parsedNotificationData);
  }, [parsedNotificationData]);

  useEffect(() => {
    editorRef.current?.setContent(formData.message[selectedLanguage], {
      contentType: 'markdown',
    });
  }, [formData, selectedLanguage]);

  const editorRef = useRef<GeneralNotificationTextEditorRef>(null);

  const publishStatusUpdated =
    formData.publishedExternally !==
      parsedNotificationData.publishedExternally ||
    formData.publishedInternally !== parsedNotificationData.publishedInternally;

  const textContentUpdated =
    JSON.stringify(formData.message) !==
      JSON.stringify(parsedNotificationData.message) ||
    JSON.stringify(formData.title) !==
      JSON.stringify(parsedNotificationData.title);

  const dateContentUpdated =
    formData.startDate !== parsedNotificationData.startDate ||
    formData.endDate !== parsedNotificationData.endDate;

  const formIsDirtyAndValid =
    isLocalizedFilled(formData.title) &&
    isLocalizedFilled(formData.message) &&
    (textContentUpdated || dateContentUpdated || publishStatusUpdated);

  function handleOnChange(value: string) {
    setFormData((data) => ({
      ...data,
      message: { ...data.message, [selectedLanguage]: value },
    }));
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: editing ? '0 0 270px' : '0 0 40px',
        transition: 'flex 0.5s ',
      }}
    >
      {editing ? (
        <FormControl
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            animation: 'grow 0.75s',
            '@keyframes grow': {
              from: { opacity: 0, maxHeight: 0 },
              to: { opacity: 1, maxHeight: '500px' },
            },
          }}
          onSubmit={async (e: React.FormEvent<NotificationFormElements>) => {
            e.preventDefault();
            const submitSuccess = await onSubmit(formData, notification?.id);
            if (submitSuccess)
              setFormData({
                title: DEFAULT_LOCALIZED_TEXT,
                message: DEFAULT_LOCALIZED_TEXT,
                startDate: null,
                endDate: null,
                publishedInternally: false,
                publishedExternally: false,
              });
          }}
          component={'form'}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',

              backgroundColor: 'white',
            }}
          >
            <ToggleButtonGroup
              value={selectedLanguage}
              exclusive
              onChange={(_, newLanguage) => {
                if (newLanguage !== null) {
                  setSelectedLanguage(newLanguage);
                }
              }}
              size="small"
            >
              {languages.map((lang) => (
                <ToggleButton key={lang} value={lang}>
                  {lang.toUpperCase()}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
          <FormControl
            sx={{
              width: '100%',
              backgroundColor: 'white',
              zIndex: 2,
            }}
          >
            <InputLabel
              required
              sx={{ backgroundColor: 'white', zIndex: 3 }}
              htmlFor="notificationTitle"
            >
              {tr.GeneralNotification.formLabel}
            </InputLabel>
            <OutlinedInput
              id="notificationTitle"
              required
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  title: {
                    ...prev.title,
                    [selectedLanguage]: e.target.value,
                  },
                }))
              }
              value={formData.title?.[selectedLanguage]}
            />
          </FormControl>

          <FormGroup row sx={{ gap: '1.5rem' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.publishedInternally}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      publishedInternally: e.target.checked,
                    }));
                  }}
                />
              }
              label={tr.GeneralNotification.publishToAdmin}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.publishedExternally}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      publishedExternally: e.target.checked,
                    }));
                  }}
                />
              }
              label={tr.GeneralNotification.publishToPublic}
            />
          </FormGroup>
          <FormHelperText sx={{ marginTop: '-1rem', marginLeft: 0 }}>
            {tr.GeneralNotification.publishHelper}
          </FormHelperText>
          <LocalizationProvider
            dateAdapter={AdapterDateFns}
            adapterLocale={localLanguage}
            localeText={{
              dateTimePickerToolbarTitle: tr.EditSurveyInfo.selectDateAndTime,
              cancelButtonLabel: tr.commands.cancel,
            }}
          >
            <Box sx={{ display: 'flex', gap: '1rem', flex: 1 }}>
              <DateTimePicker
                disabled={
                  !formData.publishedExternally && !formData.publishedInternally
                }
                sx={{ flex: 1 }}
                slotProps={{ clearButton: { lang: 'fi_FI' } }}
                label={tr.EditSurveyInfo.startDate}
                value={formData.startDate}
                ampm={false}
                format="dd.MM.yyyy HH:mm"
                onChange={(value: Date | null) => {
                  setFormData((prev) => ({
                    ...prev,
                    startDate: value,
                  }));
                }}
              />
              <DateTimePicker
                disabled={
                  !formData.publishedExternally && !formData.publishedInternally
                }
                sx={{ flex: 1 }}
                label={tr.EditSurveyInfo.endDate}
                value={formData.endDate}
                format="dd.MM.yyyy HH:mm"
                ampm={false}
                onChange={(value: Date | null) => {
                  setFormData((prev) => ({
                    ...prev,
                    endDate: value,
                  }));
                }}
              />
            </Box>
          </LocalizationProvider>
          <GeneralNotificationTextEditor
            ref={editorRef}
            initialValue={formData.message?.[selectedLanguage]}
            onChange={handleOnChange}
          />
          <Box
            sx={{
              backgroundColor: 'white',
              zIndex: 2,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem',
            }}
          >
            {notification?.id && (
              <Button
                endIcon={<Delete />}
                color="error"
                sx={{ marginRight: 'auto' }}
                onClick={async () => {
                  await onDelete(notification.id);
                }}
              >
                {tr.commands.remove}
              </Button>
            )}
            <Button
              variant="outlined"
              onClick={async () => {
                setFormData(parsedNotificationData);
                onCancel();
              }}
            >
              {tr.commands.cancel}
            </Button>
            <Button
              variant="contained"
              type="submit"
              disabled={!formIsDirtyAndValid}
            >
              {tr.commands.save}
            </Button>
          </Box>
        </FormControl>
      ) : (
        <Button
          variant="contained"
          sx={{
            marginLeft: 'auto',
            animation: 'fadeIn 0.5s',
            '@keyframes fadeIn': {
              from: { opacity: 0 },
              to: { opacity: 1 },
            },
          }}
          endIcon={<Add />}
          onClick={onEdit}
        >
          {tr.GeneralNotification.addNew}
        </Button>
      )}
    </Box>
  );
}
