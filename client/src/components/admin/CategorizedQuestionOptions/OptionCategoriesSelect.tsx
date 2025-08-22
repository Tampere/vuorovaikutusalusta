import {
  SectionOptionCategory,
  SectionOptionCategoryGroup,
} from '@interfaces/survey';
import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Stack,
  Typography,
} from '@mui/material';
import { useTranslations } from '@src/stores/TranslationContext';
import React from 'react';

interface Props {
  optionCategoryGroups: SectionOptionCategoryGroup[];
  selectedCategories: SectionOptionCategory[];
  onChange: (categories: SectionOptionCategory[]) => void;
}

export function OptionCategoriesSelect({
  optionCategoryGroups,
  selectedCategories,
  onChange,
}: Props) {
  const { language } = useTranslations();

  return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        paddingX: theme.spacing(4),
        paddingY: theme.spacing(2),
      })}
    >
      {optionCategoryGroups.map((group) => (
        <Stack key={group.id}>
          <Typography sx={{ fontWeight: 500, fontSize: '1rem' }}>
            {group.name[language]}
          </Typography>

          <FormGroup sx={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {group.categories.map((category) => (
              <FormControlLabel
                key={category.id}
                sx={{ '& .MuiTypography-root': { fontSize: '0.875rem' } }}
                control={
                  <Checkbox
                    sx={(theme) => ({ paddingY: theme.spacing(0.4) })}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onChange([...selectedCategories, category]);
                      } else {
                        onChange(
                          selectedCategories.filter(
                            (c) => c.id !== category.id,
                          ),
                        );
                      }
                    }}
                    checked={selectedCategories.some(
                      (c) => c.id === category.id,
                    )}
                  />
                }
                label={category.name[language]}
              />
            ))}
          </FormGroup>
        </Stack>
      ))}
    </Box>
  );
}
