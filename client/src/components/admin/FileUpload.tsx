import { IconButton, Tooltip } from '@material-ui/core';
import { Cancel } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import { useToasts } from '@src/stores/ToastContext';
import { useTranslations } from '@src/stores/TranslationContext';
import { getFullFilePath } from '@src/utils/path';
import React, { useEffect, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';

interface Props {
  targetPath?: string[];
  surveyId?: number;
  value: {
    path: string[];
    name: string;
  }[];
  onUpload: (file: { name: string; path: string[] }) => void;
  onDelete: (file: { name: string; path: string[] }) => void;
}

const useStyles = makeStyles({
  container: {
    width: '90%',
    display: 'flex',
    alignSelf: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '10px',
    marginBottom: '10px',
    borderWidth: '2px',
    borderRadius: '2px',
    borderColor: '#eeeeee',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    transition: 'border .24s ease-in-out',
  },
});

export default function FileUpload({
  onUpload,
  targetPath,
  value,
  onDelete,
  surveyId,
}: Props) {
  const { tr } = useTranslations();
  const classes = useStyles();
  const { showToast } = useToasts();

  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    maxFiles: 1,
  });

  const imageFileFormats = ['jpg', 'jpeg', 'png', 'tiff', 'bmp'];

  async function deleteFile(path: string[], name: string) {
    const fullFilePath = getFullFilePath(path, name);
    await fetch(`/api/file/${fullFilePath}`, {
      method: 'DELETE',
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
            (value ?? []).map(({ path, name }) => deleteFile(path, name))
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
        fetch(`/api/file${targetPath ? `/${targetPath}` : ''}`, {
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
              onClick={async () => {
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
              <Cancel />
            </IconButton>
          </Tooltip>
        </div>
      );
    });
  }, [value]);

  return (
    <section className={classes.container}>
      <div {...getRootProps({ className: 'dropzone' })}>
        <input {...getInputProps()} />
        <p style={{ color: 'purple', cursor: 'pointer' }}>
          {tr.SurveyImageList.dropFiles}
        </p>
      </div>
      {value?.length ? (
        <aside>
          <h4>{tr.SurveyImageList.files}</h4>
          {filesList}
        </aside>
      ) : null}
    </section>
  );
}
