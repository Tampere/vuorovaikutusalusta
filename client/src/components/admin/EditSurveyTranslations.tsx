import React from 'react';
import { useParams } from 'react-router-dom';

export default function EditSurveyTranslations() {
  const { surveyId } = useParams<{ surveyId: string }>();
  return <p>TODO käännökset, kyselyn ID: {surveyId}</p>;
}
