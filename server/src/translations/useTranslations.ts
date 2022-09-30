import fi from './fi.json';
import en from './en.json';
import { LanguageCode } from '@interfaces/survey';

export default function useTranslations(lang: LanguageCode) {
  if (lang === 'fi') return fi;
  if (lang === 'en') return en;
}
