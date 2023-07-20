import { SurveySortingQuestion } from '@interfaces/survey';
import {
  Card,
  CardContent,
  FormGroup,
  Typography,
} from '@mui/material';
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
  const { surveyLanguage } = useTranslations();
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
        <Droppable droppableId={`question-dropzone-${props.question.id}`}>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} style={{ flexGrow: 1 }}>
            {sortedOptionIds.map((optionId, index) => (
              <Draggable key={`option-${optionId}`} index={index} draggableId={`option-${optionId}`}>
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
                        { props.question.options.find( option => option.id === optionId ).text?.[surveyLanguage] }
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
