import { IconButton, Tooltip } from '@mui/material';
import CancelIcon from '@src/components/icons/CancelIcon';
import { useToasts } from '@src/stores/ToastContext';
import { useTranslations } from '@src/stores/TranslationContext';
import { getFullFilePath } from '@src/utils/path';
import React, { useEffect, useMemo, useState } from 'react';
import DropZone from '../DropZone';

interface Props {
  targetPath?: string[];
  surveyId?: number;
  value: {
    path: string[];
    name: string;
  }[];
  onUpload: (file: { name: string; path: string[] }) => void;
  onDelete: (file: { name: string; path: string[] }) => void;
  surveyGroups: string[];
}

export default function FileUpload({
  onUpload,
  targetPath,
  value,
  onDelete,
  surveyId,
  surveyGroups,
}: Props) {
  const { tr } = useTranslations();
  const { showToast } = useToasts();
  const [acceptedFiles, setAcceptedFiles] = useState([]);

  const imageFileFormats = ['jpg', 'jpeg', 'png', 'tiff', 'bmp'];

  async function deleteFile(path: string[], name: string) {
    const fullFilePath = getFullFilePath(path, name);
    await fetch(`/api/file/${fullFilePath}`, {
      method: 'DELETE',
      headers: { groups: JSON.stringify(surveyGroups) },
    });
  }

  useEffect(() => {
    async function doUpload() {
      if (!acceptedFiles.length) {
        return;
      }
      // Delete previous file(s)
      if (value) {
        try {
          await Promise.all(
            (value ?? []).map(({ path, name }) => deleteFile(path, name)),
          );
        } catch (error) {
          showToast({
            severity: 'error',
            message: tr.FileUpload.errorDeletingFile,
          });
          return;
        }
      }

      // Save the new file to the server with a POST request
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append('file', file);
      if (surveyId != null) {
        formData.append('surveyId', String(surveyId));
      }
      try {
        await fetch(`/api/file${targetPath ? `/${targetPath}` : ''}`, {
          method: 'POST',
          body: formData,
        });
        // Upload complete - notify via callback
        onUpload({ name: file.name, path: targetPath });
      } catch (error) {
        showToast({
          severity: 'error',
          message: tr.FileUpload.errorUploadingFile,
        });
      }
    }
    doUpload();
  }, [acceptedFiles]);

  const filesList = useMemo(() => {
    return value?.map(({ path, name }) => {
      const fileFormat = name
        .substring(name.lastIndexOf('.') + 1, name.length)
        .toLowerCase();
      const fullFilePath = getFullFilePath(path, name);
      return (
        <div key={name}>
          {imageFileFormats.includes(fileFormat) && (
            <img
              src={`/api/file/${fullFilePath}`}
              style={{ width: 50, maxHeight: 50, marginRight: '1rem' }}
            />
          )}
          <span>{name}</span>
          <Tooltip title={tr.FileUpload.deleteFile}>
            <IconButton
              aria-label="delete"
              size="small"
              style={{ marginLeft: '1rem' }}
              onClick={async (event) => {
                event.stopPropagation();
                try {
                  await deleteFile(path, name);
                  onDelete({ name, path });
                } catch (error) {
                  showToast({
                    severity: 'error',
                    message: tr.FileUpload.errorDeletingFile,
                  });
                }
              }}
            >
              <CancelIcon />
            </IconButton>
          </Tooltip>
        </div>
      );
    });
  }, [value]);

  return (
    <div>
      <DropZone maxFiles={1} fileCallback={(files) => setAcceptedFiles(files)}>
        {value?.length ? (
          <aside>
            <h4>{tr.FileUpload.addedFile}</h4>
            {filesList}
          </aside>
        ) : null}
      </DropZone>
    </div>
  );
}
