import React from 'react';
import { useState } from 'react';
import { File } from '@interfaces/survey';
import { ImageListItem, CircularProgress } from '@mui/material';
import CancelIcon from '@src/components/icons/CancelIcon';
import { getFileName } from '@src/utils/path';

interface Props {
  image: File;
  altText: string;
  limitToSvg?: boolean;
  onClick: Function;
  onDelete: Function;
}

export default function SurveyImageListItem(props: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const image = props.image;
  const imageSrc = `data:image/${props.limitToSvg ? 'svg+xml' : ''};base64,${image.data}`;

  return (
    <ImageListItem>
      <CancelIcon
        color="error"
        style={{
          position: 'absolute',
          top: '5px',
          left: '5px',
          fontSize: '26px',
        }}
        onClick={async (event: MouseEvent) =>
          await props.onDelete(event, image.fileUrl)
        }
      />
      <img
        src={imageSrc}
        srcSet={imageSrc}
        alt={props.altText || `survey-image-${getFileName(image.fileUrl)}`}
        loading="lazy"
        style={{
          height: '100%',
          objectFit: 'contain',
          visibility: isLoading ? 'hidden' : 'visible',
          cursor: 'pointer',
        }}
        onLoad={() => {
          setIsLoading(false);
        }}
        onClick={() => props.onClick(image.fileUrl)}
      />
      <span
        style={{
          position: 'absolute',
          height: '100%',
          width: '100%',
          display: isLoading ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress style={{ color: '#00a393' }} />
      </span>
    </ImageListItem>
  );
}
