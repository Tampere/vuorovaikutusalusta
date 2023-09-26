import { useSurvey } from '@src/stores/SurveyContext';
import React from 'react';
import { AdminAppBar } from './AdminAppBar';
import { useTranslations } from '@src/stores/TranslationContext';

interface Props {
  sideBarWidth: number;
  onDrawerToggle: () => void;
}

export default function EditSurveyHeader(props: Props) {
  // Change title only on save?
  const { originalActiveSurvey } = useSurvey();
  const { surveyLanguage } = useTranslations();

  return (
    <AdminAppBar
      style={{
        width: { md: `calc(100% - ${props.sideBarWidth}px)` },
        ml: { md: `${props.sideBarWidth}px` },
      }}
      labels={[originalActiveSurvey.title[surveyLanguage]]}
      withHomeLink={false}
    />
  );
}
