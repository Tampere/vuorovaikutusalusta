import React from 'react';
import { useState } from 'react';
import SurveyImageList from './SurveyImageList';
import { File } from '@interfaces/survey';

interface Props {
  canEdit?: boolean;
}

export function SurveyMarginImageList({ canEdit = true }: Props) {
  const [images, setImages] = useState<File[]>([]);

  return (
    <>
      <SurveyImageList
        imageType={'topMarginImage'}
        images={images}
        setImages={setImages}
        canEdit={canEdit}
      />
      <SurveyImageList
        imageType={'bottomMarginImage'}
        images={images}
        setImages={setImages}
        canEdit={canEdit}
      />
    </>
  );
}
