import { User } from '@interfaces/user';
import { MapPublication } from '@interfaces/mapPublications';
import {
  Autocomplete,
  Box,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useSurvey } from '@src/stores/SurveyContext';
import { useToasts } from '@src/stores/ToastContext';
import { useTranslations } from '@src/stores/TranslationContext';
import { fi, enGB } from 'date-fns/locale';
import { getMapPublications } from '@src/controllers/MapPublicationsController';

import React, { useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import CopyToClipboard from '../CopyToClipboard';
import DeleteSurveyDialog from '../DeleteSurveyDialog';
import Fieldset from '../Fieldset';
import LoadingButton from '../LoadingButton';
import ColorSelect from './ColorSelect';
import SurveyImageList from './SurveyImageList';
import ThemeSelect from './ThemeSelect';
import { assertNever } from '@src/utils/typeCheck';

const styles = {
  dateTimePicker: {
    width: 'fit-content',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
};

export default function EditSurveyInfo() {
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
  const [deleteSurveyLoading, setDeleteSurveyLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [mapPublications, setMapPublications] = useState<MapPublication[]>([]);
  const [mapPublicationsLoading, setMapPublicationsLoading] = useState(true);

  const {
    activeSurvey,
    activeSurveyLoading,
    originalActiveSurvey,
    editSurvey,
    validationErrors,
    deleteActiveSurvey,
    availableMapLayers,
    availableMapLayersLoading,
  } = useSurvey();
  const { tr, surveyLanguage, language } = useTranslations();
  const { showToast } = useToasts();
  const history = useHistory();

  const testSurveyUrl = useMemo(() => {
    return `${window.location.origin}/${originalActiveSurvey.name}/testi`;
  }, [originalActiveSurvey.name]);

  useEffect(() => {
    async function fetchOtherUsers() {
      setUsersLoading(true);
      try {
        const users = await fetch('/api/users').then(
          (response) => response.json() as Promise<User[]>,
        );
        setUsers(users);
      } catch (error) {
        showToast({
          severity: 'error',
          message: tr.EditSurveyInfo.userFetchFailed,
        });
      }
      setUsersLoading(false);
    }

    fetchOtherUsers();
  }, []);

  useEffect(() => {
    async function fetchMapPublications() {
      setMapPublicationsLoading(true);
      try {
        const publications = await getMapPublications();
        setMapPublications(publications);
      } catch (error) {
        showToast({
          severity: 'error',
          message: tr.EditSurveyInfo.mapPublicationsFetchFailed,
        });
      }
      setMapPublicationsLoading(false);
    }

    fetchMapPublications();
  }, []);

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

  return (
    <>
      <Fieldset loading={activeSurveyLoading}>
        <TextField
          required
          error={validationErrors.includes('survey.title')}
          label={tr.EditSurveyInfo.title}
          value={activeSurvey.title?.[surveyLanguage] ?? ''}
          onChange={(event) => {
            editSurvey({
              ...activeSurvey,
              title: {
                ...activeSurvey.title,
                [surveyLanguage]: event.target.value,
              },
            });
          }}
        />
        <TextField
          label={tr.EditSurveyInfo.subtitle}
          value={activeSurvey.subtitle?.[surveyLanguage] ?? ''}
          onChange={(event) => {
            editSurvey({
              ...activeSurvey,
              subtitle: {
                ...activeSurvey.subtitle,
                [surveyLanguage]: event.target.value,
              },
            });
          }}
        />
        <TextField
          required
          error={validationErrors.includes('survey.name')}
          label={tr.EditSurveyInfo.name}
          value={activeSurvey.name ?? ''}
          inputProps={{ maxLength: 100 }}
          onChange={(event) => {
            editSurvey({
              ...activeSurvey,
              name: event.target.value,
            });
          }}
          helperText={tr.EditSurveyInfo.nameHelperText}
        />
        <TextField
          required
          error={validationErrors.includes('survey.author')}
          label={tr.EditSurveyInfo.author}
          value={activeSurvey.author ?? ''}
          onChange={(event) => {
            editSurvey({
              ...activeSurvey,
              author: event.target.value,
            });
          }}
        />
        <TextField
          label={tr.EditSurveyInfo.authorUnit}
          value={activeSurvey.authorUnit ?? ''}
          onChange={(event) => {
            editSurvey({
              ...activeSurvey,
              authorUnit: event.target.value,
            });
          }}
        />
        <FormControl>
          <InputLabel id="map-publication-select-label">
            {tr.EditSurveyInfo.mapPublication}
          </InputLabel>
          <Select
            label={tr.EditSurveyInfo.mapPublication}
            labelId="map-publication-select-label"
            fullWidth
            disabled={mapPublicationsLoading}
            value={
              mapPublications.find((pub) => pub.url === activeSurvey.mapUrl)
                ?.id ?? ''
            }
            onChange={(event) => {
              const selectedPublication = mapPublications.find(
                (pub) => pub.id === event.target.value,
              );
              editSurvey({
                ...activeSurvey,
                mapUrl: selectedPublication?.url ?? '',
              });
            }}
          >
            <MenuItem value="">
              <em>{tr.EditSurveyInfo.mapPublication}</em>
            </MenuItem>
            {mapPublications.map((publication) => (
              <MenuItem key={publication.id} value={publication.id}>
                {publication.name}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            {tr.EditSurveyInfo.mapPublicationHelperText}
          </FormHelperText>
        </FormControl>
        <TextField
          error={validationErrors.includes('survey.mapUrl')}
          label={tr.EditSurveyInfo.mapUrl}
          value={activeSurvey.mapUrl ?? ''}
          onChange={(event) => {
            editSurvey({
              ...activeSurvey,
              mapUrl: event.target.value,
            });
          }}
          helperText={
            validationErrors.includes('survey.mapUrl') &&
            tr.EditSurveyInfo.mapUrlError
          }
        />
        {availableMapLayersLoading && (
          <Skeleton variant="rectangular" height={200} width="100%" />
        )}
        {!availableMapLayersLoading && availableMapLayers?.length > 0 && (
          <div>
            <FormLabel>{tr.EditSurveyInfo.availableMapLayers}</FormLabel>
            <ul>
              {availableMapLayers.map((layer) => (
                <li key={layer.id}>{layer.name}</li>
              ))}
            </ul>
          </div>
        )}
        <Autocomplete
          multiple
          disabled={usersLoading}
          filterSelectedOptions
          options={users}
          getOptionLabel={(user) => user.fullName}
          renderValue={(users) =>
            users.map((user) => (
              <Chip
                key={user.id}
                label={user.fullName}
                sx={{ margin: '3px' }}
                {...(user.id !== activeSurvey.authorId
                  ? {
                      onDelete: () =>
                        editSurvey({
                          ...activeSurvey,
                          admins: activeSurvey.admins.filter(
                            (a) => a !== user.id,
                          ),
                        }),
                    }
                  : {})}
              ></Chip>
            ))
          }
          value={users?.filter(
            (user) =>
              activeSurvey.admins?.includes(user.id) ||
              activeSurvey.authorId === user.id,
          )}
          onChange={(_, value) => {
            editSurvey({
              ...activeSurvey,
              admins: value
                .filter((user) => user.id !== activeSurvey.authorId)
                .map((user) => user.id),
            });
          }}
          renderOption={(props, user) => (
            <li {...props} key={user.id}>
              {user.fullName}
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="standard"
              label={tr.EditSurveyInfo.admins}
              helperText={tr.EditSurveyInfo.adminsHelperText}
            />
          )}
        />

        <SurveyImageList imageType={'backgroundImage'} />
        <Box
          sx={{
            width: '206px',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          <ThemeSelect
            value={activeSurvey.theme?.id}
            onChange={(theme) => {
              editSurvey({
                ...activeSurvey,
                theme,
              });
            }}
          />
          <ColorSelect
            label={tr.EditSurveyInfo.titleColor}
            value={activeSurvey.sectionTitleColor}
            onChange={(color) => {
              editSurvey({
                ...activeSurvey,
                sectionTitleColor: color,
              });
            }}
          />
          <LocalizationProvider
            dateAdapter={AdapterDateFns}
            adapterLocale={localLanguage}
            localeText={{
              dateTimePickerToolbarTitle: tr.EditSurveyInfo.selectDateAndTime,
              cancelButtonLabel: tr.commands.cancel,
            }}
          >
            <DateTimePicker
              label={tr.EditSurveyInfo.startDate}
              value={activeSurvey.startDate}
              ampm={false}
              format="dd.MM.yyyy HH:mm"
              onChange={(value: Date) => {
                editSurvey({
                  ...activeSurvey,
                  startDate: value,
                });
              }}
            />
            <DateTimePicker
              label={tr.EditSurveyInfo.endDate}
              value={activeSurvey.endDate}
              format="dd.MM.yyyy HH:mm"
              onChange={(value: Date) => {
                editSurvey({
                  ...activeSurvey,
                  endDate: value,
                });
              }}
            />
          </LocalizationProvider>
        </Box>

        <FormControlLabel
          control={
            <Checkbox
              checked={activeSurvey.allowSavingUnfinished}
              onChange={(event) =>
                editSurvey({
                  ...activeSurvey,
                  allowSavingUnfinished: event.target.checked,
                })
              }
              inputProps={{ 'aria-label': 'allow-unfinished' }}
            />
          }
          label={tr.EditSurvey.allowSavingUnfinished}
        />
        <div>
          <FormControlLabel
            control={
              <Checkbox
                checked={activeSurvey.emailRegistrationRequired}
                onChange={(event) =>
                  editSurvey({
                    ...activeSurvey,
                    emailRegistrationRequired: event.target.checked,
                  })
                }
                inputProps={{ 'aria-label': 'require-email-identification' }}
              />
            }
            label={tr.EditSurveyInfo.requireEmailRegistration}
          />
          <FormHelperText>
            {tr.EditSurveyInfo.requireEmailRegistrationHelperText}
          </FormHelperText>
        </div>
        <FormControlLabel
          control={
            <Checkbox
              checked={activeSurvey.displayPrivacyStatement}
              onChange={(event) =>
                editSurvey({
                  ...activeSurvey,
                  displayPrivacyStatement: event.target.checked,
                })
              }
              inputProps={{
                'aria-label': `${tr.EditSurvey.displayPrivacyStatement}`,
              }}
            />
          }
          label={tr.EditSurvey.displayPrivacyStatement}
        />
        <div>
          <FormControlLabel
            label={tr.EditSurveyInfo.allowTestSurvey}
            control={
              <Checkbox
                checked={activeSurvey.allowTestSurvey}
                onChange={(event) => {
                  editSurvey({
                    ...activeSurvey,
                    allowTestSurvey: event.target.checked,
                  });
                }}
              />
            }
          />
          {activeSurvey.allowTestSurvey && (
            <div
              style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
            >
              <Typography>
                {tr.EditSurveyInfo.testSurveyUrl}:{' '}
                <Link
                  href={testSurveyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {testSurveyUrl}
                </Link>
              </Typography>
              <CopyToClipboard data={testSurveyUrl} />
            </div>
          )}
          <FormHelperText>
            {tr.EditSurveyInfo.allowTestSurveyHelperText}
          </FormHelperText>
        </div>

        <Box sx={styles.actions}>
          <LoadingButton
            variant="contained"
            color="error"
            loading={deleteSurveyLoading}
            onClick={() => {
              setDeleteConfirmDialogOpen(true);
            }}
          >
            {tr.EditSurvey.deleteSurvey}
          </LoadingButton>
        </Box>
      </Fieldset>
      <DeleteSurveyDialog
        open={deleteConfirmDialogOpen}
        survey={activeSurvey}
        onClose={async (result) => {
          setDeleteConfirmDialogOpen(false);
          if (result) {
            setDeleteSurveyLoading(true);
            try {
              await deleteActiveSurvey();
              setDeleteSurveyLoading(false);
              history.push('/');
              showToast({
                severity: 'success',
                message: tr.EditSurvey.deleteSurveySuccessful,
              });
            } catch (error) {
              setDeleteSurveyLoading(false);
              showToast({
                severity: 'error',
                message: tr.EditSurvey.deleteSurveyFailed,
              });
            }
          }
        }}
      />
    </>
  );
}
