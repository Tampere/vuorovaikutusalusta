import { Submission } from '@interfaces/survey';
import {
  XAxis,
  YAxis,
  Bar,
  ResponsiveContainer,
  ComposedChart,
  Line,
  Label,
  Tooltip,
} from 'recharts';
import React from 'react';
import { format, getMonth, getWeek, parse } from 'date-fns';
import { Box, Skeleton, useTheme } from '@mui/material';
import { useTranslations } from '@src/stores/TranslationContext';

interface Props {
  submissions: Submission[];
  submissionsLoading: boolean;
}

const SCALE_THRESHOLD = 9;

const mockData: any[] = [];
for (let i = 0; i < 8; i++) {
  const date = format(
    new Date(new Date().valueOf() - ((10 - i) / 1000) * 1e12),
    'dd.MM.yyyy',
  );
  const submissionCount = Math.floor(Math.random() * 24);
  mockData.push({
    date: date,
    submissionCount: submissionCount,
    week: getWeek(parse(date, 'dd.MM.yyyy', new Date())),
    month: getMonth(parse(date, 'dd.MM.yyyy', new Date())),
    cumulativeCount:
      i === 0
        ? submissionCount
        : mockData[i - 1].cumulativeCount + submissionCount,
  });
}

function getDataByWeek(data: any[]) {
  return Object.values(
    data.reduce((dataByWeek, data) => {
      return {
        ...dataByWeek,
        [data.week]: dataByWeek[data.week]
          ? {
              ...dataByWeek[data.week],
              week: data.week,
              submissionCount:
                dataByWeek[data.week].submissionCount + data.submissionCount,
              cumulativeCount: Math.max(
                dataByWeek[data.week].cumulativeCount,
                data.cumulativeCount,
              ),
            }
          : {
              week: data.week,
              submissionCount: data.submissionCount,
              cumulativeCount: data.cumulativeCount,
            },
      };
    }, {}),
  ).map((val) => val);
}

export function DataChart({ submissions, submissionsLoading }: Props) {
  const theme = useTheme();
  const { tr } = useTranslations();

  if (submissionsLoading) {
    return <Skeleton variant="rectangular" height={'390'} />;
  }

  const submissionsData = Object.entries(
    submissions?.reduce(
      (data, submission) => {
        const timestamp = format(submission.timestamp, 'dd.MM.yyyy');

        return {
          ...data,
          [timestamp]: data?.[timestamp]
            ? [...data[timestamp], submission.id]
            : [submission.id],
        };
      },
      {} as Record<string, number[]>,
    ),
  )
    .map(([date, submissionIds]) => ({
      date: date,
      week: getWeek(parse(date, 'dd.MM.yyyy', new Date())),
      month: getMonth(parse(date, 'dd.MM.yyyy', new Date())),
      submissionCount: submissionIds.length,
    }))

    .reduce(
      (prev, current, index) => [
        ...prev,
        {
          ...current,
          cumulativeCount:
            index === 0
              ? current.submissionCount
              : current.submissionCount + prev[index - 1].cumulativeCount,
        },
      ],
      [],
    );

  const displayByWeek = submissionsData.length > SCALE_THRESHOLD;

  return (
    <Box
      style={{
        height: '390px',
        border: '1px solid #FF6B6B',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <ResponsiveContainer width="95%" height="95%">
        <ComposedChart
          style={{ fontWeight: 600 }}
          margin={{ bottom: 30 }}
          data={
            displayByWeek ? getDataByWeek(submissionsData) : submissionsData
          }
        >
          <XAxis
            dataKey={displayByWeek ? 'week' : 'date'}
            //tickFormatter={(val) => val.slice(0, -5)}
          >
            <Label
              value={
                displayByWeek
                  ? tr.SurveySubmissionsPage.dataChart.xAxisLabel.byWeek
                  : tr.SurveySubmissionsPage.dataChart.xAxisLabel.byDay
              }
              position="bottom"
            />
          </XAxis>
          <YAxis yAxisId="left">
            <Label
              angle={-90}
              value={
                displayByWeek
                  ? tr.SurveySubmissionsPage.dataChart.yAxisLabel.byWeek
                  : tr.SurveySubmissionsPage.dataChart.yAxisLabel.byDay
              }
              position="insideLeft"
              style={{ textAnchor: 'middle' }}
            />
          </YAxis>
          <YAxis yAxisId="right" orientation="right">
            <Label
              fontStyle="bold"
              angle={-90}
              value={tr.SurveySubmissionsPage.dataChart.yAxisTotalLabel}
              position="insideRight"
              style={{ textAnchor: 'middle' }}
            />
          </YAxis>
          <Tooltip
            formatter={(_val, name) => [
              _val,
              name === 'submissionCount'
                ? tr.SurveySubmissionsPage.dataChart.tooltipCurrent
                : tr.SurveySubmissionsPage.dataChart.tooltipTotal,
            ]}
          />
          <Bar
            yAxisId="left"
            dataKey="submissionCount"
            fill={theme.palette.primary.main}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dot={false}
            dataKey="cumulativeCount"
            fill={theme.palette.success.main}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  );
}
