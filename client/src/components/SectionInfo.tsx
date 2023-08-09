import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Tooltip,
} from '@mui/material';
import React, { useState } from 'react';
import { Help as HelpIcon } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import rehypeExternalLinks from 'rehype-external-links';
import { useTranslations } from '@src/stores/TranslationContext';
import useId from '@mui/material/utils/useId';

interface Props {
  subject: string;
  infoText: string;
  style?: React.CSSProperties;
  hiddenFromScreenReader?: boolean;
}

export default function SectionInfo({
  subject,
  infoText,
  style,
  hiddenFromScreenReader = false,
}: Props) {
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const { tr } = useTranslations();
  const dialogId = useId();

  return (
    <div style={style ?? {}} aria-hidden={hiddenFromScreenReader}>
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
          <ReactMarkdown rehypePlugins={[rehypeExternalLinks]}>
            {infoText}
          </ReactMarkdown>
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
    </div>
  );
}
