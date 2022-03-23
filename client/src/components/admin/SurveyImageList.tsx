// @ts-nocheck

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  ImageList,
  ImageListItem,
  Theme,
  TextField,
  Typography,
} from '@material-ui/core';
import { PhotoLibrary } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import { request } from '@src/utils/request';
import React, { useEffect, useState } from 'react';
import { useTranslations } from '@src/stores/TranslationContext';
import { Cancel } from '@material-ui/icons';
import { useSurvey } from '@src/stores/SurveyContext';
import { useDropzone } from 'react-dropzone';

const useStyles = makeStyles((theme: Theme) => ({
  noImageBackground: {
    backgroundColor: '#D3D3D3',
  },
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
  addImageIcon: {
    color: theme.palette.primary.main,
  },
  deleteImageIcon: {
    position: 'absolute',
    top: '5px',
    left: '5px',
    fontSize: '26px',
  },
}));

export default function SurveyImageList() {
  const classes = useStyles();
  const { tr } = useTranslations();
  const { editSurvey, activeSurvey } = useSurvey();

  const [images, setImages] = useState([]);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageAttributions, setImageAttributions] = useState<string>('');

  /** Fetch all images from db during component mount */
  useEffect(() => {
    getImages();
  }, []);

  async function getImages() {
    const res = await request<any>(`/api/image/`);
    setImages(res);
  }

  function handleListItemClick(id?: number) {
    setImageDialogOpen((prev) => !prev);

    if (!id) {
      return;
    }
    editSurvey({ ...activeSurvey, backgroundImageId: id });
  }

  async function handleDeletingImage(event: React.MouseEvent, id: number) {
    event.stopPropagation();
    await request(`/api/image/${id}`, {
      method: 'DELETE',
    });

    getImages();
  }

  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    maxFiles: 1,
  });

  const files = acceptedFiles?.map((file: any) => (
    <div key={file.path}>
      <span>
        {' '}
        {file.path} - {file.size / 1000} kb{' '}
      </span>
    </div>
  ));

  const closeDialog = () => {
    setImageDialogOpen((prev) => !prev);
    acceptedFiles?.length && acceptedFiles?.shift();
  };

  async function handleImageUpload() {
    if (!acceptedFiles?.length) return;

    const formData = new FormData();
    formData.append('surveyImage', acceptedFiles[0]);
    formData.append('attributions', imageAttributions);
    await fetch(`/api/image`, { method: 'POST', body: formData });
    acceptedFiles.shift();
    getImages();
  }

  function handleEmptyImage() {
    setImageDialogOpen((prev) => !prev);
    editSurvey({ ...activeSurvey, backgroundImageId: null });
  }

  const activeImage =
    images?.find((image) => image.id === activeSurvey.backgroundImageId) ??
    null;

  return (
    <div>
      <Button
        variant="outlined"
        onClick={() => setImageDialogOpen((prev) => !prev)}
      >
        <PhotoLibrary />
        <Typography
          style={{
            textTransform: 'none',
            maxWidth: '400px',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            paddingRight: '0.5rem',
          }}
        >
          {tr.SurveyImageList.surveyImage.toUpperCase()}
          {': '}
          {activeImage
            ? ` ${activeImage?.fileName}.${activeImage?.fileFormat}`
            : ` ${tr.SurveyImageList.noImage.toLowerCase()}`}
        </Typography>
        {activeImage && (
          <img
            src={`data:image/;base64,${activeImage.data}`}
            srcSet={`data:image/;base64,${activeImage.data}`}
            alt={`survey-image-${activeImage.id}`}
            loading="lazy"
            style={{
              height: '60px',
              width: '60px',
              filter: 'drop-shadow(0px 0px 4px lightgrey)',
            }}
          />
        )}
      </Button>
      <Dialog onClose={() => closeDialog()} open={imageDialogOpen}>
        <DialogContent>
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-end',
            }}
          ></div>
          <ImageList
            sx={{ minWidth: 200, minHeight: 200 }}
            cols={3}
            rowHeight={164}
          >
            <ImageListItem
              className={classes.noImageBackground}
              style={
                activeSurvey?.backgroundImageId === 0
                  ? { border: '4px solid #1976d2' }
                  : null
              }
              onClick={() => handleEmptyImage()}
            >
              <span
                style={{
                  marginTop: '70px',
                  alignSelf: 'center',
                }}
              >
                {tr.SurveyImageList.noImage}
              </span>
            </ImageListItem>
            {images.map((image) => (
              <ImageListItem
                style={
                  image.id === activeSurvey?.backgroundImageId
                    ? { border: '4px solid #1976d2' }
                    : null
                }
                key={image.id}
                onClick={() => handleListItemClick(image.id)}
              >
                <Cancel
                  color="error"
                  className={classes.deleteImageIcon}
                  onClick={(event) => handleDeletingImage(event, image.id)}
                />
                <img
                  src={`data:image/;base64,${image.data}`}
                  srcSet={`data:image/;base64,${image.data}`}
                  alt={`survey-image-${image.id}`}
                  loading="lazy"
                  style={{ height: '100%' }}
                />
              </ImageListItem>
            ))}
          </ImageList>
        </DialogContent>
        <section className={classes.container}>
          <div {...getRootProps({ className: 'dropzone' })}>
            <input {...getInputProps()} />
            <p style={{ color: 'purple', cursor: 'pointer' }}>
              {tr.SurveyImageList.dropFiles}
            </p>
          </div>
          {acceptedFiles?.length ? (
            <aside>
              <h4>{tr.SurveyImageList.files}</h4>
              {files}
              <TextField
                id="outlined-name"
                label={tr.SurveyImageList.attributions}
                value={imageAttributions}
                onChange={(event) => setImageAttributions(event.target.value)}
              />
            </aside>
          ) : null}
        </section>
        <DialogActions>
          <Button onClick={() => closeDialog()} autoFocus>
            {tr.commands.cancel}
          </Button>
          <Button
            disabled={!acceptedFiles?.length || !imageAttributions.length}
            onClick={() => handleImageUpload()}
          >
            {tr.commands.save}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
