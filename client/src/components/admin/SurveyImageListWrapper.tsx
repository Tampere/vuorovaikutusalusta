import React from 'react';
import { useState } from 'react';
import SurveyImageList from './SurveyImageList';
import { File } from '@interfaces/survey';

export function SurveyMarginImageList() {
  const [images, setImages] = useState<File[]>([]);

  return (
    <>
      <SurveyImageList
        imageType={'topMarginImage'}
        images={images}
        setImages={setImages}
      />
      <SurveyImageList
        imageType={'bottomMarginImage'}
        images={images}
        setImages={setImages}
      />
    </>
  );
}
