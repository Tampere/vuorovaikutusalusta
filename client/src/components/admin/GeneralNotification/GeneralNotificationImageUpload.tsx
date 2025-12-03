import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useTranslations } from '@src/stores/TranslationContext';
import DropZone from '@src/components/DropZone';
import { useToasts } from '@src/stores/ToastContext';
import { Image } from '@mui/icons-material';

const MEGAS = 10;
const MAX_FILE_SIZE = MEGAS * 1000 * 1000; // ten megabytes
const allowedImageTypes = [
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/gif',
  'image/webp',
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    files: File | null,
    details: Record<string, string>,
  ) => Promise<void>;
}

export function GeneralNotificationImageUploadDialog({
  isOpen,
  onClose,
  onSave,
}: Props) {
  const { tr } = useTranslations();
  const { showToast } = useToasts();
  const [stagedFile, setStagedFile] = useState<File>(null);
  const [altText, setAltText] = useState('');
  const [attributions, setAttributions] = useState('');

  return (
    <Dialog open={isOpen}>
      <DialogTitle>{tr.TextEditor.addPicture}</DialogTitle>
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          '& #dropzone-container': {
            width: 'auto',
            minWidth: '510px',
          },
        }}
      >
        <DropZone
          maxFiles={1}
          fileCallback={async (files: File[]) => {
            try {
              const filesSize = files
                .map((file) => file.size)
                .reduce(
                  (prevValue, currentValue) => prevValue + currentValue,
                  0,
                );
              if (filesSize > MAX_FILE_SIZE) {
                showToast({
                  severity: 'error',
                  message: tr.FileUploadDialog.fileSizeLimitError.replace(
                    '{x}',
                    String(MEGAS),
                  ),
                });
                return;
              }

              const filesAreValid = files.every((file) =>
                allowedImageTypes.includes(file.type),
              );

              if (filesAreValid) {
                setStagedFile(files[0]);
              } else {
                showToast({
                  severity: 'error',
                  message: tr.FileUploadDialog.wrongFileFormatImage,
                });
              }
            } catch (err) {
              showToast({
                severity: 'error',
                message: err?.message ?? tr.FileUploadDialog.fileUploadError,
              });
            }
          }}
        >
          {stagedFile && (
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Image />
              <p>{stagedFile.name}</p>
            </div>
          )}
        </DropZone>

        <TextField
          value={altText}
          label={tr.GeneralNotification.imageAltText}
          onChange={(event) => {
            setAltText(event.target.value);
          }}
        />
        <TextField
          value={attributions}
          label={tr.GeneralNotification.imageAttributions}
          onChange={(event) => {
            setAttributions(event.target.value);
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          onClick={() => {
            onClose();
            setStagedFile(null);
            setAltText('');
            setAttributions('');
          }}
        >
          {tr.FileUploadDialog.cancel}
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            onSave(stagedFile, { imageAltText: altText, attributions });
            onClose();
            setStagedFile(null);
            setAltText('');
            setAttributions('');
          }}
        >
          {tr.FileUploadDialog.save}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
