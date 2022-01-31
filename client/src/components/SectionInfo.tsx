import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Fab,
  Tooltip,
} from '@material-ui/core';
import React, { useState } from 'react';
import { Help as HelpIcon } from '@material-ui/icons';
import ReactMarkdown from 'react-markdown';
import rehypeExternalLinks from 'rehype-external-links';
import { useTranslations } from '@src/stores/TranslationContext';

interface Props {
  infoText: string;
  style: React.CSSProperties;
}

export default function SectionInfo({ infoText, style }: Props) {
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const { tr } = useTranslations();

  return (
    <div style={style ?? {}}>
      <Tooltip title={tr.SurveyQuestion.showInfo}>
        <Fab
          aria-label={'info'}
          size="small"
          onClick={() => setInfoDialogOpen(true)}
        >
          <HelpIcon color="primary" fontSize="large" />
        </Fab>
      </Tooltip>
      <Dialog onClose={() => setInfoDialogOpen(false)} open={infoDialogOpen}>
        <DialogContent>
          <ReactMarkdown rehypePlugins={[rehypeExternalLinks]}>
            {infoText}
          </ReactMarkdown>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            variant="contained"
            onClick={() => setInfoDialogOpen(false)}
            autoFocus
          >
            {tr.commands.close}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
