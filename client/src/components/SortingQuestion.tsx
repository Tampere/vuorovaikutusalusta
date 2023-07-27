import { SurveySortingQuestion } from '@interfaces/survey';
import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Paper,
  Typography,
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { DragDropContext, Droppable, Draggable, DropResult, ResponderProvided } from 'react-beautiful-dnd';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { useEffect, useState } from 'react';
import { visuallyHidden } from '@mui/utils';

interface Props {
  value: number[];
  onChange: (value: number[]) => void;
  question: SurveySortingQuestion;
  setDirty: (dirty: boolean) => void;
}

export default function SortingQuestion(props: Props) {
  console.log(props);
  const { surveyLanguage, tr } = useTranslations();
  const [verified, setVerified] = useState(props.value ? true : false);
  const [sortedOptionIds, setSortedOptionIds] = useState(
    props.value ?? props.question.options.map( option => option.id )
  );

  useEffect(() => {
    if (!verified || !props.onChange) {
      props.onChange(null);
      return;
    }
    props.onChange(sortedOptionIds);
  }, [sortedOptionIds, verified]);

  const reorder = (list: Array<number>, startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const onDragEnd = (result: DropResult, provided: ResponderProvided):void => {
    const { destination, source } = result;
    if (!destination || destination.index === source.index) {
      provided.announce(tr.SortingQuestion.announcement.droppedInPlace
        .replace('{position}', (destination.index + 1).toString()));
      return;
    }
    provided.announce(tr.SortingQuestion.announcement.drop
      .replace('{position}', (destination.index + 1).toString())
    );
    setVerified(false);
    setSortedOptionIds(reorder(sortedOptionIds, source.index, destination.index));
  };

  return (
    <FormGroup id={`${props.question.id}-input`}>
      <Box style={visuallyHidden} id={`drag-instruction-announcement-${props.question.id}`}>
        {tr.SortingQuestion.announcement.focus}
      </Box>
      <DragDropContext
        onDragStart={(start, provided) => provided.announce(tr.SortingQuestion.announcement.grab
          .replace('{position}', (start.source.index + 1).toString())
        )}
        onDragUpdate={(update, provided) => provided.announce(tr.SortingQuestion.announcement.move
          .replace('{position}', (update.destination.index + 1).toString())
          .replace('{length}', props.question.options.length.toString())
        )}
        onDragEnd={onDragEnd}>
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
                      aria-describedby={`drag-instruction-announcement-${props.question.id}`}
                    >
                      <Typography color="primary">
                        { props.question.options.find( option => option.id === optionId ).text?.[surveyLanguage] }
                      </Typography>
                      <Box style={visuallyHidden}>{tr.SortingQuestion.inPosition} {index + 1} / {sortedOptionIds.length}</Box>
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
              checked={verified}
              onChange={(event) => {
                setVerified(event.target.checked); 
                props.setDirty(true);
              }}
            />
          }
          sx={{
            lineHeight: 1.2,
            marginBottom: '0.5em',
          }}
        />
      </DragDropContext>
    </FormGroup>
  );
}
