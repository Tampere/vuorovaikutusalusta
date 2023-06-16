import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useTranslations } from '@src/stores/TranslationContext';

interface Props {
  title?: string;
  text: string;
  open: boolean;
  onClose: (result: boolean) => void;
}

export default function ConfirmDialog(props: Props) {
  const { tr } = useTranslations();

  function handleClose(result: boolean) {
    return function () {
      props.onClose(result);
    };
  }

  return (
    <Dialog
      open={props.open}
      onClose={handleClose(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      {props.title && (
        <DialogTitle id="alert-dialog-title">{props.title}</DialogTitle>
      )}

      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {props.text}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose(false)} autoFocus>
          {tr.options.no}
        </Button>
        <Button onClick={handleClose(true)}>{tr.options.yes}</Button>
      </DialogActions>
    </Dialog>
  );
}
