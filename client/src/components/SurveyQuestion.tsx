import {
  FileAnswer,
  MapQuestionAnswer,
  SurveyQuestion,
} from '@interfaces/survey';
import { FormControl, FormHelperText, FormLabel } from '@material-ui/core';
import { useSurveyAnswers } from '@src/stores/SurveyAnswerContext';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { useMemo, useState } from 'react';
import AttachmentQuestion from './AttachmentQuestion';
import CheckBoxQuestion from './CheckBoxQuestion';
import FreeTextQuestion from './FreeTextQuestion';
import GroupedCheckBoxQuestion from './GroupedCheckBoxQuestion';
import MapQuestion from './MapQuestion';
import MatrixQuestion from './MatrixQuestion';
import NumericQuestion from './NumericQuestion';
import RadioQuestion from './RadioQuestion';
import SectionInfo from './SectionInfo';
import SliderQuestion from './SliderQuestion';
import SortingQuestion from './SortingQuestion';

interface Props {
  question: SurveyQuestion;
}

export default function SurveyQuestion({ question }: Props) {
  const { answers, updateAnswer, getValidationErrors, survey } =
    useSurveyAnswers();
  const [dirty, setDirty] = useState(false);
  const { tr, surveyLanguage } = useTranslations();

  const value = useMemo(
    () => answers.find((answer) => answer.sectionId === question.id)?.value,
    [answers, question]
  );

  const validationErrors = useMemo(
    () => (dirty ? getValidationErrors(question) : []),
    [dirty, question, value]
  );

  return (
    <FormControl error={validationErrors.length > 0} style={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <FormLabel
          htmlFor={`${question.id}-input`}
          style={{ color: survey.sectionTitleColor ?? '#000000' }}
        >
          {question.title?.[surveyLanguage]} {question.isRequired && '*'}
        </FormLabel>
        {question.info && (
          <SectionInfo
            infoText={question.info?.[surveyLanguage]}
            subject={question.title?.[surveyLanguage]}
          />
        )}
      </div>

      {/* Radio question */}
      {question.type === 'radio' && (
        <RadioQuestion
          value={value as number | string}
          onChange={(value) => {
            updateAnswer({
              sectionId: question.id,
              type: question.type,
              value,
            });
          }}
          question={question}
          setDirty={setDirty}
        />
      )}
      {/* Checkbox question */}
      {question.type === 'checkbox' && (
        <CheckBoxQuestion
          value={value as (number | string)[]}
          onChange={(value) => {
            updateAnswer({
              sectionId: question.id,
              type: question.type,
              value,
            });
          }}
          question={question}
          setDirty={setDirty}
        />
      )}
      {/* Free text question */}
      {question.type === 'free-text' && (
        <FreeTextQuestion
          value={value as string}
          maxLength={question.maxLength}
          onChange={(value) => {
            updateAnswer({
              sectionId: question.id,
              type: question.type,
              value,
            });
          }}
          question={question}
          setDirty={setDirty}
        />
      )}
      {/* Numeric question */}
      {question.type === 'numeric' && (
        <NumericQuestion
          value={value as number}
          onChange={(value) => {
            updateAnswer({
              sectionId: question.id,
              type: question.type,
              value,
            });
          }}
          question={question}
          setDirty={setDirty}
        />
      )}
      {/* Map question */}
      {question.type === 'map' && (
        <MapQuestion
          value={value as MapQuestionAnswer[]}
          onChange={(value) => {
            updateAnswer({
              sectionId: question.id,
              type: question.type,
              value,
            });
          }}
          question={question}
          setDirty={setDirty}
        />
      )}
      {/* Sorting question */}
      {question.type === 'sorting' && (
        <SortingQuestion
          value={value as number[]}
          onChange={(value) => {
            updateAnswer({
              sectionId: question.id,
              type: question.type,
              value,
            });
          }}
          question={question}
          setDirty={setDirty}
        />
      )}
      {/* Slider question */}
      {question.type === 'slider' && (
        <SliderQuestion
          value={value as number}
          onChange={(value) => {
            updateAnswer({
              sectionId: question.id,
              type: question.type,
              value,
            });
          }}
          question={question}
          setDirty={setDirty}
        />
      )}
      {question.type === 'matrix' && (
        <MatrixQuestion
          value={value as string[]}
          onChange={(value) => {
            updateAnswer({
              sectionId: question.id,
              type: question.type,
              value,
            });
          }}
          question={question}
          setDirty={setDirty}
        />
      )}
      {question.type === 'grouped-checkbox' && (
        <GroupedCheckBoxQuestion
          value={value as number[]}
          onChange={(value) => {
            updateAnswer({
              sectionId: question.id,
              type: question.type,
              value,
            });
          }}
          question={question}
          setDirty={setDirty}
        />
      )}
      {question.type === 'attachment' && (
        <AttachmentQuestion
          value={value as FileAnswer[]}
          setDirty={setDirty}
          onChange={(value) =>
            updateAnswer({
              sectionId: question.id,
              type: question.type,
              value: value,
            })
          }
        />
      )}
      {/* Show the required error only for empty values (not when answer limits are broken in checkbox questions) */}
      {validationErrors.includes('required') && (
        <FormHelperText id={`${question.id}-required-text`}>
          {tr.SurveyQuestion.errorFieldIsRequired}
        </FormHelperText>
      )}
    </FormControl>
  );
}
