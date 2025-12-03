import { ImageFile } from '@interfaces/survey';
import { Button, CircularProgress, Typography, Box } from '@mui/material';
import { PhotoLibrary } from '@mui/icons-material';
import { useToasts } from '@src/stores/ToastContext';
import { useSurvey } from '@src/stores/SurveyContext';
import { useTranslations } from '@src/stores/TranslationContext';
import { request } from '@src/utils/request';
import React, { useEffect, useState } from 'react';
import { FileWithPath } from 'react-dropzone';
import ImageListDialog from './ImageListDialog';

type ImageType = 'backgroundImage' | 'thanksPageImage';

interface Props {
  imageType: ImageType;
}

export default function SurveyImageList({ imageType }: Props) {
  const { tr } = useTranslations();
  const { editSurvey, activeSurvey } = useSurvey();
  const { showToast } = useToasts();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [activeImage, setActiveImage] = useState<ImageFile | null>(null);
  const [loadingImages, setLoadingImages] = useState(false);

  /** Fetch all images from db during component mount */
  useEffect(() => {
    getImages();
  }, []);

  useEffect(() => {
    setActiveImage(getActiveImage());
  });

  async function getImages() {
    setLoadingImages(true);
    try {
      const res = await request<ImageFile[]>(
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

  const closeDialog = () => {
    setImageDialogOpen((prev) => !prev);
  };

  function updateImage(
    imgName: string,
    imgPath: string[],
    displayAttributions: boolean,
  ) {
    switch (imageType) {
      case 'backgroundImage':
        editSurvey({
          ...activeSurvey,
          backgroundImageName: imgName,
          backgroundImagePath: imgPath,
          displayBackgroundAttributions: displayAttributions,
        });
        break;
      case 'thanksPageImage':
        editSurvey({
          ...activeSurvey,
          displayThanksAttributions: displayAttributions,
          thanksPage: {
            ...activeSurvey.thanksPage,
            imageName: imgName,
            imagePath: imgPath,
          },
        });
    }
  }

  async function handleDialogSave(data: {
    selectedImage: string | null;
    uploadedImage: FileWithPath | null;
    imageAltText: string | null;
    imageAttributions: string;
    displayAttributions: boolean;
  }) {
    if (data.selectedImage === null) {
      handleEmptyImage();
      return;
    }

    if (data.uploadedImage) {
      const res = await handleImageUpload(
        data.uploadedImage,
        data.imageAttributions,
        data.imageAltText,
      );
      updateImage(res.id.name, res.id.path, data.displayAttributions); // TODO: Fix these being under id, server side returned wrong
    }

    // Fetch selected pic
    const selected = images.find((img) => img.fileName === data.selectedImage);

    if (selected) {
      try {
        await fetch(`/api/file/${selected?.id}/details`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            attributions: data.imageAttributions,
            imageAltText: data.imageAltText,
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
      updateImage(
        selected.fileName,
        selected.filePath,
        data.displayAttributions,
      );
    }

    setImageDialogOpen(false);
  }

  async function handleImageUpload(
    uploadedImage: FileWithPath,
    imageAttributions: string,
    imageAltText: string | null,
  ) {
    const formData = new FormData();
    formData.append('file', uploadedImage);
    formData.append('attributions', imageAttributions);
    imageAltText && formData.append('imageAltText', imageAltText);

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
      <ImageListDialog
        imageType={imageType}
        open={imageDialogOpen}
        onClose={closeDialog}
        onSave={handleDialogSave}
        loadingImages={loadingImages}
        images={images}
        activeImage={activeImage}
        onDeleteImage={handleDeletingImage}
        initialDisplayAttributions={
          imageType === 'backgroundImage'
            ? activeSurvey.displayBackgroundAttributions
            : activeSurvey.displayThanksAttributions
        }
      />
    </div>
  );
}
