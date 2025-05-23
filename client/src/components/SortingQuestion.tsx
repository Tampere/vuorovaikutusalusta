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
import { useTranslations } from '@src/stores/TranslationContext';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { visuallyHidden } from '@mui/utils';
import { DndWrapper, DragEndOptions } from './DragAndDrop/DndWrapper';
import { DragHandle } from './DragAndDrop/SortableItem';
import { UniqueIdentifier } from '@dnd-kit/core';

interface Props {
  value: number[];
  onChange: (value: number[]) => void;
  question: SurveySortingQuestion;
  setDirty: (dirty: boolean) => void;
  readOnly: boolean;
}

export default function SortingQuestion(props: Props) {
  const { surveyLanguage, tr } = useTranslations();
  const [verified, setVerified] = useState(props.value ? true : false);
  const [sortedOptionIds, setSortedOptionIds] = useState(
    props.value ?? props.question.options.map((option) => option.id),
  );
  const wrapperRef = useRef<HTMLDivElement>(null);
  const optionElements = useRef<HTMLElement[]>([]);
  const [optionIndexLabelHeights, setOptionIndexLabelHeights] = useState([]);

  useLayoutEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (optionElements.current.length > 0) {
        setOptionIndexLabelHeights(
          optionElements.current.map((el) => el.offsetHeight),
        );
      }
    });
    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current);
    }
  }, [wrapperRef.current]);

  useEffect(() => {
    if (!verified || !props.onChange) {
      props.onChange(null);
      return;
    }
    props.onChange(sortedOptionIds);
  }, [sortedOptionIds, verified]);

  /** Gets the announceable index of the current option  */
  function getOptionPositionString(optionId: UniqueIdentifier) {
    return String(
      sortedOptionIds.findIndex((id) => id === Number(optionId)) + 1,
    );
  }

  const onDragEnd = (opts: DragEndOptions) => {
    // Resize the index label heights array to match the new order
    if (optionElements.current.length > 0) {
      setOptionIndexLabelHeights((prev) => {
        const newHeights = [...prev];
        const [removed] = newHeights.splice(opts.oldIndex, 1);
        newHeights.splice(opts.newIndex, 0, removed);
        return newHeights;
      });
    }

    setVerified(false);

    setSortedOptionIds(opts.newItemOrder.map((item) => Number(item.id)));
  };

  return (
    <FormGroup id={`${props.question.id}-input`}>
      <div style={{ display: 'flex', flexDirection: 'row' }} ref={wrapperRef}>
        <div>
          {props.question.options.map((option, index) => (
            <Paper
              key={option.id}
              variant="outlined"
              sx={{
                height: optionIndexLabelHeights[index],
                backgroundColor: '#ededed',
                borderTopRightRadius: '0',
                borderBottomRightRadius: '0',
                borderRight: '0',
                marginBottom: '0.5em',
                padding: '0.5em',
                display: 'flex',
                alignItems: 'center',
                transition: 'height 0.1s',
              }}
            >
              <Typography>{index + 1}.</Typography>
            </Paper>
          ))}
        </div>
        <div style={{ flexGrow: 1 }}>
          <DndWrapper
            screenReaderInstructions={tr.SortingQuestion.announcement.focus}
            announcements={{
              onDragStart({ active }) {
                return tr.SortingQuestion.announcement.grab.replace(
                  '{position}',
                  getOptionPositionString(active.id),
                );
              },
              onDragOver({ over }) {
                if (over) {
                  return `${tr.SortingQuestion.announcement.move
                    .replace('{position}', getOptionPositionString(over.id))
                    .replace(
                      '{length}',
                      String(props.question.options.length),
                    )}`;
                }
              },
              onDragEnd({ over }) {
                if (over) {
                  return tr.SortingQuestion.announcement.drop.replace(
                    '{position}',
                    getOptionPositionString(over.id),
                  );
                }
              },
              onDragCancel({ active }) {
                return tr.SortingQuestion.announcement.droppedInPlace.replace(
                  '{position}',
                  getOptionPositionString(active.id),
                );
              },
            }}
            onDragEnd={(opts) => onDragEnd(opts)}
            sortableItems={sortedOptionIds.map((optionId, index) => ({
              id: String(optionId),
              renderElement: (isDragging) => (
                <Paper
                  ref={(el) => {
                    if (el) {
                      optionElements.current[index] = el;
                    }
                  }}
                  variant="outlined"
                  sx={{
                    height: optionIndexLabelHeights[index],
                    borderTopLeftRadius: '0',
                    borderBottomLeftRadius: '0',
                    backgroundColor: isDragging ? '#c2dcf1' : 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.5em',
                    padding: '0.5em',
                    transition: 'background-color 200ms',
                    '&:focus': {
                      outlineOffset: '2px',
                      outline: '2px solid black',
                    },
                  }}
                >
                  <Typography color={props.readOnly ? 'disabled' : 'primary'}>
                    {
                      props.question.options.find(
                        (option) => option.id === optionId,
                      ).text?.[surveyLanguage]
                    }
                  </Typography>
                  <Box style={visuallyHidden}>
                    {tr.SortingQuestion.inPosition} {index + 1} /{' '}
                    {sortedOptionIds.length}
                  </Box>
                  <DragHandle isDragging={isDragging}>
                    <DragIndicatorIcon color={isDragging ? 'info' : 'action'} />
                  </DragHandle>
                </Paper>
              ),
            }))}
          />
        </div>
      </div>
      <FormControlLabel
        label={tr.SortingQuestion.orderComplete}
        control={
          <Checkbox
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
    </FormGroup>
  );
}
