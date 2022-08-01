import { FileAnswer } from '@interfaces/survey';
import { IconButton, Typography } from '@material-ui/core';
import { Delete } from '@material-ui/icons';
import { useToasts } from '@src/stores/ToastContext';
import { useTranslations } from '@src/stores/TranslationContext';
import React from 'react';
import DropZone from './DropZone';

interface Props {
  value: FileAnswer[];
  onChange: (value: FileAnswer[]) => void;
  setDirty: (dirty: boolean) => void;
}

export default function AttachmentQuestion({
  value,
  setDirty,
  onChange,
}: Props) {
  const { tr } = useTranslations();
  const { showToast } = useToasts();

  const allowedFilesRegex =
    /^data:(image|application)\/(png|jpg|jpeg|pdf|vnd.openxmlformats-officedocument.spreadsheetml.sheet|xlsx|vnd.openxmlformats-officedocument.wordprocessingml.document|docx);base64,/;

  function readFileAsync(file: any) {
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

  const dropzoneContent = value?.length ? (
    <div>
      <Typography> {tr.AttachmentQuestion.addedFile}: </Typography>
      {value?.map((file, index) => {
        return (
          <div
            key={`file-upload-${index}`}
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Typography style={{ color: 'purple' }}>
              {' '}
              {file.fileName}{' '}
            </Typography>
            <IconButton
              aria-label="delete-uploaded-file"
              onClick={(event) => {
                event.stopPropagation();
                value.splice(index, 1);
                onChange(value);
              }}
            >
              <Delete />
            </IconButton>
          </div>
        );
      })}
    </div>
  ) : null;

  return (
    <div>
      <DropZone
        maxFiles={1}
        fileCallback={async (files: File[]) => {
          try {
            const filesSize = files
              .map((file) => file.size)
              .reduce((prevValue, currentValue) => prevValue + currentValue, 0);
            if (filesSize > 10 * 1000 * 1000) {
              showToast({
                severity: 'error',
                message: tr.AttachmentQuestion.fileSizeLimitError,
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
              onChange(
                fileStrings.map((fileString, index) => ({
                  fileName: files[index].name,
                  fileString: fileString,
                }))
              );
              setDirty(true);
            } else {
              showToast({
                severity: 'error',
                message: tr.AttachmentQuestion.unsupportedFileFormat,
              });
            }
          } catch (err) {
            showToast({
              severity: 'error',
              message: err?.message ?? tr.AttachmentQuestion.fileUploadError,
            });
          }
        }}
      >
        {dropzoneContent}
      </DropZone>
      <Typography>{tr.AttachmentQuestion.attachmentFileFormats}</Typography>
    </div>
  );
}
