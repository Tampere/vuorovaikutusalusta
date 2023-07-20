import { SurveySortingQuestion } from '@interfaces/survey';
import {
  Card,
  CardContent,
  FormGroup,
  Typography,
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { useEffect, useState } from 'react';

interface Props {
  value: number[];
  onChange: (value: number[]) => void;
  question: SurveySortingQuestion;
  setDirty: (dirty: boolean) => void;
}

export default function SortingQuestion(props: Props) {
  const { surveyLanguage } = useTranslations();
  const [sortedOptionIds] = useState(
    props.value ?? new Array(props.question.options.length).fill(null)
  );

  useEffect(() => {
    if (!sortedOptionIds || !props.onChange) {
      return;
    }
    props.onChange(sortedOptionIds);
  }, [sortedOptionIds]);

  const onDragEnd = ():void => {
    return;
  };

  return (
    <FormGroup
      id={`${props.question.id}-input`}
      style={{ display: 'flex', flexDirection: 'row' }}
    >
      <DragDropContext
        onDragEnd={onDragEnd}
      >
        <div>
        {props.question.options.map((_option, index) => (
          <Card key={index}
            variant="outlined"
            sx={{
              marginBottom: "0.5em",
              borderTopRightRadius: "0",
              borderBottomRightRadius: "0",
              marginRight: "-0.25em",
              backgroundColor: "#ededed",
            }}
          >
            <CardContent sx={{padding: "0.5em", ":last-child": {paddingBottom: "0.5em"}}}>
              <Typography>
                {index+1}.
              </Typography>
            </CardContent>
          </Card>
        ))}
        </div>
        <Droppable droppableId={props.question.id.toString()}>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} style={{ flexGrow: 1 }}>
            {props.question.options.map((option, index) => (
              <Draggable key={index} index={index} draggableId={option.id.toString()}>
                {(provided) => (
                  <Card
                    variant="outlined"
                    sx={{marginBottom: "0.5em"}}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                  >
                    <CardContent sx={{padding: "0.5em", ":last-child": {paddingBottom: "0.5em"}}}>
                      <Typography>
                        {option.text[surveyLanguage]}
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            </div>
          )}
          
        </Droppable>
        
      </DragDropContext>
      
    </FormGroup>
  );
}
