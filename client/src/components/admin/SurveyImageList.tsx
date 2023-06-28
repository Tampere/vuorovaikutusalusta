// @ts-nocheck

import { File, ImageType } from '@interfaces/survey';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  ImageList,
  ImageListItem,
  TextField,
  Theme,
  Typography,
} from '@mui/material';
import { Cancel, PhotoLibrary } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { useSurvey } from '@src/stores/SurveyContext';
import { useTranslations } from '@src/stores/TranslationContext';
import { request } from '@src/utils/request';
import React, { useEffect, useState } from 'react';
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

interface Props {
  imageType: ImageType;
}

export default function SurveyImageList({ imageType }: Props) {
  const classes = useStyles();
  const { tr } = useTranslations();
  const { editSurvey, activeSurvey } = useSurvey();

  const [images, setImages] = useState<File[]>([]);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageAttributions, setImageAttributions] = useState<string>('');
  const [imageAltText, setImageAltText] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<File | null>(null);

  /** Fetch all images from db during component mount */
  useEffect(() => {
    getImages();
  }, []);

  useEffect(() => {
    setActiveImage(getActiveImage());
  });

  async function getImages() {
    const res = await request<File[]>(
      `/api/file/${
        imageType === 'backgroundImage'
          ? 'background-images'
          : imageType === 'thanksPageImage'
          ? 'thanks-page-images'
          : ''
      }`
    );

    setImages(res);
  }

  function handleListItemClick(fileName?: string, filePath?: string[]) {
    setImageDialogOpen((prev) => !prev);

    if (!fileName) {
      return;
    }
    switch (imageType) {
      case 'backgroundImage':
        editSurvey({
          ...activeSurvey,
          backgroundImageName: fileName,
          backgroundImagePath: filePath,
        });
        break;
      case 'thanksPageImage':
        editSurvey({
          ...activeSurvey,
          thanksPage: {
            ...activeSurvey.thanksPage,
            imageName: fileName,
            imagePath: filePath,
          },
        });
    }
  }

  async function handleDeletingImage(
    event: React.MouseEvent,
    fileName: string
  ) {
    event.stopPropagation();
    await fetch(`/api/file/${fileName}`, { method: 'DELETE' });

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
    formData.append('file', acceptedFiles[0]);
    formData.append('attributions', imageAttributions);
    formData.append('imageAltText', imageAltText);

    await fetch(
      `/api/file/${
        imageType === 'backgroundImage'
          ? 'background-images'
          : imageType === 'thanksPageImage'
          ? 'thanks-page-images'
          : ''
      }`,
      { method: 'POST', body: formData }
    );
    acceptedFiles.shift();
    getImages();
  }

  function handleEmptyImage() {
    setImageDialogOpen((prev) => !prev);
    switch (imageType) {
      case 'backgroundImage':
        editSurvey({
          ...activeSurvey,
          backgroundImageName: null,
          backgroundImagePath: [],
        });
        break;
      case 'thanksPageImage':
        editSurvey({
          ...activeSurvey,
          thanksPage: {
            ...activeSurvey.thanksPage,
            imageName: null,
            imagePath: [],
          },
        });
    }
  }

  function getActiveImage() {
    switch (imageType) {
      case 'backgroundImage':
        return (
          images?.find(
            (image) =>
              image.fileName === activeSurvey.backgroundImageName &&
              image.filePath.join() === activeSurvey.backgroundImagePath.join()
          ) ?? null
        );
        break;
      case 'thanksPageImage':
        return (
          images?.find(
            (image) =>
              image.fileName === activeSurvey.thanksPage.imageName &&
              image.filePath.join() === activeSurvey.thanksPage.imagePath.join()
          ) ?? null
        );
    }
  }

  function getImageBorderStyle(image: File) {
    let style: { border: string } | {} = {};
    switch (imageType) {
      case 'backgroundImage':
        image?.fileName === activeSurvey?.backgroundImageName &&
          (style = { border: '4px solid #1976d2' });
        break;

      case 'thanksPageImage':
        image?.fileName === activeSurvey?.thanksPage.imageName &&
          (style = { border: '4px solid #1976d2' });
    }
    return style;
  }

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
          {imageType === 'backgroundImage'
            ? tr.SurveyImageList.surveyImage
            : imageType === 'thanksPageImage'
            ? tr.SurveyImageList.thanksPageImage
            : tr.SurveyImageList.image}
          {': '}
          {activeImage
            ? ` ${activeImage?.fileName}`
            : ` ${tr.SurveyImageList.noImage.toLowerCase()}`}
        </Typography>
        {activeImage && (
          <img
            src={`data:image/;base64,${activeImage.data}`}
            srcSet={`data:image/;base64,${activeImage.data}`}
            alt={`survey-image-${activeImage.fileName}`}
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
                imageType === 'backgroundImage'
                  ? !activeSurvey?.backgroundImageName
                    ? {
                        border: '4px solid #1976d2',
                      }
                    : null
                  : imageType === 'thanksPageImage'
                  ? !activeSurvey?.thanksPage.imageName
                    ? {
                        border: '4px solid #1976d2',
                      }
                    : null
                  : null
              }
              onClick={() => handleEmptyImage()}
            >
              <Container
                style={{
                  display: 'flex',
                  padding: '0px 4px',
                  height: '100%',
                  maxWidth: '155px',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  style={{
                    textAlign: 'center',
                  }}
                >
                  {imageType === 'backgroundImage'
                    ? tr.SurveyImageList.noBackgroundImage
                    : imageType === 'thanksPageImage'
                    ? tr.SurveyImageList.noThanksPageImage
                    : tr.SurveyImageList.noImage}
                </Typography>
              </Container>
            </ImageListItem>
            {images.map((image) => (
              <ImageListItem
                style={getImageBorderStyle(image)}
                key={image.fileName}
                onClick={() =>
                  handleListItemClick(image.fileName, image.filePath)
                }
              >
                <Cancel
                  color="error"
                  className={classes.deleteImageIcon}
                  onClick={(event) =>
                    handleDeletingImage(event, image.fileName)
                  }
                />
                <img
                  src={`data:image/;base64,${image.data}`}
                  srcSet={`data:image/;base64,${image.data}`}
                  alt={
                    imageAltText
                      ? imageAltText
                      : `survey-image-${image.fileName}`
                  }
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
              {tr.DropZone.dropFiles}
            </p>
          </div>
          {acceptedFiles?.length ? (
            <aside>
              <h4>{tr.SurveyImageList.files}</h4>
              {files}

              <TextField
                id="outlined-alt-text"
                label={tr.EditImageSection.altText}
                value={imageAltText ? imageAltText : ''}
                onChange={(event) => setImageAltText(event.target.value)}
                sx={{ marginTop: 1, marginBottom: 1, width: 250 }}
              />
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
