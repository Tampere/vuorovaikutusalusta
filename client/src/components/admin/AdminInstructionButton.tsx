import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { useTranslations } from '@src/stores/TranslationContext';

export function AdminInstructionButton() {
  const { tr } = useTranslations();

  return (
    <Tooltip arrow title={tr.adminInstructions}>
      <IconButton href="/api/file/instructions" target="_blank">
        <InfoIcon sx={{ color: 'white' }} />
      </IconButton>
    </Tooltip>
  );
}
