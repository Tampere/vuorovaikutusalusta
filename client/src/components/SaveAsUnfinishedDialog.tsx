import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { useSurveyAnswers } from '@src/stores/SurveyAnswerContext';
import { useToasts } from '@src/stores/ToastContext';
import { useTranslations } from '@src/stores/TranslationContext';
import { request } from '@src/utils/request';
import React, { useState } from 'react';

interface Props {
  open: boolean;
  onCancel: () => void;
  onSave: (token: string) => void;
}

const useStyles = makeStyles({
  paragraph: {
    marginBottom: '1rem',
  },
});

export default function SaveAsUnfinishedDialog({
  open,
  onCancel,
  onSave,
}: Props) {
  const { tr } = useTranslations();
  const classes = useStyles();
  const [email, setEmail] = useState('');
  const [emailDirty, setEmailDirty] = useState(false);
  const [loading, setLoading] = useState(false);

  const { survey, answers, unfinishedToken, setUnfinishedToken } =
    useSurveyAnswers();
  const { showToast } = useToasts();

  async function handleSave() {
    setLoading(true);
    try {
      const { token } = await request<{ token: string }>(
        `/api/published-surveys/${survey.name}/unfinished-submission${
          unfinishedToken ? `?token=${unfinishedToken}` : ''
        }`,
        {
          method: 'POST',
          body: {
            email,
            entries: answers,
          },
        }
      );
      showToast({
        message: tr.SaveAsUnfinishedDialog.saveSuccessful,
        severity: 'success',
      });
      setUnfinishedToken(token);
      onSave(token);
    } catch (error) {
      showToast({
        message: tr.SaveAsUnfinishedDialog.errorSaving,
        severity: 'error',
      });
    }
    setLoading(false);
  }

  return (
    <Dialog
      open={open}
      onClose={() => {
        onCancel();
      }}
    >
      <DialogTitle>{tr.SurveyStepper.saveAsUnfinished}</DialogTitle>
      <DialogContent>
        <Typography variant="body1" className={classes.paragraph}>
          {tr.SaveAsUnfinishedDialog.description}
        </Typography>
        <Typography variant="body1" className={classes.paragraph}>
          {tr.SaveAsUnfinishedDialog.disclaimer}
        </Typography>
        <TextField
          aria-label={tr.SaveAsUnfinishedDialog.email}
          label={tr.SaveAsUnfinishedDialog.email}
          required
          error={emailDirty && !email.length}
          value={email}
          inputProps={{ type: 'email' }}
          onChange={(event) => {
            setEmail(event.target.value);
          }}
          onBlur={() => {
            setEmailDirty(true);
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>
          {tr.commands.cancel}
        </Button>
        <Button onClick={handleSave} disabled={loading || !email.length}>
          {tr.options.ok}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
