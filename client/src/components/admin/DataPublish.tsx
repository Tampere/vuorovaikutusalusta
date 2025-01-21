import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  Link,
  TextField,
  Theme,
  Typography,
} from '@mui/material';
import LinkSmallIcon from '@src/components/icons/LinkSmallIcon';
import HierarchyIcon from '@src/components/icons/HierarchyIcon';
import { useToasts } from '@src/stores/ToastContext';
import { useTranslations } from '@src/stores/TranslationContext';
import { request } from '@src/utils/request';
import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import { CredentialsEntry } from '@src/application/submission';

interface Props {
  surveyId: number;
}

const CredentialsInputLabel = styled(InputLabel)(
  ({ theme }: { theme: Theme }) => ({
    color: theme.palette.primary.main,
  }),
);
const CredentialsInput = styled(TextField)(({ theme }: { theme: Theme }) => ({
  'label + &': {
    marginTop: theme.spacing(2),
  },
  '& .MuiInputBase-input': {
    backgroundColor: '#F0F0F0',
    padding: '10px 12px',
  },
}));

const initialInput = {
  username: '',
  password: '',
  passwordAgain: '',
  alphanumericIncluded: true,
  mapIncluded: true,
  attachmentsIncluded: true,
  personalIncluded: true,
};

export default function DataPublish({ surveyId }: Props) {
  const [displayDialog, setDisplayDialog] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [input, setInput] = useState(initialInput);
  const [passwordsMissmatch, setPasswordsMissmatch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { tr } = useTranslations();
  const { showToast } = useToasts();
  const publicationURL = `${window.location.origin}/api/surveys/${surveyId}/publication`;

  useEffect(() => {
    const missmatchCheck =
      input.passwordAgain.length > 0 && input.password !== input.passwordAgain;

    if (passwordsMissmatch === missmatchCheck) return;

    setPasswordsMissmatch(missmatchCheck);
  }, [input.password, input.passwordAgain]);

  useEffect(() => {
    async function fetchPublications() {
      try {
        setIsLoading(true);
        const credentialsArr = await request<CredentialsEntry[]>(
          `/api/surveys/${surveyId}/publication/credentials`,
        );
        if (credentialsArr.length > 0) {
          setCredentials(credentialsArr[0]);
        }
      } catch (err) {
        showToast(getErrorObject(err));
      } finally {
        setIsLoading(false);
      }
    }
    fetchPublications();
  }, []);

  function getErrorObject(err: Response | Error) {
    return {
      severity: 'error',
      message: err instanceof Error ? err.message : err.statusText,
    };
  }

  function handleInputChange({ target }: { target: HTMLInputElement }) {
    setInput({
      ...input,
      [target.name]: target.type === 'checkbox' ? target.checked : target.value,
    });
  }

  function initDialog() {
    setInput(
      credentials
        ? {
            username: credentials.username,
            password: initialInput.password,
            passwordAgain: initialInput.passwordAgain,
            alphanumericIncluded: credentials.alphanumericIncluded,
            mapIncluded: credentials.mapIncluded,
            attachmentsIncluded: credentials.attachmentsIncluded,
            personalIncluded: credentials.personalIncluded,
          }
        : initialInput,
    );
    setDisplayDialog((prev: boolean) => !prev);
  }

  async function upsertCredentials() {
    try {
      setIsLoading(true);
      setCredentials(
        await request<CredentialsEntry>(
          `/api/surveys/${surveyId}/publication/credentials`,
          {
            method: 'PUT',
            body: input,
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );
      showToast({
        severity: 'success',
        message: 'Success!',
      });
      setDisplayDialog(false);
    } catch (err) {
      showToast(getErrorObject(err));
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteCredentials() {
    setIsLoading(true);
    try {
      await request<CredentialsEntry>(
        `/api/surveys/${surveyId}/publication/credentials`,
        {
          method: 'DELETE',
        },
      );
      setCredentials(null);
      showToast({
        severity: 'success',
        message: 'Success!',
      });
    } catch (err) {
      showToast(getErrorObject(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {isLoading ? (
        <CircularProgress />
      ) : (
        <Button
          startIcon={<HierarchyIcon />}
          sx={{ marginRight: 'auto' }}
          variant="outlined"
          onClick={initDialog}
        >
          {credentials
            ? tr.DataPublish.submissionsApi
            : tr.DataPublish.openSubmissionsApi + '…'}
        </Button>
      )}
      <Dialog open={displayDialog} onClose={() => setDisplayDialog(false)}>
        <DialogTitle>
          {credentials
            ? tr.DataPublish.submissionsApiOptions
            : tr.DataPublish.submissionsApiOpening}
        </DialogTitle>
        <DialogContent>
          {isLoading ? (
            <Box
              component="div"
              sx={{ display: 'flex', justifyContent: 'center' }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={10}>
              <Grid item xs={6}>
                <Typography level="h1">{tr.DataPublish.credentials}</Typography>
                <Box
                  component="form"
                  sx={{
                    mt: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <FormControl variant="standard">
                    <CredentialsInputLabel
                      shrink
                      htmlFor="credentials-username"
                    >
                      {tr.DataPublish.username}
                    </CredentialsInputLabel>
                    <CredentialsInput
                      required
                      id="credentials-username"
                      name="username"
                      value={input.username}
                      onChange={handleInputChange}
                      autoComplete="username"
                    />
                  </FormControl>
                  <FormControl variant="standard">
                    <CredentialsInputLabel
                      shrink
                      htmlFor="credentials-password"
                    >
                      {tr.DataPublish.password}
                    </CredentialsInputLabel>
                    <CredentialsInput
                      required
                      id="credentials-password"
                      name="password"
                      type="password"
                      value={input.password}
                      onChange={handleInputChange}
                      autoComplete="new-password"
                      error={passwordsMissmatch}
                    />
                  </FormControl>
                  <FormControl variant="standard">
                    <CredentialsInputLabel
                      shrink
                      htmlFor="credentials-passwordAgain"
                    >
                      {tr.DataPublish.passwordAgain}
                    </CredentialsInputLabel>
                    <CredentialsInput
                      required
                      id="credentials-passwordAgain"
                      name="passwordAgain"
                      type="password"
                      value={input.passwordAgain}
                      onChange={handleInputChange}
                      error={passwordsMissmatch}
                      autoComplete="new-password"
                      helperText={
                        passwordsMissmatch && tr.DataPublish.passwordsMissmatch
                      }
                    />
                  </FormControl>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Typography level="h1">
                  {tr.DataPublish.materialsOffered}
                </Typography>
                <Box
                  sx={{
                    mt: 2,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <FormControlLabel
                    label={tr.DataPublish.alphanumericSubmissions}
                    control={
                      <Checkbox
                        name="alphanumericIncluded"
                        checked={input.alphanumericIncluded}
                        onChange={handleInputChange}
                      />
                    }
                  />
                  <FormControlLabel
                    label={tr.DataPublish.mapSubmissions}
                    control={
                      <Checkbox
                        name="mapIncluded"
                        checked={input.mapIncluded}
                        onChange={handleInputChange}
                      />
                    }
                  />
                  <FormControlLabel
                    label={tr.DataExport.attachments}
                    control={
                      <Checkbox
                        name="attachmentsIncluded"
                        checked={input.attachmentsIncluded}
                        onChange={handleInputChange}
                      />
                    }
                  />
                  <FormControlLabel
                    label={tr.DataPublish.personalDetails}
                    control={
                      <Checkbox
                        name="personalIncluded"
                        checked={input.personalIncluded}
                        onChange={handleInputChange}
                      />
                    }
                  />
                </Box>
              </Grid>
            </Grid>
          )}
          <Link
            href={publicationURL}
            target="_blank"
            underline="none"
            sx={{ display: 'flex', alignItems: 'center', mt: 2 }}
          >
            <LinkSmallIcon sx={{ width: 15, mr: 1 }} />
            {publicationURL}
          </Link>
        </DialogContent>
        <DialogActions>
          {credentials && (
            <Button
              color="warning"
              onClick={() => {
                deleteCredentials();
                setDisplayDialog(false);
              }}
              sx={{
                textAlign: 'left',
              }}
            >
              {tr.DataPublish.closeApi}
            </Button>
          )}
          <Box component="div" sx={{ flex: '1 0 0' }} />
          <Button onClick={() => setDisplayDialog(false)}>
            {tr.commands.cancel}
          </Button>
          <Button
            onClick={upsertCredentials}
            disabled={
              //Object.values(input).some((c: string) => c.length === 0)
              input.username.length === 0 ||
              input.password.length === 0 ||
              input.passwordAgain.length === 0 ||
              passwordsMissmatch
            }
          >
            {credentials ? tr.commands.save : tr.DataPublish.openApi}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
