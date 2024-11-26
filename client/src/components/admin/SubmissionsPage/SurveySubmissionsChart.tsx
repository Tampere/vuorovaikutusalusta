import {
  AnswerEntry,
  Submission,
  Survey,
  SurveyQuestion,
} from '@interfaces/survey';
import { AnswerSelection } from '@src/components/admin/SubmissionsPage/AnswersList';
import React, { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

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

type Data = {
  id: number;
  options: {
    id: number;
    text: string;
    count: number;
  }[];
};

type Range = {
  min: number;
  max: number;
};

function buildNumericRange(range: Range, answersList: AnswerEntry[]): number[] {
  const maxBuckets = 12;
  const minBuckets = 5;

  const min = Math.floor(
    range.min ??
      (answersList.reduce(
        (min, answer) => ((answer.value as number) < min ? answer.value : min),
        null as number,
      ) as number),
  );
  const max = Math.ceil(
    range.max ??
      (answersList.reduce(
        (max, answer) => ((answer.value as number) > max ? answer.value : max),
        null as number,
      ) as number),
  );

  if (max - min <= maxBuckets && max - min > minBuckets) {
    const b = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    return b;
  }

  const calcBucketSize = (r: number, bucketSize: number) => {
    let bucketCount = Math.ceil(r / bucketSize);
    while (bucketCount < minBuckets) {
      bucketSize /= 2;
      bucketCount = Math.ceil(r / bucketSize);
    }
    while (bucketCount > maxBuckets) {
      bucketSize *= 2;
      bucketCount = Math.ceil(r / bucketSize);
    }
    return [bucketCount, bucketSize];
  };

  const [numOfBuckets, step] = calcBucketSize(
    max - min,
    Math.pow(10, Math.floor(Math.log10((max - min) / maxBuckets))),
  );
  const b = Array.from({ length: numOfBuckets }, (_, i) => min + step * i);
  return b;
}

export default function Chart({ submissions, selectedQuestion }: Props) {
  const answerData = useMemo(() => {
    if (!selectedQuestion) return;
    const questionAnswers = submissions
      .reduce(
        (answers, submission) => [...answers, ...submission.answerEntries],
        [] as AnswerEntry[],
      )
      .filter((answer) => answer.sectionId === selectedQuestion.id);
    if (!questionAnswers) return;

    let base;
    switch (selectedQuestion?.type) {
      case 'radio':
      case 'checkbox':
        base = {
          id: selectedQuestion.id,
          options: selectedQuestion.options.map((option) => {
            return {
              id: option.id,
              text: option.text['fi'],
              count: questionAnswers.reduce(
                (count, qa: AnswerEntry & { type: 'checkbox' | 'radio' }) => {
                  return qa.value === option.id ||
                    (Array.isArray(qa.value) && qa.value.includes(option.id))
                    ? count + 1
                    : count;
                },
                0,
              ),
            };
          }),
        };
        break;
      case 'numeric':
      case 'slider':
        base = {
          id: selectedQuestion.id,
          options: buildNumericRange(
            { min: selectedQuestion.minValue, max: selectedQuestion.maxValue },
            questionAnswers,
          ).map((bucket, _, buckets) => {
            return {
              id: bucket,
              text: `${bucket} ${
                buckets[1] - buckets[0] === 1
                  ? ''
                  : '\u2013 ' + (bucket + (buckets[1] - buckets[0]))
              }`,
              count: questionAnswers.reduce((count, qa) => {
                return (qa.value as number) >= bucket &&
                  (qa.value as number) < bucket + buckets[1] - buckets[0]
                  ? count + 1
                  : count;
              }, 0),
            };
          }),
        };
        break;
      default:
    }
    return base;
  }, [selectedQuestion]);

  return answerData ? (
    <div
      style={{
        position: 'absolute',
        backgroundColor: '#ffffffdd',
        borderBottomRightRadius: '7px',
      }}
    >
      <ResponsiveContainer width={600} height={320}>
        <BarChart
          data={answerData.options}
          margin={{
            top: 25,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="text" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#00A393" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  ) : (
    <></>
  );
}
