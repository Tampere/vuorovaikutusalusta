import React from 'react';
import { CardActionArea, ListItem, List, Typography, Box } from '@mui/material';
import {
  AttachFile,
  CheckBox,
  FormatListNumbered,
  LibraryAddCheck,
  LinearScale,
  Looks4,
  Map,
  RadioButtonChecked,
  TextFields,
  ViewComfy,
  ViewComfyAlt,
  ArrowForwardIosSharp,
} from '@mui/icons-material';
import { SurveyQuestion } from '@interfaces/survey';
import { useTranslations } from '@src/stores/TranslationContext';
import { assertNever } from '@src/utils/typeCheck';

interface Props {
  questions: SurveyQuestion[];
  handleClick: (question: SurveyQuestion) => void;
}

function getQuestionIcon(
  questionType: Exclude<SurveyQuestion['type'], 'text' | 'image' | 'document'>,
) {
  switch (questionType) {
    case 'checkbox':
      return <CheckBox color="primary" />;
    case 'radio':
      return <RadioButtonChecked color="primary" />;
    case 'numeric':
      return <Looks4 color="primary" />;
    case 'map':
      return <Map color="primary" />;
    case 'sorting':
      return <FormatListNumbered color="primary" />;
    case 'slider':
      return <LinearScale color="primary" />;
    case 'matrix':
      return <ViewComfy color="primary" />;
    case 'multi-matrix':
      return <ViewComfyAlt color="primary" />;
    case 'grouped-checkbox':
      return <LibraryAddCheck color="primary" />;
    case 'attachment':
      return <AttachFile color="primary" />;
    case 'free-text':
      return <TextFields color="primary" />;
    default:
      assertNever(questionType);
  }
}

export function PageQuestionList({ questions, handleClick }: Props) {
  const { surveyLanguage } = useTranslations();

  return (
    <>
      <List sx={{ margin: '0 -1rem' }}>
        {questions.map((question) => (
          <ListItem
            key={question.id}
            sx={{
              padding: 0,
            }}
          >
            <CardActionArea
              onClick={() => handleClick(question)}
              sx={{
                '&.MuiButtonBase-root': {
                  padding: '4px 1rem',
                  '&:hover': { backgroundColor: '#41BBFF33' },
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {getQuestionIcon(question.type)}
                  <Typography>{question.title[surveyLanguage]}</Typography>
                </Box>

                <ArrowForwardIosSharp sx={{ color: '#41BBFF' }} />
              </Box>
            </CardActionArea>
          </ListItem>
        ))}
      </List>
    </>
  );
}
