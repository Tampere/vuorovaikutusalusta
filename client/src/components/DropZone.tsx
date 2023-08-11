import { Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

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
  dropzone: {
    borderRadius: '2px',
    outlineOffset: 0,
    outlineColor: 'rbga(0,0,0,0)',
    transition: 'outline-offset 400ms, outline-color   400ms',
    '&:focus-visible': {
      outline: '2px solid black',
      outlineOffset: '2px',
    }
  },
});

interface Props {
  maxFiles: number;
  fileCallback: (files: File[]) => void;
  children?: React.ReactNode;
}

export default function DropZone({ maxFiles, fileCallback, children }: Props) {
  const classes = useStyles();
  const { tr } = useTranslations();
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    maxFiles: maxFiles,
  });

  useEffect(() => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;
    fileCallback(acceptedFiles);
  }, [acceptedFiles]);

  return (
    <section className={classes.container}>
      <div
        {...getRootProps({ className: `dropzone ${classes.dropzone}` })}
        aria-label={children ? tr.AttachmentQuestion.replace : '' }
      >
        <input {...getInputProps()} />
        <div style={{ cursor: 'pointer' }}>
          <Typography color='primary'>{children ? children : tr.DropZone.dropFiles}</Typography>
        </div>
      </div>
    </section>
  );
}
