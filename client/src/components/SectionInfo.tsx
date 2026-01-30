import { Help as HelpIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  SxProps,
  Theme,
  Tooltip,
} from '@mui/material';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { forwardRef, useId, useImperativeHandle, useState } from 'react';
import MarkdownViewer from './MarkdownViewer';

interface Props {
  subject: string;
  infoText: string;
  style?: React.CSSProperties;
  hiddenFromScreenReader?: boolean;
  sx?: SxProps<Theme>;
}

export default forwardRef(function SectionInfo(
  { sx, subject, infoText, style, hiddenFromScreenReader = false }: Props,
  ref,
) {
  const { tr } = useTranslations();
  const dialogId = useId();

  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  useImperativeHandle(ref, () => {
    return { infoDialogOpen };
  });

  return (
    <Box
      {...(sx && { sx: sx })}
      style={style ?? {}}
      aria-hidden={hiddenFromScreenReader}
    >
      <Tooltip title={tr.SurveyQuestion.showInfo}>
        <IconButton
          aria-label={`${tr.SurveyQuestion.showInfo}: ${subject}`}
          onClick={() => setInfoDialogOpen(true)}
        >
          <HelpIcon color="primary" fontSize="medium" />
        </IconButton>
      </Tooltip>
      <Dialog
        aria-describedby={`${dialogId}-dialog-content`}
        onClose={() => setInfoDialogOpen(false)}
        open={infoDialogOpen}
      >
        <DialogContent id={`${dialogId}-dialog-content`}>
          <MarkdownViewer>{infoText}</MarkdownViewer>
        </DialogContent>
        <DialogActions>
          <Button
            className="close-section-info-button"
            autoFocus
            color="primary"
            variant="contained"
            onClick={() => setInfoDialogOpen(false)}
          >
            {tr.commands.close}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});
