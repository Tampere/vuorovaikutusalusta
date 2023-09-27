import {
  AnswerEntry,
  Submission,
  Survey,
  SurveyQuestion,
} from '@interfaces/survey';
import React, { useEffect, useMemo } from 'react';
import { AnswerSelection } from './AnswersList';
import OskariMap from './OskariMap';

interface Props {
  survey: Survey;
  submissions: Submission[];
  selectedQuestion: SurveyQuestion;
  onSelectQuestion: (question: SurveyQuestion) => void;
  onAnswerClick: (answer: AnswerSelection) => void;
  selectedAnswer: AnswerSelection;
  surveyQuestions: SurveyQuestion[];
  questions: SurveyQuestion[];
}

export default function AnswerMap({
  survey,
  submissions,
  selectedQuestion,
  onSelectQuestion,
  onAnswerClick,
  selectedAnswer,
  surveyQuestions,
  questions,
}: Props) {
  // All answer geometries that should be shown on the map
  const features = useMemo<GeoJSON.Feature[]>(() => {
    // If no map question was selected OR if the selected question was not "select all", show nothing on the map
    if (!(selectedQuestion?.id === 0 || selectedQuestion?.type === 'map')) {
      return [];
    }

    return (
      submissions
        // Reduce all submissions into one array of features
        .reduce((features, submission) => {
          return [
            ...features,
            ...submission.answerEntries
              // Filter answer entries that are not for the current question
              // Current question is not selected, filter away answers that are not map answers
              .filter(
                (answer): answer is AnswerEntry & { type: 'map' } =>
                  (selectedQuestion.id === 0
                    ? answer.type === 'map'
                    : answer.sectionId === selectedQuestion.id) &&
                  Boolean(answer.value),
              )

              // Reduce answer's values into a single array of features
              .reduce((features, answer) => {
                const question =
                  selectedQuestion?.id === 0
                    ? surveyQuestions.find(
                        (question) => question.id === answer.sectionId,
                      )
                    : selectedQuestion;

                return [
                  ...features,
                  ...answer.value.map((value, index) => {
                    return {
                      id: `feature-${question.id}-${index}-${submission.id}`,
                      type: 'Feature',
                      geometry: value.geometry.geometry,
                      properties: {
                        question: question,
                        submissionId: submission.id,
                        index,
                        selected:
                          selectedAnswer &&
                          selectedAnswer.submissionId === submission.id &&
                          selectedAnswer.questionId === question.id &&
                          selectedAnswer.index === index,
                      },
                    } as GeoJSON.Feature;
                  }),
                ];
              }, []),
          ];
        }, [] as GeoJSON.Feature[])
    );
  }, [selectedQuestion, selectedAnswer]);

  // Select to show all questions by default
  useEffect(() => {
    if (selectedQuestion || !questions?.[0]) {
      return;
    }
    onSelectQuestion(questions[0]);
  }, [questions]);

  // Update layers if the question changes (get it from the page)
  const layers = useMemo(() => {
    if (!survey || !selectedQuestion) {
      return [];
    }
    const mapQuestion = questions.find((question) => question.type === 'map');
    if (!mapQuestion) return [];
    // If all answers are currently shown, find the first map question to determine shown map layers
    const page = survey.pages.find((page) =>
      page.sections.some(
        (section) =>
          section.id ===
          (selectedQuestion.id === 0 ? mapQuestion.id : selectedQuestion.id),
      ),
    );
    return page.sidebar.mapLayers;
  }, [selectedQuestion, survey]);

  return (
    <>
      <OskariMap
        url={survey.mapUrl}
        layers={layers}
        features={features}
        onFeatureClick={(feature) => {
          const { submissionId, question, index } = feature.properties;
          onAnswerClick({ submissionId, questionId: question.id, index });
        }}
        selectedAnswer={selectedAnswer}
      />
    </>
  );
}
