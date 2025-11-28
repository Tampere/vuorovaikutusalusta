import { File, ImageFile } from '@interfaces/survey';
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
  Typography,
  Box,
  Checkbox,
  Stack,
} from '@mui/material';
import { Cancel } from '@mui/icons-material';
import { useTranslations } from '@src/stores/TranslationContext';
import { useToasts } from '@src/stores/ToastContext';
import React, { useEffect, useState } from 'react';
import { FileWithPath, useDropzone } from 'react-dropzone';

type ImageType = 'backgroundImage' | 'thanksPageImage' | 'generalNotification';

const MEGAS = 10;
const MAX_FILE_SIZE = MEGAS * 1000 * 1000;

const styles = {
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
  deleteImageIcon: {
    position: 'absolute',
    top: '5px',
    left: '5px',
    fontSize: '26px',
  },
};

interface Props {
  imageType: ImageType;
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    selectedImage: string | null;
    uploadedImage: FileWithPath | null;
    imageAltText: string | null;
    imageAttributions: string;
    displayAttributions: boolean;
  }) => void;
  loadingImages: boolean;
  images: ImageFile[];
  activeImage: ImageFile | null;
  onDeleteImage: (
    event: React.MouseEvent,
    fileName: string,
    filePath: string[],
  ) => void;
  initialDisplayAttributions: boolean;
}

export default function ImageListDialog({
  imageType,
  open,
  onClose,
  onSave,
  loadingImages,
  images,
  activeImage,
  onDeleteImage,
  initialDisplayAttributions,
}: Props) {
  const { tr } = useTranslations();
  const { showToast } = useToasts();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<FileWithPath | null>(null);
  const [preview, setPreview] = useState<string | ArrayBuffer | null>(null);
  const [imageAltText, setImageAltText] = useState<string | null>(null);
  const [imageAttributions, setImageAttributions] = useState<string>('');
  const [displayAttributions, setDisplayAttributions] = useState(
    initialDisplayAttributions,
  );

  useEffect(() => {
    if (activeImage && open) {
      setSelectedImage(activeImage.fileName);
      setImageAltText(activeImage.altText);
      setImageAttributions(activeImage.attributions);
    }
  }, [activeImage, open]);

  useEffect(() => {
    setDisplayAttributions(initialDisplayAttributions);
  }, [initialDisplayAttributions]);

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

  const { fileRejections, getRootProps, getInputProps } = useDropzone({
    maxFiles: 1,
    validator: fileSizeValidator,
    onDrop: (acceptedFiles) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target.result);
      };
      reader.readAsDataURL(acceptedFiles[0]);
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

  const handleClose = () => {
    setUploadedImage(null);
    onClose();
  };

  const handleSave = () => {
    onSave({
      selectedImage,
      uploadedImage,
      imageAltText,
      imageAttributions,
      displayAttributions,
    });
  };

  const isSaveDisabled =
    activeImage &&
    selectedImage === activeImage.fileName &&
    activeImage.altText === imageAltText &&
    activeImage.attributions === imageAttributions &&
    initialDisplayAttributions === displayAttributions;

  function handleListItemClick(fileName?: string) {
    if (!fileName) {
      handleSelectedImageChange(null);
      return;
    }
    handleSelectedImageChange(fileName);
  }

  function getImageBorderStyle(image: File) {
    return image.fileName === selectedImage
      ? { border: '4px solid #1976d2' }
      : { border: '4px solid transparent' };
  }

  return (
    <Dialog onClose={handleClose} open={open}>
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
                sx={styles.noImageBackground}
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
                sx={{
                  ...styles.noImageBackground,
                  ...(selectedImage === null
                    ? { border: '4px solid #1976d2' }
                    : {}),
                }}
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
                  <img src={`${preview}`} style={{ height: '100%' }}></img>
                </ImageListItem>
              )}
              {images.map((image) => (
                <ImageListItem
                  style={getImageBorderStyle(image)}
                  key={image.fileName}
                  onClick={() => handleListItemClick(image.fileName)}
                >
                  <Cancel
                    color="error"
                    sx={styles.deleteImageIcon}
                    onClick={(event) =>
                      onDeleteImage(event, image.fileName, image.filePath)
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
      <Stack component="section" sx={styles.container}>
        {selectedImage && (
          <>
            <TextField
              id="outlined-alt-text"
              label={tr.EditImageSection.altText}
              value={imageAltText ?? ''}
              onChange={(event) => setImageAltText(event.target.value)}
              fullWidth
              sx={{ marginTop: 1, marginBottom: 1 }}
            />
            <TextField
              id="outlined-name"
              label={tr.SurveyImageList.attributions}
              value={imageAttributions ?? ''}
              onChange={(event) => setImageAttributions(event.target.value)}
              fullWidth
            />
            <Box
              alignItems={'center'}
              pt={1}
              alignSelf={'flex-start'}
              display={'flex'}
            >
              <Checkbox
                aria-label="display-attributions"
                value={displayAttributions}
                checked={displayAttributions}
                onChange={(e) => setDisplayAttributions(e.target.checked)}
              />
              {tr.EditSurvey.displayAttributions}
            </Box>
          </>
        )}
        <Box {...getRootProps({ className: 'dropzone' })}>
          <input {...getInputProps()} />
          <p style={{ color: 'purple', cursor: 'pointer' }}>
            {tr.DropZone.dropFiles.replace('{x}', MEGAS.toString())}
          </p>
        </Box>
        {uploadedImage && (
          <aside
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignSelf: 'flex-start',
              marginLeft: 2,
            }}
          >
            <Typography
              fontSize={'1rem'}
              mb="0.5rem"
              variant="subtitle2"
              component={'p'}
            >
              {tr.SurveyImageList.files}
            </Typography>
            {files}
          </aside>
        )}
      </Stack>
      <DialogActions>
        <Button onClick={handleClose} autoFocus>
          {tr.commands.cancel}
        </Button>
        <Button disabled={isSaveDisabled} onClick={handleSave}>
          {tr.commands.save}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
