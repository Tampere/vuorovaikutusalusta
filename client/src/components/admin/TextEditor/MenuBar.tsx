import {
  FormatListBulleted,
  FormatListNumbered,
  Image,
} from '@mui/icons-material';
import {
  Box,
  Button,
  IconButton,
  SxProps,
  Theme,
  Tooltip,
} from '@mui/material';
import { useToasts } from '@src/stores/ToastContext';
import { useTranslations } from '@src/stores/TranslationContext';

import { Editor, useEditorState } from '@tiptap/react';
import { useEffect, useState } from 'react';

import React from 'react';
import ImageListDialog from '../ImageListDialog';
import { FileWithPath } from 'react-dropzone/.';
import { request } from '@src/utils/request';
import { ImageFile } from '@interfaces/survey';

const menuBarStyle: SxProps<Theme> = {
  backgroundColor: 'rgb(227, 227, 227)',
  height: '24px',
  display: 'flex',
  '& .MuiButtonBase-root': {
    textTransform: 'capitalize',
    color: '#212121',
    fontSize: '12px',
    fontWeight: 400,
    border: '0.5px solid #c4c4c4',
    borderRadius: 0,
    '&.is-active': {
      backgroundColor: 'primary.main',
      color: 'white',
    },
  },
};

interface Props {
  editor: Editor | null;
  imageApiPath?: string;
}

export function MenuBar({
  editor,
  imageApiPath = '/api/file/general-notifications',
}: Props) {
  const { tr } = useTranslations();
  const { showToast } = useToasts();
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);
  const [images, setImages] = useState<ImageFile[]>([]);

  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => {
      if (!editor) return null;

      return {
        isBold: editor.isActive('bold'),
      };
    },
  });

  useEffect(() => {
    getImages();
  }, []);

  if (!editor) {
    return null;
  }

  async function uploadImage(data: {
    uploadedImage: FileWithPath;
    imageAltText: string | null;
    imageAttributions: string;
  }): Promise<string> {
    const formData = new FormData();
    formData.append('file', data.uploadedImage);

    if (data.imageAttributions)
      formData.append('attributions', data.imageAttributions);
    if (data.imageAltText) formData.append('imageAltText', data.imageAltText);

    const res = await fetch(imageApiPath, {
      method: 'POST',
      body: formData,
    });
    const response = await res.json();
    return response.id.name;
  }

  async function addImage(data: {
    selectedImage: string | null;
    uploadedImage: FileWithPath | null;
    imageAltText: string | null;
    imageAttributions: string;
    displayAttributions: boolean;
  }) {
    if (!data.uploadedImage && !data.selectedImage) return;

    try {
      const name = data.uploadedImage
        ? await uploadImage(data)
        : data.selectedImage;

      const fileUrl = `${imageApiPath}/${name}`;
      const altText = data.imageAltText || name;
      const markdownFigure = `![${altText}](${fileUrl})${
        data.displayAttributions && data.imageAttributions
          ? `\n\n*${data.imageAttributions}*`
          : ''
      }`;

      editor
        ?.chain()
        .focus()
        .insertContent(markdownFigure, { contentType: 'markdown' })
        .run();
    } catch {
      showToast({
        severity: 'error',
        message: tr.FileUpload.errorUploadingFile,
      });
      return;
    }

    setImageDialogOpen(false);
  }

  async function getImages() {
    setLoadingImages(true);
    try {
      const res = await request<ImageFile[]>(
        `/api/file/general-notifications?compressed=true`,
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

  function closeDialog() {
    setImageDialogOpen(false);
  }

  return (
    <Box sx={menuBarStyle}>
      <Button
        style={{
          borderTopLeftRadius: '4px',
        }}
        disableTouchRipple
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
      >
        {tr.TextEditor.headerTitle}
      </Button>
      <Button
        disableTouchRipple
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={editorState.isBold ? 'is-active' : ''} //
      >
        {tr.TextEditor.boldTitle}
      </Button>
      <Tooltip title={tr.TextEditor.unorderedListTitle}>
        <IconButton
          disableTouchRipple
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
        >
          <FormatListBulleted />
        </IconButton>
      </Tooltip>
      <Tooltip title={tr.TextEditor.orderedListTitle}>
        <IconButton
          disableTouchRipple
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'is-active' : ''}
        >
          <FormatListNumbered />
        </IconButton>
      </Tooltip>
      <Tooltip title={tr.TextEditor.addPicture}>
        <IconButton
          disableTouchRipple
          onClick={() => setImageDialogOpen(true)}
          className={editor.isActive('includeImage') ? 'is-active' : ''}
        >
          <Image />
        </IconButton>
      </Tooltip>
      <ImageListDialog
        imageType={'generalNotification'}
        open={imageDialogOpen}
        onClose={closeDialog}
        onSave={addImage}
        activeImage={undefined}
        loadingImages={loadingImages}
        images={images}
        onDeleteImage={handleDeletingImage}
        initialDisplayAttributions={false}
      />
    </Box>
  );
}
