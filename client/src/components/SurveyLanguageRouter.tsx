import { LanguageCode } from '@interfaces/survey';
import { useSurveyAnswers } from '@src/stores/SurveyAnswerContext';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}

export default function SurveyLanguageRouter(): null {
  const { language, setLanguage, languages, setSurveyLanguage } =
    useTranslations();
  const { survey } = useSurveyAnswers();

  const query = useQuery();
  const lang = query.get('lang') as LanguageCode;

  useEffect(() => {
    if (survey?.localisationEnabled && lang) setSurveyLanguage(lang);
    if (!languages.includes(lang) || lang === language) return;

    setLanguage(lang);
  }, [lang, survey]);

  return null;
}
