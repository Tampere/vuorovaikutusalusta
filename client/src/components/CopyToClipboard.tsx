import { IconButton, Tooltip } from '@mui/material';
import FileCopyIcon from './icons/FileCopyIcon';
import { useToasts } from '@src/stores/ToastContext';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { useState } from 'react';
import { LoadingBackdrop } from './admin/LoadingBackdrop';

interface Props {
  data: string;
  tooltip?: string;
}

export default function CopyToClipboard({ data, tooltip }: Props) {
  const { tr } = useTranslations();
  const { showToast } = useToasts();
  const [loading, setLoading] = useState(false);

  return (
    <>
      <Tooltip title={tooltip ?? tr.CopyToClipboard.tooltip}>
        <IconButton
          size="small"
          onClick={async () => {
            setLoading(true);
            try {
              await navigator.clipboard.writeText(data);
              showToast({
                severity: 'success',
                message: tr.CopyToClipboard.successful,
              });
              setLoading(false);
            } catch (error) {
              showToast({
                severity: 'error',
                message: tr.CopyToClipboard.fail,
              });
              setLoading(false);
            }
          }}
        >
          <FileCopyIcon />
        </IconButton>
      </Tooltip>
      <LoadingBackdrop open={loading} />
    </>
  );
}
