import { User } from '@interfaces/user';
import {
  Autocomplete,
  FormLabel,
  Skeleton,
  TextField,
} from '@material-ui/core';
import DateTimePicker from '@material-ui/lab/DateTimePicker';
import { makeStyles } from '@material-ui/styles';
import { useSurvey } from '@src/stores/SurveyContext';
import { useToasts } from '@src/stores/ToastContext';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import ConfirmDialog from '../ConfirmDialog';
import Fieldset from '../Fieldset';
import LoadingButton from '../LoadingButton';
import SurveyImageList from './SurveyImageList';

const useStyles = makeStyles({
  dateTimePicker: {
    width: 'fit-content',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
});

export default function EditSurveyInfo() {
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
  const [deleteSurveyLoading, setDeleteSurveyLoading] = useState(false);
  const [users, setUsers] = useState<User[]>(null);
  const [usersLoading, setUsersLoading] = useState(true);

  const {
    activeSurvey,
    activeSurveyLoading,
    editSurvey,
    validationErrors,
    deleteActiveSurvey,
    availableMapLayers,
    availableMapLayersLoading,
  } = useSurvey();
  const { tr } = useTranslations();
  const { showToast } = useToasts();
  const history = useHistory();

  const classes = useStyles();

  useEffect(() => {
    async function fetchOtherUsers() {
      setUsersLoading(true);
      try {
        const users = await fetch('/api/users/others').then(
          (response) => response.json() as Promise<User[]>
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

  return (
    <>
      <Fieldset loading={activeSurveyLoading}>
        <TextField
          required
          error={validationErrors.includes('survey.title')}
          label={tr.EditSurveyInfo.title}
          value={activeSurvey.title ?? ''}
          onChange={(event) => {
            editSurvey({
              ...activeSurvey,
              title: event.target.value,
            });
          }}
        />
        <TextField
          label={tr.EditSurveyInfo.subtitle}
          value={activeSurvey.subtitle ?? ''}
          onChange={(event) => {
            editSurvey({
              ...activeSurvey,
              subtitle: event.target.value,
            });
          }}
        />
        <TextField
          required
          error={validationErrors.includes('survey.name')}
          label={tr.EditSurveyInfo.name}
          value={activeSurvey.name ?? ''}
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
        <Autocomplete
          multiple
          disabled={usersLoading}
          options={users ?? []}
          getOptionLabel={(user) => user.fullName}
          value={
            users?.filter((user) => activeSurvey.admins?.includes(user.id)) ??
            []
          }
          onChange={(_, value: User[]) => {
            editSurvey({
              ...activeSurvey,
              admins: value.map((user) => user.id),
            });
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="standard"
              label={tr.EditSurveyInfo.admins}
              helperText={tr.EditSurveyInfo.adminsHelperText}
            />
          )}
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
        <SurveyImageList />
        <DateTimePicker
          label={tr.EditSurveyInfo.startDate}
          value={activeSurvey.startDate}
          inputFormat="dd.MM.yyyy HH:mm"
          mask="__.__.____ __:__"
          onChange={(value) => {
            editSurvey({
              ...activeSurvey,
              startDate: value,
            });
          }}
          renderInput={(params: any) => (
            <TextField className={classes.dateTimePicker} {...params} />
          )}
        />
        <DateTimePicker
          label={tr.EditSurveyInfo.endDate}
          value={activeSurvey.endDate}
          inputFormat="dd.MM.yyyy HH:mm"
          mask="__.__.____ __:__"
          onChange={(value) => {
            editSurvey({
              ...activeSurvey,
              endDate: value,
            });
          }}
          renderInput={(params: any) => (
            <TextField className={classes.dateTimePicker} {...params} />
          )}
        />
        <div className={classes.actions}>
          <LoadingButton
            variant="contained"
            color="secondary"
            loading={deleteSurveyLoading}
            onClick={() => {
              setDeleteConfirmDialogOpen(true);
            }}
          >
            {tr.EditSurvey.deleteSurvey}
          </LoadingButton>
        </div>
      </Fieldset>
      <ConfirmDialog
        open={deleteConfirmDialogOpen}
        text={tr.EditSurvey.deleteSurveyConfirm}
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
