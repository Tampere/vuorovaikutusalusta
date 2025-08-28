import {
  SectionOptionCategory,
  SectionOptionCategoryGroup,
} from '@interfaces/survey';
import { Add, ArrowForward, Delete } from '@mui/icons-material';
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
import { theme } from '@src/themes/admin';
import React, { createRef, useEffect, useMemo, useState } from 'react';

interface CategoryGroupProps {
  name: string;
  groupIndex: number;
  categories: SectionOptionCategory[];
  handleAddCategory: (category: string) => void;
  handleDeleteCategory: (categoryId: string) => void;
  handleDeleteCategoryGroup: () => void;
  handleEditCategoryGroupName: (name: string) => void;
  handleCategoryGroupAdd: () => void;
  inputRef?: React.RefObject<HTMLInputElement>;
}

const headerHeight = '1.825rem';
const fontSize = '0.875rem';
const rootBackground = 'rgba(0, 0, 0, 0.1)';

const styles = {
  root: {
    padding: theme.spacing(1.5),
    borderRadius: theme.spacing(0.5),
    borderTopLeftRadius: theme.spacing(3),
    background: rootBackground,
  },
  label: {
    fontWeight: 500,
    lineHeight: '1.75',
  },
  indexIcon: {
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    width: headerHeight,
    height: headerHeight,
    backgroundColor: theme.palette.primary.main,
  },
  text: {
    fontSize,
  },
  textInput: {
    flex: 1,
    borderRadius: theme.spacing(0.5),
    height: headerHeight,
    lineHeight: '1.75',
    '& input': {
      fontSize,
    },
  },
  divider: {
    width: '1px',
    backgroundColor: theme.palette.primary.main,
  },
  addCategoryButton: {
    fontWeight: 'normal',
    alignSelf: 'stretch',
    paddingX: theme.spacing(1),
  },
};

function CategoryGroup({
  name,
  groupIndex,
  categories,
  handleAddCategory,
  handleDeleteCategory,
  handleDeleteCategoryGroup,
  handleEditCategoryGroupName,
  handleCategoryGroupAdd,
  inputRef,
}: CategoryGroupProps) {
  const { language, tr } = useTranslations();
  const [newCategory, setNewCategory] = useState('');

  return (
    <Stack display="flex" gap={1} sx={styles.root}>
      <Box display="flex" gap="0.5rem" alignItems="center">
        <Box sx={styles.indexIcon}>{groupIndex + 1}</Box>
        <TextField
          inputRef={inputRef}
          variant="standard"
          autoComplete="off"
          data-1p-ignore
          sx={{ ...styles.label, ...styles.textInput }}
          value={name}
          onChange={(event) => {
            handleEditCategoryGroupName(event.target.value);
          }}
          onKeyDown={(event) => {
            if (['Enter', 'NumpadEnter'].includes(event.nativeEvent.code)) {
              event.preventDefault();
              handleCategoryGroupAdd();
            }
          }}
        />
        <Tooltip title={tr.EditCategorizedCheckBoxQuestion.deleteCategoryGroup}>
          <span>
            <IconButton
              sx={{ marginLeft: 'auto', padding: 0 }}
              onClick={() => handleDeleteCategoryGroup()}
              aria-label={tr.SurveySections.removeOption}
            >
              <Delete fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
      <Box
        display="flex"
        gap={1}
        sx={{ paddingLeft: `calc(${headerHeight} + ${theme.spacing(1)})` }}
      >
        <Box
          display="flex"
          alignItems="center"
          alignSelf="flex-start"
          flex={3}
          gap={0.5}
        >
          <TextField
            variant="standard"
            autoComplete="off"
            data-1p-ignore
            sx={styles.textInput}
            value={newCategory}
            onChange={(event) => {
              setNewCategory(event.target.value);
            }}
            onKeyDown={(event) => {
              if (
                ['Enter', 'NumpadEnter'].includes(event.nativeEvent.code) &&
                categories.every((cat) => cat.name[language] !== newCategory)
              ) {
                event.preventDefault();
                handleAddCategory(newCategory);
                setNewCategory('');
              }
            }}
            placeholder={
              tr.EditCategorizedCheckBoxQuestion.categoryAddPlaceholder
            }
          />
          <Button
            disabled={
              !newCategory ||
              categories.some((cat) => cat.name[language] === newCategory)
            }
            endIcon={<ArrowForward />}
            onClick={() => {
              handleAddCategory(newCategory);
              setNewCategory('');
            }}
            sx={(theme) => ({
              paddingX: theme.spacing(0.75),
              paddingY: 0,
              ...styles.addCategoryButton,
            })}
          >
            {tr.commands.add}
          </Button>
        </Box>

        <Box sx={styles.divider} />

        <Box display={'flex'} flexWrap="wrap" gap={1} flex={4}>
          {categories.map((category) => (
            <Chip
              sx={{ fontSize: '0.75rem' }}
              label={category.name[language]}
              key={category.id}
              onDelete={() => handleDeleteCategory(category.id)}
            />
          ))}
        </Box>
      </Box>
    </Stack>
  );
}

interface Props {
  categoryGroups: SectionOptionCategoryGroup[];
  handleCategoryGroupAdd: () => void;
  handleCategoryAdd: (groupId: string, category: string) => void;
  handleCategoryDelete: (groupId: string, categoryId: string) => void;
  handleCategoryGroupEdit: (groupId: string, name: string) => void;
  handleCategoryGroupDelete: (groupId: string) => void;
}

export function EditCategoryGroups({
  categoryGroups,
  handleCategoryGroupAdd,
  handleCategoryAdd,
  handleCategoryDelete,
  handleCategoryGroupEdit,
  handleCategoryGroupDelete,
}: Props) {
  const { tr, language } = useTranslations();

  // Array of references to the option input elements
  const inputRefs = useMemo(
    () =>
      Array(categoryGroups.length)
        .fill(null)
        .map(() => createRef<HTMLInputElement>()),
    [categoryGroups.length],
  );

  // Whenever input element count changes, focus on the last one
  useEffect(() => {
    const lastElement = inputRefs[inputRefs.length - 1]?.current;
    lastElement?.focus();
  }, [inputRefs.length]);

  return (
    <Stack gap={1}>
      {categoryGroups.map((group, idx) => (
        <CategoryGroup
          inputRef={inputRefs[idx]}
          groupIndex={idx}
          key={group.id}
          name={group.name[language]}
          categories={group.categories}
          handleAddCategory={(category) => {
            handleCategoryAdd(group.id, category);
          }}
          handleDeleteCategory={(categoryId) => {
            handleCategoryDelete(group.id, categoryId);
          }}
          handleEditCategoryGroupName={(name) => {
            handleCategoryGroupEdit(group.id, name);
          }}
          handleDeleteCategoryGroup={() => {
            handleCategoryGroupDelete(group.id);
          }}
          handleCategoryGroupAdd={handleCategoryGroupAdd}
        />
      ))}

      <Box display="flex" gap={1.5} alignItems="center" mt={1}>
        <Fab
          onClick={() => {
            handleCategoryGroupAdd();
          }}
          aria-label={tr.EditCategorizedCheckBoxQuestion.addCategory}
          size="small"
          color="primary"
        >
          <Add htmlColor="white" />
        </Fab>
        <Typography aria-hidden>
          {tr.EditCategorizedCheckBoxQuestion.addCategory}
        </Typography>
      </Box>
    </Stack>
  );
}
