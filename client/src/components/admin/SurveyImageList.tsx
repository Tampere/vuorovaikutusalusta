import { File, ImageType, SurveyImage } from '@interfaces/survey';
import {
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  ImageList,
  ImageListItem,
  TextField,
  Theme,
  Typography,
  Box,
} from '@mui/material';
import { Cancel, PhotoLibrary } from '@mui/icons-material';
import { useToasts } from '@src/stores/ToastContext';
import { useSurvey } from '@src/stores/SurveyContext';
import { useTranslations } from '@src/stores/TranslationContext';
import { request } from '@src/utils/request';
import React, { useEffect, useState } from 'react';
import { FileWithPath, useDropzone } from 'react-dropzone';
import { set } from 'date-fns';

const styles = (theme: Theme) => ({
  noImageBackground: { backgroundColor: '#D3D3D3' },
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
  addImageIcon: { color: theme.palette.primary.main },
  deleteImageIcon: {
    position: 'absolute',
    top: '5px',
    left: '5px',
    fontSize: '26px',
  },
});

interface Props {
  imageType: ImageType;
}

const MEGAS = 10;
const MAX_FILE_SIZE = MEGAS * 1000 * 1000; // ten megabytes

export default function SurveyImageList({ imageType }: Props) {
  const { tr } = useTranslations();
  const { editSurvey, activeSurvey } = useSurvey();
  const { showToast } = useToasts();
  const [images, setImages] = useState<SurveyImage[]>([]);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageAttributions, setImageAttributions] = useState<string>('');
  const [imageAltText, setImageAltText] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<SurveyImage | null>(null);
  const [loadingImages, setLoadingImages] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<FileWithPath | null>(null);

  /** Fetch all images from db during component mount */
  useEffect(() => {
    getImages();
  }, []);

  useEffect(() => {
    setActiveImage(getActiveImage());
  });

  useEffect(() => {
    activeImage && setSelectedImage(activeImage.fileName);
  }, [activeImage]);

  function handleSelectedImageChange(newSelection: string | null) {
    setSelectedImage(newSelection);
    const image = images.find((image) => image.fileName === newSelection);
    setImageAltText(image?.altText ?? '');
    setImageAttributions(image?.attributions ?? '');
  }

  function fileSizeValidator(file: FileWithPath) {
    if (file.size > MAX_FILE_SIZE) {
      return {
        code: 'file-size-exceeded',
        message: tr.SurveyImageList.imageSizeExceeded.replace(
          '{x}',
          MEGAS.toString(),
        ),
      };
    }
  }

  async function getImages() {
    setLoadingImages(true);
    try {
      const res = await request<SurveyImage[]>(
        `/api/file/${
          imageType === 'backgroundImage'
            ? 'background-images'
            : imageType === 'thanksPageImage'
            ? 'thanks-page-images'
            : ''
        }?compressed=true`,
      );
      setLoadingImages(false);
      setImages(res);
    } catch (error) {
      setLoadingImages(false);
      showToast({
        severity: 'error',
        message: tr.SurveyImageList.multipleImagesDownloadError,
      });
    }
  }

  function handleListItemClick(fileName?: string, filePath?: string[]) {
    if (!fileName) {
      handleSelectedImageChange(null);
      return;
    }
    handleSelectedImageChange(fileName);
  }

  async function handleDeletingImage(
    event: React.MouseEvent,
    fileName: string,
    filePath: string[],
  ) {
    event.stopPropagation();
    try {
      await fetch(
        `/api/file${filePath.length > 0 ? '/' : ''}${filePath.join(
          '/',
        )}/${fileName}`,
        { method: 'DELETE' },
      );
    } catch (error) {
      showToast({
        severity: 'error',
        message: tr.SurveyImageList.imageDeleteError,
      });
    }

    getImages();
  }

  const { acceptedFiles, fileRejections, getRootProps, getInputProps } =
    useDropzone({
      maxFiles: 1,
      validator: fileSizeValidator,
      onDrop: (acceptedFiles) => {
        setPreview(URL.createObjectURL(acceptedFiles[0]));
        setUploadedImage(acceptedFiles[0]);
        handleSelectedImageChange('NEW');
      },
    });

  useEffect(() => {
    if (fileRejections?.length > 0) {
      showToast({
        severity: 'error',
        message: fileRejections[0].errors[0].message,
      });
    }
  }, [fileRejections]);

  const files = uploadedImage ? (
    <div key={uploadedImage.path}>
      <span>
        {uploadedImage.path} - {uploadedImage.size / 1000} kb{' '}
      </span>
    </div>
  ) : (
    <div />
  );

  const closeDialog = () => {
    setImageDialogOpen((prev) => !prev);
    setUploadedImage(null);
  };

  function updateImage(imgName: string, imgPath: string[]) {
    switch (imageType) {
      case 'backgroundImage':
        editSurvey({
          ...activeSurvey,
          backgroundImageName: imgName,
          backgroundImagePath: imgPath,
        });
        break;
      case 'thanksPageImage':
        editSurvey({
          ...activeSurvey,
          thanksPage: {
            ...activeSurvey.thanksPage,
            imageName: imgName,
            imagePath: imgPath,
          },
        });
    }
  }

  async function handleDialogSave() {
    if (selectedImage === null) {
      handleEmptyImage();
      return;
    }

    if (uploadedImage) {
      const res = await handleImageUpload();
      updateImage(res.id.name, res.id.path); // TODO: Fix these being under id, server side returned wrong
      setSelectedImage(res.id.name);
    }

    // Fetch selected pic
    const selected = images.find((img) => img.fileName === selectedImage);

    if (selected) {
      try {
        const response = await fetch(`/api/file/${selected?.id}/details`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            attributions: imageAttributions,
            imageAltText,
          }),
        });

        // update existing image state
        getImages();
      } catch (e) {
        showToast({
          severity: 'error',
          message: tr.SurveyImageList.imageDownloadError,
        });
      }
      updateImage(selected.fileName, selected.filePath);
    }

    setImageDialogOpen(false);
  }

  async function handleImageUpload() {
    if (!uploadedImage) return;

    const formData = new FormData();
    formData.append('file', uploadedImage);
    if (selectedImage === uploadedImage.name) {
      formData.append('attributions', imageAttributions);
      imageAltText && formData.append('imageAltText', imageAltText);
    }

    try {
      const res = await fetch(
        `/api/file/${
          imageType === 'backgroundImage'
            ? 'background-images'
            : imageType === 'thanksPageImage'
            ? 'thanks-page-images'
            : ''
        }`,
        { method: 'POST', body: formData },
      );
      setUploadedImage(null);
      getImages();
      return res.json();
    } catch (error) {
      showToast({
        severity: 'error',
        message: tr.SurveyImageList.imageUploadError,
      });
      return null;
    }
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
              image.filePath.join() === activeSurvey.backgroundImagePath.join(),
          ) ?? null
        );
      case 'thanksPageImage':
        return (
          images?.find(
            (image) =>
              image.fileName === activeSurvey.thanksPage.imageName &&
              image.filePath.join() ===
                activeSurvey.thanksPage.imagePath.join(),
          ) ?? null
        );
    }
  }

  function getImageBorderStyle(image: File) {
    return image.fileName === selectedImage
      ? { border: '4px solid #1976d2' }
      : { border: '4px solid transparent' }; //Transparent border to stop elements shifting on colour change
  }

  return (
    <div>
      <Button
        variant="outlined"
        onClick={() => setImageDialogOpen((prev) => !prev)}
      >
        <PhotoLibrary />
        {loadingImages ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              paddingLeft: '1rem',
            }}
          >
            <Typography>Ladataan kuvia</Typography>
            <CircularProgress size={'1rem'} />
          </Box>
        ) : (
          <>
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
          </>
        )}
      </Button>
      <Dialog onClose={() => closeDialog()} open={imageDialogOpen}>
        <DialogContent>
          {loadingImages ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                paddingLeft: '1rem',
              }}
            >
              <ImageList
                sx={{ minWidth: 200, minHeight: 200 }}
                cols={3}
                rowHeight={164}
              >
                <ImageListItem
                  sx={(theme) => styles(theme).noImageBackground}
                  style={
                    selectedImage === null
                      ? { border: '4px solid #1976d2' }
                      : null
                  }
                  onClick={() => handleSelectedImageChange(null)}
                >
                  <Typography>{tr.SurveyImageList.loadingImages}</Typography>
                  <CircularProgress size={'1rem'} />
                </ImageListItem>
              </ImageList>
            </Box>
          ) : (
            <Box
              sx={{
                '@keyframes fadeIn': {
                  from: { opacity: 0 },
                  to: { opacity: 1 },
                },
                animation: 'fadeIn 0.3s',
              }}
            >
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                }}
              />
              <ImageList
                sx={{ minWidth: 200, minHeight: 200 }}
                cols={3}
                rowHeight={164}
              >
                <ImageListItem
                  sx={(theme) => ({
                    ...styles(theme).noImageBackground,
                    ...(selectedImage === null
                      ? { border: '4px solid #1976d2' }
                      : {}),
                  })}
                  key={'no-image'}
                  onClick={() => handleSelectedImageChange(null)}
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
                {uploadedImage && (
                  <ImageListItem
                    style={
                      selectedImage === 'NEW'
                        ? { border: '4px solid #1976d2' }
                        : {}
                    }
                    key={uploadedImage.name}
                    onClick={() => handleSelectedImageChange('NEW')}
                  >
                    <img src={preview} style={{ height: '100%' }}></img>
                  </ImageListItem>
                )}
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
                      sx={(theme) => styles(theme).deleteImageIcon}
                      onClick={(event) =>
                        handleDeletingImage(
                          event,
                          image.fileName,
                          image.filePath,
                        )
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
            </Box>
          )}
        </DialogContent>
        {selectedImage && (
          <Box component="section" sx={(theme) => styles(theme).container}>
            <TextField
              id="outlined-alt-text"
              label={tr.EditImageSection.altText}
              value={imageAltText ? imageAltText : ''}
              onChange={(event) => setImageAltText(event.target.value)}
              fullWidth
              sx={{ marginTop: 1, marginBottom: 1 }}
            />
            <TextField
              id="outlined-name"
              label={tr.SurveyImageList.attributions}
              value={imageAttributions}
              onChange={(event) => setImageAttributions(event.target.value)}
              fullWidth
            />
          </Box>
        )}
        <Box component="section" sx={(theme) => styles(theme).container}>
          <div {...getRootProps({ className: 'dropzone' })}>
            <input {...getInputProps()} />
            <p style={{ color: 'purple', cursor: 'pointer' }}>
              {tr.DropZone.dropFiles.replace('{x}', MEGAS.toString())}
            </p>
          </div>
          {uploadedImage && (
            <aside
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignSelf: 'flex-start',
                marginLeft: 2,
              }}
            >
              <h4>{tr.SurveyImageList.files}</h4>
              {files}

              {/*<TextField
                id="outlined-alt-text"
                label={tr.EditImageSection.altText}
                value={imageAltText ? imageAltText : ''}
                onChange={(event) => setImageAltText(event.target.value)}
                sx={{ marginTop: 1, marginBottom: 1 }}
              />
              <TextField
                id="outlined-name"
                label={tr.SurveyImageList.attributions}
                value={imageAttributions}
                onChange={(event) => setImageAttributions(event.target.value)}
              />*/}
            </aside>
          )}
        </Box>
        <DialogActions>
          <Button onClick={() => closeDialog()} autoFocus>
            {tr.commands.cancel}
          </Button>
          <Button
            disabled={
              activeImage &&
              selectedImage === activeImage.fileName &&
              activeImage.altText === imageAltText &&
              activeImage.attributions === imageAttributions
            }
            onClick={() => handleDialogSave()}
          >
            {tr.commands.save}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
