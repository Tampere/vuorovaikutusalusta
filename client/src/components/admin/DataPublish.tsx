import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
    TextField
} from '@mui/material';
import DownloadIcon from '@src/components/icons/DownloadIcon';
import { useToasts } from '@src/stores/ToastContext';
import { useTranslations } from '@src/stores/TranslationContext';
import { request } from '@src/utils/request';
import React, { useEffect, useState } from 'react';
import DeleteBinIcon from '../icons/DeleteBinIcon';

interface Props {
    surveyId: number;
}

export default function DataPublish({ surveyId }: Props) {
    const [displayDialog, setDisplayDialog] = useState(false);
    const [credentials, setCredentials] = useState({
        username: "",
        password: "",
        passwordConfirm: ""
    });
    const [passwordsMissmatch, setPasswordsMissmatch] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isPublished, setIsPublished] = useState(null);
    const [currentPassword, setCurrentPassword] = useState("");

    const { tr } = useTranslations();
    const { showToast } = useToasts();

    useEffect(() => {
        setPasswordsMissmatch(
            credentials.passwordConfirm.length > 0 &&
            credentials.password !== credentials.passwordConfirm
        );
    }, [credentials.password, credentials.passwordConfirm]);

    useEffect(() => {
        async function fetchPublications() {
          const publicationsUrl = `/api/surveys/${surveyId}/submissions/publication`;
          try {
            const publications = await request<{id: number, survey_id: number}[]>(publicationsUrl);
            setIsPublished(publications.length > 0);
          } catch (err) {
            showToast(getErrorObject(err));
          }
        }
        fetchPublications();
    }, []);

    function getErrorObject(err: Response | Error) {
        return {
            severity: 'error',
            message: err instanceof Error ? err.message : err.statusText,
        }
    }

    function handleCredentialChange({ target }: { target: HTMLInputElement}) {
        setCredentials({
            ...credentials,
            [target.name]: target.value
        });
    }

    function initDialog() {
        setCurrentPassword("");
        setCredentials({
            username: "",
            password: "",
            passwordConfirm: ""
        });
        setDisplayDialog((prev: boolean) => !prev);
    }

    async function publishResponses() {
        setIsLoading(true);
        try {
            const res = await fetch(
                `/api/surveys/${surveyId}/submissions/publication`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        username: credentials.username,
                        password: credentials.password
                    }),
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );
            if (!res.ok) throw res;

            setIsPublished(true);
            showToast({
                severity: 'success',
                message: "Success!",
            });
            setDisplayDialog(false);
        } catch (err) {
            showToast(getErrorObject(err));
        } finally {
            setIsLoading(false);
        }
    }

    async function deletePublications() {
        setIsLoading(true);
        try {
            const res = await fetch(
                `/api/surveys/${surveyId}/submissions/publication`,
                {
                    method: 'DELETE',
                },
            );
            if (!res.ok) throw res;
            setIsPublished(false);
            showToast({
                severity: 'success',
                message: "Success!",
            });
        } catch (err) {
            showToast(getErrorObject(err));
        } finally {
            setIsLoading(false);
        }
    }

    async function updateCredentials() {
        setIsLoading(true);
        try {
            const res = await fetch(
                `/api/surveys/${surveyId}/submissions/publication`,
                {
                    method: 'PUT',
                    body: JSON.stringify({
                        password: currentPassword,
                        newUsername: credentials.username,
                        newPassword: credentials.password
                    }),
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );
            if (!res.ok) throw res;
            showToast({
                severity: 'success',
                message: "Success!",
            });
            setDisplayDialog(false);
        } catch (err) {
            showToast(getErrorObject(err));
        } finally {
            setIsLoading(false);
        }
    }

    return (
    <>
        { 
        isLoading ?
            <CircularProgress />
        : isPublished ?
            <Box>
                <Button
                    startIcon={<DownloadIcon />}
                    sx={{ marginRight: 'auto' }}
                    variant="contained"
                    onClick={initDialog}
                    style={{marginRight:'10px'}}
                >
                    Update credentials
                </Button>
                <Button
                    startIcon={<DeleteBinIcon />}
                    sx={{ marginRight: 'auto' }}
                    variant="contained"
                    onClick={deletePublications}
                >
                    Delete publications
                </Button>
            </Box>
        :
            <Button
                startIcon={<DownloadIcon />}
                sx={{ marginRight: 'auto' }}
                variant="contained"
                onClick={initDialog}
            >
                {tr.DataPublish.publishAnswers}
            </Button>
        }
        <Dialog open={displayDialog} onClose={() => setDisplayDialog(false)}>
            <DialogTitle>
                { isPublished ? "Update credentials" : "Publish survey response data"}
            </DialogTitle>
            <DialogContent style={{ display: 'flex', flexDirection: 'column' }}>
                <Typography> Set credentials </Typography>
                {
                    isPublished &&
                    <TextField
                        required
                        type="password"
                        label="Current password"
                        name="currentPassword"
                        value={currentPassword}
                        onChange={
                            (event: InputEvent) => setCurrentPassword(
                                (event.target as HTMLInputElement).value
                            )
                        }
                        style={{ marginTop: '15px' }}
                    /> 
                }
                <TextField
                    required
                    label="Username"
                    name="username"
                    value={credentials.username}
                    onChange={handleCredentialChange}
                    style={{ marginTop: '15px' }}
                />
                <TextField
                    required
                    type="password"
                    error={passwordsMissmatch}
                    label="Password"
                    name="password"
                    value={credentials.password}
                    onChange={handleCredentialChange}
                    style={{ marginTop: '15px' }}
                />
                <TextField
                    required
                    type="password"
                    error={passwordsMissmatch}
                    label="Confirm password"
                    name="passwordConfirm"
                    value={credentials.passwordConfirm}
                    onChange={handleCredentialChange}
                    helperText={passwordsMissmatch && "The passwords do not match"}
                    style={{ marginTop: '15px' }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setDisplayDialog(false)}>
                    {tr.commands.cancel}
                </Button>
                <Button
                    onClick={() => {
                        isPublished ? updateCredentials() : publishResponses();
                    }}
                    disabled={
                        (isPublished && currentPassword.length === 0) ||
                        credentials.username.length === 0 ||
                        credentials.password.length === 0 ||
                        credentials.passwordConfirm.length === 0 ||
                        passwordsMissmatch
                    }
                >
                    {tr.commands.save}
                </Button>
            </DialogActions>
        </Dialog>
    </>
    );
}