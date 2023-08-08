import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useToasts } from '@src/stores/ToastContext';
import DropZone from '../DropZone';
import { useTranslations } from '@src/stores/TranslationContext';
import {
  getInstructionFilename,
  storeAdminInstructions,
} from '@src/controllers/AdminFileController';

interface Props {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
const MEGAS = 10;
const MAX_FILE_SIZE = MEGAS * 1000 * 1000; // ten megabytes

export function InstructionsDialog({ isOpen, setIsOpen }: Props) {
  const { showToast } = useToasts();
  const { tr } = useTranslations();
  const [instructionFileName, setInstructionFileName] = useState(null);
  const [stagedFile, setStagedFile] = useState<File>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    async function setFileName() {
      try {
        const filename = await getInstructionFilename();
        setInstructionFileName(filename);
      } catch (error) {
        showToast({
          severity: 'error',
          message: tr.InstructionsDialog.fetchingError,
        });
      }
    }
    setFileName();
  }, [isOpen]);

  const allowedFilesRegex = /^data:(application)\/(pdf);base64,/;

  function readFileAsync(file: File) {
    return new Promise<string | ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result);
      };

      reader.onerror = (error) => {
        reject(error);
      };
    });
  }

  return (
    <Dialog open={isOpen}>
      <DialogTitle>{tr.InstructionsDialog.uploadNewInstructions}</DialogTitle>
      <DialogContent>
        <DropZone
          maxFiles={1}
          fileCallback={async (files: File[]) => {
            try {
              const filesSize = files
                .map((file) => file.size)
                .reduce(
                  (prevValue, currentValue) => prevValue + currentValue,
                  0
                );
              if (filesSize > MAX_FILE_SIZE) {
                showToast({
                  severity: 'error',
                  message: tr.InstructionsDialog.fileSizeLimitError.replace(
                    '{x}',
                    String(MEGAS)
                  ),
                });
                return;
              }
              const fileStrings = (await Promise.all(
                files.map((file: any) => readFileAsync(file))
              )) as string[];

              const filesAreValid = !fileStrings
                .map((fileString: string) => allowedFilesRegex.test(fileString))
                .includes(false);

              if (filesAreValid) {
                setStagedFile(files[0]);
              } else {
                showToast({
                  severity: 'error',
                  message: tr.InstructionsDialog.wrongFileFormat,
                });
              }
            } catch (err) {
              showToast({
                severity: 'error',
                message: err?.message ?? tr.InstructionsDialog.fileUploadError,
              });
            }
          }}
        >
          {stagedFile && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <AttachFileIcon />
              <p>{stagedFile.name}</p>
            </div>
          )}
        </DropZone>
        {instructionFileName && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: '20px',
              justifyContent: 'center',
              gap: '20px',
            }}
          >
            <Typography>
              {' '}
              {tr.InstructionsDialog.currentInstructions}:{' '}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<PictureAsPdfIcon sx={{ color: 'inherit' }} />}
              href="/api/file/instructions"
              download={instructionFileName}
            >
              {instructionFileName}
            </Button>
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setIsOpen(false);
            setStagedFile(null);
            setInstructionFileName(null);
          }}
        >
          Peruuta
        </Button>
        <Button
          onClick={async () => {
            if (stagedFile) {
              await storeAdminInstructions(stagedFile);
              setIsOpen(false);
              setStagedFile(null);
              setInstructionFileName(null);
            }
          }}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}
