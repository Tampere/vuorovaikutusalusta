import React from 'react';
import { SurveyTextSection } from '@interfaces/survey';
import RichTextEditor from '../RichTextEditor';
import { useTranslations } from '@src/stores/TranslationContext';

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
  const { tr } = useTranslations();

  return (
    <RichTextEditor
      disabled={disabled}
      value={section.body}
      label={tr.EditTextSection.text}
      onChange={(value) => onChange({ ...section, body: value })}
    />
  );
}
