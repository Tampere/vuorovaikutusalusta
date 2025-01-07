import {
    Button,
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
import React, { useEffect, useState } from 'react';

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

    useEffect(() => {
        setPasswordsMissmatch(
            credentials.passwordConfirm.length > 0 &&
            credentials.password !== credentials.passwordConfirm
        );
    }, [credentials.password, credentials.passwordConfirm]);

    const { tr } = useTranslations();
    const { showToast } = useToasts();

    function handleChange({ target }: { target: HTMLInputElement}) {
        setCredentials({
            ...credentials,
            [target.name]: target.value
        });
    }

    async function publishResponses() {
        try {
            const res = await fetch(
                `/api/surveys/${surveyId}/submissions/publish`,
                {
                    method: 'POST',
                    body: JSON.stringify(credentials),
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );
            if (!res.ok) throw res;
        } catch (err) {
            showToast({
                severity: 'error',
                message: err.message ?? err.statusText,
            });
        }
    }

    return (
    <>
        <Button
            startIcon={<DownloadIcon />}
            sx={{ marginRight: 'auto' }}
            variant="contained"
            onClick={() => setDisplayDialog((prev: boolean) => !prev)}
        >
            {tr.DataPublish.publishAnswers}
        </Button>
        <Dialog open={displayDialog} onClose={() => setDisplayDialog(false)}>
        <DialogTitle> Publish survey response data </DialogTitle>
            <DialogContent style={{ display: 'flex', flexDirection: 'column' }}>
                <Typography> Set credentials </Typography>
                <TextField
                    required
                    label="Username"
                    name="username"
                    value={credentials.username}
                    onChange={handleChange}
                    style={{ marginTop: '15px' }}
                />
                <TextField
                    required
                    type="password"
                    error={passwordsMissmatch}
                    label="Password"
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    style={{ marginTop: '15px' }}
                />
                <TextField
                    required
                    type="passwordConfirm"
                    error={passwordsMissmatch}
                    label="Confirm password"
                    name="passwordConfirm"
                    value={credentials.passwordConfirm}
                    onChange={handleChange}
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
                        publishResponses();
                        setDisplayDialog(false);
                    }}
                    disabled={
                        credentials.username.length === 0 ||
                        credentials.password.length === 0 ||
                        credentials.passwordConfirm.length === 0 ||
                        passwordsMissmatch
                    }
                >
                    Publish
                </Button>
            </DialogActions>
        </Dialog>
    </>
    );
}