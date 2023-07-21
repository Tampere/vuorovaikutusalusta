import { SurveySortingQuestion } from '@interfaces/survey';
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  Paper,
  Typography,
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { useEffect, useState } from 'react';

interface Props {
  value: number[];
  onChange: (value: number[]) => void;
  question: SurveySortingQuestion;
  setDirty: (dirty: boolean) => void;
}

export default function SortingQuestion(props: Props) {
  const { surveyLanguage, tr } = useTranslations();
  const [sortedOptionIds, setSortedOptionIds] = useState(
    props.value ?? props.question.options.map( option => option.id )
  );

  useEffect(() => {
    if (!sortedOptionIds || !props.onChange) {
      return;
    }
    props.onChange(sortedOptionIds);
  }, [sortedOptionIds]);

  const reorder = (list: Array<number>, startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const onDragEnd = (result: DropResult):void => {
    const { destination, source } = result;
    if (!destination || destination.index === source.index) {
      return;
    }
    props.setDirty(true);
    setSortedOptionIds(reorder(sortedOptionIds, source.index, destination.index));
  };

  return (
    <FormGroup id={`${props.question.id}-input`}>
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <div>
          {props.question.options.map((_option, index) => (
            <Paper key={index}
              variant="outlined"
              sx={{
                backgroundColor: "#ededed",
                borderTopRightRadius: "0",
                borderBottomRightRadius: "0",
                marginBottom: "0.5em",
                marginRight: "-0.25em",
                padding: "0.5em",
              }}
            >
              <Typography>
                {index+1}.
              </Typography>
            </Paper>
          ))}
          </div>
          <Droppable droppableId={`question-dropzone-${props.question.id}`}>
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} style={{ flexGrow: 1 }}>
              {sortedOptionIds.map((optionId, index) => (
                <Draggable key={`option-${optionId}`} index={index} draggableId={`option-${optionId}`}>
                  {(provided) => (
                    <Paper
                      variant="outlined"
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "0.5em",
                        padding: "0.5em",}}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      ref={provided.innerRef}
                    >
                      <Typography color="primary">
                        { props.question.options.find( option => option.id === optionId ).text?.[surveyLanguage] }
                      </Typography>
                      <DragIndicatorIcon color="action" />
                    </Paper>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
        <FormControlLabel
          label={tr.SortingQuestion.orderComplete}
          control={
            <Checkbox
              // TS can't infer the precise memoized value type from question.type, but for checkboxes it's always an array
              name={`verify-order-question_${props.question.id}`}
            />
          }
          sx={{
            lineHeight: 1.2,
            marginBottom: '0.5em',
            marginTop: '1em',
          }}
        />
      </DragDropContext>
    </FormGroup>
  );
}
