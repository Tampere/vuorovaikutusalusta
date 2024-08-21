import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { File } from '@interfaces/survey';
import { ImageListItem, CircularProgress } from '@mui/material';
import CancelIcon from '@src/components/icons/CancelIcon';
import { getFileName } from '@src/utils/path';

interface Props {
  image: File;
  src: string;
  altText: string;
  onClick: Function;
  onDelete: Function;
}

export default function SurveyImageListItem(props: Props) {
  const [status, setStatus] = useState<'notVisible' | 'loading' | 'visible'>(
    'notVisible',
  );
  const image = props.image;

  const imgContainer = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setStatus('loading');
        observer.disconnect();
      }
    });
    if (imgContainer?.current) observer.observe(imgContainer.current);
  }, []);

  return (
    <ImageListItem ref={imgContainer}>
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
      {status !== 'notVisible' && (
        <img
          src={props.src}
          srcSet={props.src}
          alt={props.altText || `survey-image-${getFileName(image.fileUrl)}`}
          loading="lazy"
          style={{
            height: '100%',
            objectFit: 'contain',
            visibility: status === 'loading' ? 'hidden' : 'visible',
            cursor: 'pointer',
          }}
          onLoad={() => {
            setStatus('done');
          }}
          onError={() => {
            setStatus('done');
          }}
          onClick={() => props.onClick(image.fileUrl)}
        />
      )}
      <span
        style={{
          position: 'absolute',
          height: '100%',
          width: '100%',
          display: status === 'loading' ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress style={{ color: '#00a393' }} />
      </span>
    </ImageListItem>
  );
}
