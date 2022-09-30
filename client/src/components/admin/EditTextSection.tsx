import React from 'react';
import { SurveyTextSection } from '@interfaces/survey';
import RichTextEditor from '../RichTextEditor';
import { useTranslations } from '@src/stores/TranslationContext';
import ColorSelect from './ColorSelect';

interface Props {
  section: SurveyTextSection;
  disabled?: boolean;
  onChange: (section: SurveyTextSection) => void;
}

export default function EditTextSection({
  section,
  disabled,
  onChange,
}: Props) {
  const { tr, language } = useTranslations();

  return (
    <>
      <ColorSelect
        label={tr.EditTextSection.bodyColor}
        value={section.bodyColor}
        onChange={(color) => {
          onChange({ ...section, bodyColor: color });
        }}
      />
      <RichTextEditor
        disabled={disabled}
        value={section.body[language]}
        label={tr.EditTextSection.text}
        onChange={(value) =>
          onChange({ ...section, body: { ...section.body, [language]: value } })
        }
      />
    </>
  );
}
