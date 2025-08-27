import { SectionOption } from '@interfaces/survey';
import {
  Box,
  Fab,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Add, Delete, DragIndicator } from '@mui/icons-material';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { createRef, useEffect, useMemo } from 'react';
import OptionInfoDialog from './OptionInfoDialog';
import { DndWrapper } from '../DragAndDrop/DndWrapper';
import { DragHandle } from '../DragAndDrop/SortableItem';

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
  },
  option: {
    alignItems: 'center',
    background: 'rgba(0,0,0,0.2)',
    padding: '1rem 0.5rem',
    boxSizing: 'border-box',
  },
  textInput: {
    flexGrow: 1,
  },
};

export function generateDraftId() {
  return Math.random().toString(36);
}

interface Props {
  options: SectionOption[];
  disabled?: boolean;
  onChange: (options: SectionOption[]) => void;
  title: string;
  enableClipboardImport?: boolean;
  allowOptionInfo?: boolean;
}

export default function QuestionOptions({
  options,
  disabled,
  onChange,
  title,
  enableClipboardImport = false,
  allowOptionInfo = false,
}: Props) {
  const { tr, surveyLanguage, initializeLocalizedObject } = useTranslations();

  // Array of references to the option input elements
  const inputRefs = useMemo(
    () =>
      Array(options.length)
        .fill(null)
        .map(() => createRef<HTMLInputElement>()),
    [options.length],
  );

  // Whenever input element count changes, focus on the last one
  useEffect(() => {
    const lastElement = inputRefs[inputRefs.length - 1]?.current;
    lastElement?.focus();
  }, [inputRefs.length]);

  function handleClipboardInput(
    optionValue: string,
    optionIndex: number,
    optionToChange: SectionOption,
  ) {
    console.log(optionValue);
    const clipboardRows = optionValue.split(/(?!\B"[^"]*)\n(?![^"]*"\B)/);
    const optionFields = clipboardRows
      .map((row, index): SectionOption => {
        const optionFields = row.split('\t');
        let optionInfo = optionFields?.[1] ?? '';
        if (optionInfo.charAt(0) === '"') {
          optionInfo = optionInfo.slice(1, optionInfo.length);
        }
        if (optionInfo.charAt(optionInfo.length - 1) === '"') {
          optionInfo = optionInfo.slice(0, optionInfo.length - 1);
        }
        if (
          ![1, 2].includes(optionFields.length) ||
          (clipboardRows.length > 1 && optionFields[0] === '')
        )
          return null;
        console.log(optionFields);
        return {
          draftId: index > 0 ? generateDraftId() : optionToChange.draftId,
          text: {
            ...(index === 0
              ? optionToChange.text
              : initializeLocalizedObject(null)),
            [surveyLanguage]: optionFields[0],
          },
          ...(allowOptionInfo
            ? {
                info: {
                  ...initializeLocalizedObject(null),
                  [surveyLanguage]: optionInfo,
                },
              }
            : {}),
        };
      })
      .filter((option) => option);

    if (!optionFields || !optionFields.length) return;
    // First add option for the empty option field where focus is currently
    const updatedOptions = options.map((option, i) =>
      optionIndex === i ? optionFields[0] : option,
    );
    // Add other fields
    const newOptions = optionFields.slice(1, optionFields.length);
    onChange([...updatedOptions, ...newOptions]);
  }

  return (
    <Box sx={styles.wrapper}>
      <Box sx={styles.row}>
        <Fab
          color="primary"
          disabled={disabled}
          aria-label="add-question-option"
          size="small"
          onClick={() => {
            onChange([
              ...options,
              {
                text: initializeLocalizedObject(''),
                draftId: generateDraftId(),
              },
            ]);
          }}
        >
          <Add />
        </Fab>
        <Typography style={{ paddingLeft: '1rem' }}>{title}</Typography>
      </Box>
      <div>
        <DndWrapper
          onDragEnd={(dragOptions) => {
            onChange(
              dragOptions.newItemOrder.map((item) =>
                options.find(
                  (option) =>
                    String(option?.id) === item.id ||
                    option.draftId === item.id,
                ),
              ),
            );
          }}
          sortableItems={options.map((option, index) => ({
            id: String(option?.id ?? option.draftId),
            renderElement: (isDragging) => (
              <Box sx={{ ...styles.row, ...styles.option }}>
                <DragHandle isDragging={isDragging}>
                  <DragIndicator />
                </DragHandle>
                <Box sx={styles.textInput}>
                  <TextField
                    multiline
                    inputRef={inputRefs[index]}
                    style={{ width: '100%' }}
                    variant="standard"
                    disabled={disabled}
                    size="small"
                    value={option.text?.[surveyLanguage] ?? ''}
                    onChange={(event) => {
                      // Only allow copying from clipboard if
                      // 1) feature is enabled
                      // 2) the copied fields' format is correct
                      // 3) clipboard is pasted on the last option field
                      if (
                        enableClipboardImport &&
                        index + 1 === options.length
                      ) {
                        handleClipboardInput(event.target.value, index, option);
                      } else {
                        onChange(
                          options.map((option, i) => {
                            return index === i
                              ? {
                                  ...option,
                                  draftId: option.draftId,
                                  text: {
                                    ...option.text,
                                    [surveyLanguage]: event.target.value,
                                  },
                                }
                              : option;
                          }),
                        );
                      }
                    }}
                    onKeyDown={(event) => {
                      if (
                        ['Enter', 'NumpadEnter'].includes(
                          event.nativeEvent.code,
                        )
                      ) {
                        event.preventDefault();
                        if (index === options.length - 1) {
                          // Last item on list - add new option
                          onChange([
                            ...options,
                            {
                              text: initializeLocalizedObject(''),
                              draftId: generateDraftId(),
                            },
                          ]);
                        } else {
                          // Focus on the next item
                          inputRefs[index + 1].current.focus();
                        }
                      }
                    }}
                  />
                </Box>
                {allowOptionInfo && (
                  <OptionInfoDialog
                    infoText={option?.info?.[surveyLanguage]}
                    onChangeOptionInfo={(newInfoText) => {
                      onChange(
                        options.map((option, i) =>
                          index === i
                            ? {
                                ...option,
                                info: {
                                  ...option.info,
                                  [surveyLanguage]: newInfoText,
                                },
                              }
                            : option,
                        ),
                      );
                    }}
                  />
                )}
                <Tooltip title={tr.SurveySections.removeOption}>
                  <span>
                    <IconButton
                      aria-label="delete"
                      disabled={disabled}
                      size="small"
                      onClick={() => {
                        onChange(options.filter((_, i) => index !== i));
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            ),
          }))}
        />
      </div>
    </Box>
  );
}
