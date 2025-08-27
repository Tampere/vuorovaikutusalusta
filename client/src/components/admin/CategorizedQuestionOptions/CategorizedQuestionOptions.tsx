import { SectionOption, SectionOptionCategoryGroup } from '@interfaces/survey';
import {
  Add,
  Delete,
  DragIndicator,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Fab,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { useState } from 'react';
import { createRef, useEffect, useMemo } from 'react';
import { DndWrapper } from '../../DragAndDrop/DndWrapper';
import OptionInfoDialog from '../OptionInfoDialog';
import { DragHandle } from '../../DragAndDrop/SortableItem';
import { OptionCategoriesSelect } from './OptionCategoriesSelect';
import { theme } from '@src/themes/admin';

const fontSize = '0.875rem';
const optionRowBackground = 'rgba(0,0,0,0.1)';

// DragHandle width + flex gap of optionRowInput
const secondOptionRowOffset = `calc(32px + ${theme.spacing(0.5)})`;

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
  optionRowRoot: {
    background: optionRowBackground,
    borderRadius: theme.spacing(0.5),
    paddingY: theme.spacing(1),
    gap: theme.spacing(0.5),
  },
  optionRowInput: {
    display: 'flex',
    alignItems: 'center',
    paddingY: theme.spacing(0.5),
    gap: theme.spacing(0.5),
  },

  textInput: {
    flex: 1,
    border: 'none',
    borderRadius: theme.spacing(0.5),
    lineHeight: '1.75',
    '& textarea': {
      fontSize,
    },
  },
};

interface CategorizedOptionProps extends Omit<Props, 'title'> {
  isDragging: boolean;
  inputRefs: React.RefObject<HTMLInputElement>[];
  index: number;
  option: SectionOption;
  handleClipboardInput: (
    value: string,
    index: number,
    option: SectionOption,
  ) => void;
  allowOptionInfo?: boolean;
}

function CategorizedOption({
  isDragging,
  inputRefs,
  index,
  disabled,
  option,
  options,
  handleClipboardInput,
  enableClipboardImport,
  onChange,
  allowOptionInfo,
  optionCategoryGroups,
}: CategorizedOptionProps) {
  const { tr, surveyLanguage, initializeLocalizedObject } = useTranslations();
  const [displayGroups, setDisplayGroup] = useState(false);
  return (
    <Stack sx={styles.optionRowRoot}>
      <Box sx={styles.optionRowInput}>
        <DragHandle isDragging={isDragging}>
          <DragIndicator />
        </DragHandle>

        <TextField
          multiline
          variant="standard"
          inputRef={inputRefs[index]}
          sx={styles.textInput}
          autoComplete="off"
          data-1p-ignore
          disabled={disabled}
          value={option.text?.[surveyLanguage] ?? ''}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value;
            console.log(JSON.stringify(value));
            // Only allow copying from clipboard if
            // 1) feature is enabled
            // 2) the copied fields' format is correct
            // 3) clipboard is pasted on the last option field
            if (enableClipboardImport && index + 1 === options.length) {
              handleClipboardInput(value, index, option);
            } else {
              onChange(
                options.map((option, i) => {
                  return index === i
                    ? {
                        ...option,
                        draftId: option.draftId,
                        text: {
                          ...option.text,
                          [surveyLanguage]: value,
                        },
                      }
                    : option;
                }),
              );
            }
          }}
          onKeyDown={(event) => {
            if (['Enter', 'NumpadEnter'].includes(event.nativeEvent.code)) {
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
              aria-label={tr.SurveySections.removeOption}
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
      <Box
        display="flex"
        sx={{
          paddingLeft: secondOptionRowOffset,
          gap: 1,
          minHeight: '2rem',
          alignItems: 'center',
        }}
      >
        {option.categories &&
          option.categories.map((category) => (
            <Chip label={category.name[surveyLanguage]} key={category.id} />
          ))}

        <Button
          onClick={() => {
            setDisplayGroup((prev) => !prev);
          }}
          sx={{ marginLeft: 'auto' }}
          endIcon={displayGroups ? <ExpandLess /> : <ExpandMore />}
        >
          {displayGroups
            ? tr.EditCategorizedCheckBoxQuestion.hideCategorySettings
            : tr.EditCategorizedCheckBoxQuestion.modifyCategoryGroups}
        </Button>
      </Box>
      {displayGroups && (
        <OptionCategoriesSelect
          selectedCategories={option.categories ?? []}
          optionCategoryGroups={optionCategoryGroups}
          onChange={(categories) => {
            onChange(
              options.map((option, i) =>
                index === i ? { ...option, categories } : option,
              ),
            );
          }}
        />
      )}
    </Stack>
  );
}

export function generateDraftId() {
  return Math.random().toString(36);
}

interface Props {
  options: SectionOption[];
  optionCategoryGroups: SectionOptionCategoryGroup[];
  disabled?: boolean;
  onChange: (options: SectionOption[]) => void;
  title: string;
  enableClipboardImport?: boolean;
  allowOptionInfo?: boolean;
}

export function CategorizedQuestionOptions({
  options,
  optionCategoryGroups,
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
        return {
          ...optionToChange,
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
      <Typography sx={{ fontWeight: 500, fontSize: '1.125rem' }}>
        {title}
      </Typography>

      <Stack gap={1}>
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
              <CategorizedOption
                isDragging={isDragging}
                option={option}
                onChange={onChange}
                allowOptionInfo={allowOptionInfo}
                inputRefs={inputRefs}
                index={index}
                handleClipboardInput={handleClipboardInput}
                options={options}
                optionCategoryGroups={optionCategoryGroups}
                enableClipboardImport={enableClipboardImport}
              />
            ),
          }))}
        />
      </Stack>
      <Box
        display={'flex'}
        alignItems="center"
        width="fit-content"
        gap={1.5}
        mt={1}
      >
        <Fab
          color="primary"
          disabled={disabled}
          aria-label={tr.EditCategorizedCheckBoxQuestion.addOption}
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
          <Add htmlColor="white" />
        </Fab>
        <span aria-hidden>{tr.EditCategorizedCheckBoxQuestion.addOption}</span>
      </Box>
    </Box>
  );
}
