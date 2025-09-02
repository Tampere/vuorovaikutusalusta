import { Box, SxProps, TextField } from '@mui/material';
import { useTranslations } from '@src/stores/TranslationContext';
import React from 'react';

interface Props {
  value: string;
  onChange: (event: any) => void;
  variant?: 'standard' | 'filled' | 'outlined';
  color?: 'error' | 'primary' | 'secondary' | 'warning' | 'info' | 'success';
  sx?: SxProps;
  leftIcon?: React.ReactElement;
}

export default function TranslationField({
  value,
  onChange,
  variant,
  color,
  sx,
  leftIcon,
}: Props) {
  const { tr } = useTranslations();

  return (
    <Box
      display="flex"
      alignItems="center"
      gap="0.5rem"
      sx={{ position: 'relative' }}
    >
      {leftIcon && (
        <Box
          className="translations-field-icon"
          sx={{ position: 'absolute', left: '-2.5rem' }}
        >
          {leftIcon}
        </Box>
      )}
      <TextField
        color={color}
        variant={variant}
        value={value ?? ''}
        onChange={onChange}
        error={!value}
        placeholder={!value ? tr.EditSurveyTranslations.missingTranslation : ''}
        sx={{
          '& .MuiInputBase-input': {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          },
          ...sx,
        }}
        style={{ paddingBottom: '0.5rem', width: '100%' }}
      />
    </Box>
  );
}
