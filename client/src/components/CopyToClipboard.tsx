import { IconButton, Tooltip } from '@mui/material';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import { useToasts } from '@src/stores/ToastContext';
import { useTranslations } from '@src/stores/TranslationContext';
import React from 'react';

interface Props {
  data: string;
  tooltip?: string;
  msg?: string;
  icon?: any;
}

export default function CopyToClipboard({ data, tooltip, icon, msg }: Props) {
  const { tr } = useTranslations();
  const { showToast } = useToasts();

  return (
    <Tooltip title={tooltip ?? tr.CopyToClipboard.tooltip}>
      <IconButton
        size="small"
        onClick={async (event: React.MouseEvent<HTMLButtonElement>) => {
          event.stopPropagation();
          event.preventDefault();

          try {
            await navigator.clipboard.writeText(data);
            showToast({
              severity: 'success',
              message: msg ?? tr.CopyToClipboard.successful,
            });
          } catch (error) {
            showToast({
              severity: 'error',
              message: msg ?? tr.CopyToClipboard.fail,
            });
          }
        }}
      >
        {icon ?? <FileCopyIcon />}
      </IconButton>
    </Tooltip>
  );
}
