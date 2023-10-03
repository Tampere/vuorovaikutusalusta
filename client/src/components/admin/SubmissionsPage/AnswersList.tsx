import {
  AnswerEntry,
  Submission,
  SurveyQuestion as Question,
  SurveyMapQuestion,
} from '@interfaces/survey';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from '@mui/material';
import { KeyboardArrowDownSharp } from '@mui/icons-material';
import { useTranslations } from '@src/stores/TranslationContext';
import React from 'react';
import SurveyQuestion from '@src/components/SurveyQuestion';
import { format } from 'date-fns';

interface Props {
  answers: AnswerItem[];
  selectedQuestion: Question;
  selectedAnswer: AnswerSelection;
  setSelectedAnswer: (answer: AnswerSelection) => void;
  submissions: Submission[];
  surveyQuestions: Question[];
  surveyId: number;
  modifyAnswerCallback: () => void;
}

export interface AnswerSelection {
  submissionId: number;
  questionId: number;
  index: number;
}

export interface AnswerItem {
  submission: Submission;
  entry: AnswerEntry & { index?: number };
}

function isItemSelected(item: AnswerItem, selection: AnswerSelection) {
  return (
    selection &&
    item.submission.id === selection.submissionId &&
    item.entry.sectionId === selection.questionId &&
    item.entry.index === selection.index
  );
}

export default function AnswersList({
  answers,
  selectedQuestion,
  selectedAnswer,
  setSelectedAnswer,
  surveyQuestions,
}: Props) {
  const { tr } = useTranslations();

  return (
    <div style={{ margin: '0 -1rem' }}>
      {selectedQuestion &&
        answers.length > 0 &&
        answers.map((answer, index) => (
          <Accordion
            sx={{
              borderTop: '1px solid rgba(0, 0, 0, 0.15)',
              '&:first-of-type, &:last-child': { borderTop: 0 },
            }}
            elevation={0}
            key={index}
            expanded={isItemSelected(answer, selectedAnswer)}
            TransitionProps={{
              onEntered: (node) =>
                node.scrollIntoView({ behavior: 'smooth', block: 'end' }),
            }}
            onChange={(_event, isExpanded) => {
              if (isExpanded) {
                setSelectedAnswer({
                  submissionId: answer.submission.id,
                  questionId: answer.entry.sectionId,
                  index: answer.entry.index,
                });
              } else if (isItemSelected(answer, selectedAnswer)) {
                setSelectedAnswer(null);
              }
            }}
          >
            <AccordionSummary
              sx={{
                flexDirection: 'row-reverse',
                '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
                  transform: 'rotate(180deg)',
                },
                '&.MuiButtonBase-root': {
                  '&:hover': { backgroundColor: '#41BBFF33' },
                },

                '& .MuiAccordionSummary-content': {
                  margin: 0,
                },
              }}
              expandIcon={<KeyboardArrowDownSharp />}
            >
              <div style={{ flexGrow: 1 }}>
                <Typography
                  sx={{
                    fontWeight: isItemSelected(answer, selectedAnswer)
                      ? 700
                      : 400,
                  }}
                >
                  {tr.AnswersList.respondent.replace(
                    '{x}',
                    String(answer.submission.id),
                  )}
                  {answer.entry.index != null
                    ? `, ${tr.AnswersList.mapMarkingIndex.replace(
                        '{x}',
                        String(answer.entry.index + 1),
                      )}`.toLowerCase()
                    : ''}
                </Typography>
              </div>
              {(index === 0 ||
                answer.submission.id !== answers[index - 1].submission.id) && (
                <Typography style={{ color: '#797979' }}>
                  {format(answer.submission.timestamp, 'dd.MM.yyyy')}
                </Typography>
              )}
            </AccordionSummary>
            {isItemSelected(answer, selectedAnswer) && (
              <AccordionDetails
                sx={{ borderTop: 0, padding: '0 2rem 1rem 2rem' }}
              >
                {answer.entry.type === 'map' ? (
                  <>
                    {(answer.entry as AnswerEntry & { type: 'map' }).value.map(
                      (item) =>
                        item.subQuestionAnswers.map(
                          (subquestionAnswer, index) => (
                            <SurveyQuestion
                              pageUnfinished={false}
                              mobileDrawerOpen={false}
                              key={index}
                              readOnly
                              question={(
                                surveyQuestions.find(
                                  (question) =>
                                    question.id === answer.entry.sectionId,
                                ) as SurveyMapQuestion
                              )?.subQuestions?.find(
                                (subQuestion) =>
                                  subQuestion.id ===
                                  subquestionAnswer.sectionId,
                              )}
                              value={subquestionAnswer.value}
                            />
                          ),
                        ),
                    )}
                  </>
                ) : (
                  <SurveyQuestion
                    readOnly
                    pageUnfinished={false}
                    mobileDrawerOpen={false}
                    question={
                      selectedQuestion?.id === 0
                        ? surveyQuestions.find(
                            (question) =>
                              question.id === answer.entry.sectionId,
                          )
                        : selectedQuestion
                    }
                    submission={answer.submission}
                    value={answer.entry.value}
                  />
                )}
              </AccordionDetails>
            )}
          </Accordion>
        ))}
    </div>
  );
}
