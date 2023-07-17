import {
  FileAnswer,
  MapQuestionAnswer,
  SurveyQuestion,
} from '@interfaces/survey';
import { FormControl, FormHelperText, FormLabel } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { useSurveyAnswers } from '@src/stores/SurveyAnswerContext';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { useMemo, useState, forwardRef } from 'react';
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
  pageUnfinished: boolean;
}

function SurveyQuestion(
  { question, pageUnfinished }: Props,
  ref: React.Ref<HTMLParagraphElement>
) {
  const { answers, updateAnswer, getValidationErrors, survey } =
    useSurveyAnswers();
  const { tr, surveyLanguage } = useTranslations();
  const [dirty, setDirty] = useState(false);

  const value = useMemo(
    () => answers.find((answer) => answer.sectionId === question.id)?.value,
    [answers, question]
  );

  const validationErrors = useMemo(
    () => (dirty || pageUnfinished ? getValidationErrors(question) : []),
    [dirty, question, value, pageUnfinished]
  );

  return (
    <FormControl
      component="fieldset"
      aria-label={question.title?.[surveyLanguage]}
      aria-invalid={validationErrors.includes('required')}
      error={validationErrors.length > 0}
      style={{ width: '100%' }}
      onBlur={(e: React.FocusEvent<HTMLFieldSetElement>) => {
        if (
          e.relatedTarget &&
          !e.currentTarget.contains(e.relatedTarget as Node)
        ) {
          setDirty(true);
        }
      }}
    >
      {/* Show the required error only for empty values (not when answer limits are broken in checkbox questions) */}
      {validationErrors.includes('required') && (
        <div>
          <FormHelperText
            aria-live="assertive"
            ref={ref}
            id={`${question.id}-required-text`}
            sx={{ marginLeft: 0 }}
          >
            {tr.SurveyQuestion.errorFieldIsRequired}
          </FormHelperText>
          <FormHelperText style={visuallyHidden} role="alert">
            {tr.SurveyQuestion.accessibilityTooltip}{' '}
            {question.title?.[surveyLanguage]}
          </FormHelperText>
        </div>
      )}
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
          <h3 tabIndex={0}>
            {question.title?.[surveyLanguage]}
            <span aria-hidden="true"> </span>
            {question.isRequired && <span aria-hidden="true">*</span>}
          </h3>
        </FormLabel>
        {question.info && question.info?.[surveyLanguage] && (
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
          validationErrors={validationErrors}
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
          question={question}
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
    </FormControl>
  );
}

export default forwardRef(SurveyQuestion);
