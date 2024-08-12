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
import { useToasts } from '@src/stores/ToastContext';
import { useSurvey } from '@src/stores/SurveyContext';
import { useTranslations } from '@src/stores/TranslationContext';
import { request } from '@src/utils/request';
import React, { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { getFullFilePath } from '@src/utils/path';

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
  images?: File[];
  setImages?: (images: File[]) => void;
}

const MEGAS = 10;
const MAX_FILE_SIZE = MEGAS * 1000 * 1000; // ten megabytes

export default function SurveyImageList({ imageType, ...props }: Props) {
  const classes = useStyles();
  const { tr } = useTranslations();
  const { editSurvey, activeSurvey } = useSurvey();
  const { showToast } = useToasts();
  const [images, setImages] = useState<File[]>(props.images ?? []);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageAttributions, setImageAttributions] = useState<string>('');
  const [imageAltText, setImageAltText] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<File | null>(null);
  const limitToSvg = ['topMarginImage', 'bottomMarginImage'].includes(
    imageType,
  );
  const activeImageSrc = activeImage
    ? `data:image/${limitToSvg ? 'svg+xml' : ''};base64,${activeImage.data}`
    : '';

  /** Fetch all images from db during component mount */
  useEffect(() => {
    getImages();
  }, []);

  useEffect(() => {
    if (props.images) setImages(props.images);
  }, [props.images]);

  useEffect(() => {
    setActiveImage(getActiveImage());
  });

  function fileValidator(file) {
    if (limitToSvg && file.type !== 'image/svg+xml') {
      return {
        code: 'file-type-error',
        message: tr.SurveyImageList.imageTypeError,
      };
    }
    if (file.size > MAX_FILE_SIZE) {
      return {
        code: 'file-size-exceeded',
        message: tr.SurveyImageList.imageSizeExceeded.replace('{x}', MEGAS),
      };
    }
  }

  function getApiFilePath(imageType: ImageType) {
    switch (imageType) {
      case 'backgroundImage':
        return '/api/file/background-images';
      case 'thanksPageImage':
        return '/api/file/thanks-page-images';
      case 'topMarginImage':
      case 'bottomMarginImage':
        return '/api/file/margin-images';
      default:
        return '/api/file';
    }
  }

  async function getImages() {
    try {
      const res = await request<File[]>(getApiFilePath(imageType));
      props.setImages?.(res) ?? setImages(res);
    } catch (error) {
      showToast({
        severity: 'error',
        message: tr.SurveyImageList.multipleImagesDownloadError,
      });
    }
  }

  function handleListItemClick(
    fileOrganization?: string,
    fileName?: string,
    filePath?: string[],
  ) {
    setImageDialogOpen((prev) => !prev);
    if (!fileName) {
      return;
    }
    switch (imageType) {
      case 'backgroundImage':
        editSurvey({
          ...activeSurvey,
          backgroundImageOrganization: fileOrganization,
          backgroundImageName: fileName,
          backgroundImagePath: filePath,
        });
        break;
      case 'thanksPageImage':
        editSurvey({
          ...activeSurvey,
          thanksPage: {
            ...activeSurvey.thanksPage,
            imageOrganization: fileOrganization,
            imageName: fileName,
            imagePath: filePath,
          },
        });
        break;
      case 'topMarginImage':
        editSurvey({
          ...activeSurvey,
          marginImages: {
            ...activeSurvey.marginImages,
            top: {
              imageOrganization: fileOrganization,
              imageName: fileName,
              imagePath: filePath,
            },
          },
        });
        break;
      case 'bottomMarginImage':
        editSurvey({
          ...activeSurvey,
          marginImages: {
            ...activeSurvey.marginImages,
            bottom: {
              imageOrganization: fileOrganization,
              imageName: fileName,
              imagePath: filePath,
            },
          },
        });
    }
  }

  async function handleDeletingImage(
    event: React.MouseEvent,
    fileName: string,
    filePath: string[],
  ) {
    event.stopPropagation();

    try {
      await fetch(
        `/api/file/${getFullFilePath(
          activeSurvey.organization,
          filePath,
          fileName,
        )}`,
        { method: 'DELETE' },
      );

      editSurvey({
        ...activeSurvey,
        ...(fileName === activeSurvey.backgroundImageName && {
          backgroundImageName: null,
        }),
        ...(fileName === activeSurvey.thanksPage.imageName && {
          thanksPage: { imageName: null, imagePath: [] },
        }),
        marginImages: {
          ...activeSurvey.marginImages,
          ...(fileName === activeSurvey.marginImages.top.imageName && {
            top: { imageName: null, imagePath: [] },
          }),
          ...(fileName === activeSurvey.marginImages.bottom.imageName && {
            bottom: { imageName: null, imagePath: [] },
          }),
        },
      });
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
      validator: fileValidator,
    });

  useEffect(() => {
    if (fileRejections?.length > 0) {
      showToast({
        severity: 'error',
        message: fileRejections[0].errors[0].message,
      });
    }
  }, [fileRejections]);

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
    imageAltText && formData.append('imageAltText', imageAltText);

    try {
      await fetch(getApiFilePath(imageType), {
        method: 'POST',
        body: formData,
        headers: {
          organization: JSON.stringify(activeSurvey.organization),
        },
      });
      acceptedFiles.shift();
      getImages();
      setImageAltText('');
      setImageAttributions('');
    } catch (error) {
      showToast({
        severity: 'error',
        message: tr.SurveyImageList.imageUploadError,
      });
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
        break;
      case 'topMarginImage':
        editSurvey({
          ...activeSurvey,
          marginImages: {
            ...activeSurvey.marginImages,
            top: {
              imageName: null,
              imagePath: [],
            },
          },
        });
        break;
      case 'bottomMarginImage':
        editSurvey({
          ...activeSurvey,
          marginImages: {
            ...activeSurvey.marginImages,
            bottom: {
              imageName: null,
              imagePath: [],
            },
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
      case 'topMarginImage':
        return (
          images?.find(
            (image) =>
              image.fileName === activeSurvey.marginImages.top?.imageName &&
              image.filePath.join() ===
                activeSurvey.marginImages.top.imagePath.join(),
          ) ?? null
        );
      case 'bottomMarginImage':
        return (
          images?.find(
            (image) =>
              image.fileName === activeSurvey.marginImages.bottom?.imageName &&
              image.filePath.join() ===
                activeSurvey.marginImages.bottom.imagePath.join(),
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
        break;
      case 'topMarginImage':
        image?.fileName === activeSurvey?.marginImages?.top?.imageName &&
          (style = { border: '4px solid #1976d2' });
        break;
      case 'bottomMarginImage':
        image?.fileName === activeSurvey?.marginImages?.bottom?.imageName &&
          (style = { border: '4px solid #1976d2' });
    }

    return style;
  }

  function getEmptyImageBorderStyle() {
    switch (imageType) {
      case 'backgroundImage':
        return !activeSurvey?.backgroundImageName
          ? { border: '4px solid #1976d2' }
          : null;
      case 'thanksPageImage':
        return !activeSurvey?.thanksPage.imageName
          ? { border: '4px solid #1976d2' }
          : null;
      case 'topMarginImage':
        return !activeSurvey?.marginImages?.top?.imageName
          ? { border: '4px solid #1976d2' }
          : null;
      case 'bottomMarginImage':
        return !activeSurvey?.marginImages?.bottom?.imageName
          ? { border: '4px solid #1976d2' }
          : null;
      default:
        return null;
    }
  }

  function getSelectorHeader() {
    let header;
    switch (imageType) {
      case 'backgroundImage':
        header = tr.SurveyImageList.surveyImage;
        break;
      case 'thanksPageImage':
        header = tr.SurveyImageList.thanksPageImage;
        break;
      case 'topMarginImage':
        header = tr.SurveyImageList.topMarginImage;
        break;
      case 'bottomMarginImage':
        header = tr.SurveyImageList.bottomMarginImage;
        break;
      default:
        header = tr.SurveyImageList.image;
    }

    return activeImage
      ? `${header}: ${activeImage.fileName}`
      : `${header}: ${tr.SurveyImageList.noImage.toLowerCase()}`;
  }

  function getEmptyImageSelectionPlaceholder() {
    switch (imageType) {
      case 'backgroundImage':
        return tr.SurveyImageList.noBackgroundImage;
      case 'thanksPageImage':
        return tr.SurveyImageList.noThanksPageImage;
      case 'topMarginImage':
        return tr.SurveyImageList.noTopMarginImage;
      case 'bottomMarginImage':
        return tr.SurveyImageList.noBottomMarginImage;
      default:
        return tr.SurveyImageList.noImage;
    }
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
          {getSelectorHeader()}
        </Typography>
        {activeImage && (
          <img
            src={activeImageSrc}
            srcSet={activeImageSrc}
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
              style={getEmptyImageBorderStyle()}
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
                  {getEmptyImageSelectionPlaceholder()}
                </Typography>
              </Container>
            </ImageListItem>
            {images.map((image) => {
              const imageSrc = `data:image/${limitToSvg ? 'svg+xml' : ''};base64,${image.data}`;
              return (
                <ImageListItem
                  style={getImageBorderStyle(image)}
                  key={image.fileName}
                  onClick={() =>
                    handleListItemClick(
                      image.fileOrganization,
                      image.fileName,
                      image.filePath,
                    )
                  }
                >
                  <Cancel
                    color="error"
                    className={classes.deleteImageIcon}
                    onClick={async (event) =>
                      await handleDeletingImage(
                        event,
                        image.fileName,
                        image.filePath,
                      )
                    }
                  />
                  <img
                    src={imageSrc}
                    srcSet={imageSrc}
                    alt={
                      imageAltText
                        ? imageAltText
                        : `survey-image-${image.fileName}`
                    }
                    loading="lazy"
                    style={{ height: '100%', objectFit: 'contain' }}
                  />
                </ImageListItem>
              );
            })}
          </ImageList>
        </DialogContent>
        <section className={classes.container}>
          <div {...getRootProps({ className: 'dropzone' })}>
            <input {...getInputProps()} />
            <p
              style={{
                color: 'purple',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              {(limitToSvg
                ? tr.DropZone.dropFilesSvg
                : tr.DropZone.dropFiles
              ).replace('{x}', MEGAS)}
            </p>
          </div>
          {acceptedFiles?.length ? (
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
