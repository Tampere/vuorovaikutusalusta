import { IconButton, Tooltip } from '@material-ui/core';
import { Cancel } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import { useToasts } from '@src/stores/ToastContext';
import { useTranslations } from '@src/stores/TranslationContext';
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

  useEffect(() => {
    // Save the file to the server with a POST request
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append('file', file);
      if (surveyId != null) {
        formData.append('surveyId', String(surveyId));
      }
      fetch(`/api/file${targetPath ? `/${targetPath}` : ''}`, {
        method: 'POST',
        body: formData,
      })
        .then(() => {
          // Upload complete - notify via callback
          onUpload({ name: file.name, path: targetPath });
        })
        .catch(() => {
          showToast({
            severity: 'error',
            message: tr.FileUpload.errorUploadingFile,
          });
        });
    }
  }, [acceptedFiles]);

  const filesList = useMemo(() => {
    return value?.map(({ path, name }) => (
      <div key={name}>
        <img
          src={`/api/file/${path ? path.join('/') + '/' : ''}${name}`}
          style={{ width: 50, maxHeight: 50, marginRight: '1rem' }}
        />
        <span>{name}</span>
        <Tooltip title={tr.FileUpload.deleteFile}>
          <IconButton
            aria-label="delete"
            size="small"
            style={{ marginLeft: '1rem' }}
            onClick={async () => {
              try {
                await fetch(`/api/file/${path.join('/')}/${name}`, {
                  method: 'DELETE',
                });
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
    ));
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
