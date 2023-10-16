import { SubmissionInfo } from '@interfaces/survey';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { useState } from 'react';

interface Props {
  open: boolean;
  onCancel: () => void;
  onSubmit: (info: SubmissionInfo) => void;
}

const useStyles = makeStyles({
  paragraph: {
    marginBottom: '1rem',
  },
});

export default function SubmissionInfoDialog({
  open,
  onCancel,
  onSubmit,
}: Props) {
  const { tr } = useTranslations();
  const classes = useStyles();
  const [email, setEmail] = useState<string>(null);
  const [emailDirty, setEmailDirty] = useState(false);

  return (
    <Dialog
      open={open}
      onClose={() => {
        onCancel();
      }}
    >
      <DialogTitle>{tr.SubmissionInfoDialog.title}</DialogTitle>
      <DialogContent>
        <Typography variant="body1" className={classes.paragraph}>
          {tr.SubmissionInfoDialog.text}
        </Typography>
        <TextField
          aria-label={tr.SubmissionInfoDialog.email}
          label={tr.SubmissionInfoDialog.email}
          error={emailDirty && !email?.length}
          value={email ?? ''}
          inputProps={{ type: 'email' }}
          style={{ width: '25rem', maxWidth: '100%' }}
          onChange={(event) => {
            setEmail(event.target.value.length > 0 ? event.target.value : null);
          }}
          onBlur={() => {
            setEmailDirty(true);
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{tr.commands.cancel}</Button>
        <Button
          variant="contained"
          onClick={() => {
            onSubmit({ email });
          }}
        >
          {tr.SurveyStepper.submit}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
