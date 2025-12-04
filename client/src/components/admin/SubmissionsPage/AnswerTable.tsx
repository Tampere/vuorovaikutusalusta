import { Submission } from '@interfaces/survey';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import React, { useMemo } from 'react';
import { useTranslations } from '@src/stores/TranslationContext';
import { format } from 'date-fns';

interface Props {
  submissions: Submission[];
}

export function AnswerTable({ submissions }: Props) {
  const { tr } = useTranslations();

  const freeTextAnswers = useMemo(() => {
    if (!submissions) return [];

    return submissions.flatMap(
      (submission) =>
        submission.answerEntries
          ?.filter((entry) => entry.type === 'free-text')
          .map((entry) => ({
            submissionId: submission.id,
            timestamp: submission.timestamp,
            sectionId: entry.sectionId,
            value: entry.value,
          })) || [],
    );
  }, [submissions]);

  if (!freeTextAnswers.length) {
    return null;
  }

  return (
    <TableContainer component={Paper} sx={{ marginTop: 2 }}>
      <Table sx={{ '& td, & th': { fontSize: '1rem' } }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 500 }}>
              {tr.AnswersList.respondent.replace('{x}', '')}
            </TableCell>
            <TableCell sx={{ fontWeight: 500 }}>
              {tr.SurveySubmissionsPage.date}
            </TableCell>

            <TableCell sx={{ fontWeight: 500 }}>
              {tr.MapInfoBox.answer}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {freeTextAnswers.map((answer, index) => (
            <TableRow
              key={`${answer.submissionId}-${answer.sectionId}-${index}`}
            >
              <TableCell sx={{ fontWeight: 400 }}>
                {answer.submissionId}
              </TableCell>
              <TableCell sx={{ fontWeight: 400, color: '#797979' }}>
                {format(answer.timestamp, 'd.MM.yyyy')}
              </TableCell>

              <TableCell sx={{ fontWeight: 400 }}>{answer.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
