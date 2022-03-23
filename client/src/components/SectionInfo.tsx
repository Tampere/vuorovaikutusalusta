import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Tooltip,
} from '@material-ui/core';
import React, { useState } from 'react';
import { Help as HelpIcon } from '@material-ui/icons';
import ReactMarkdown from 'react-markdown';
import rehypeExternalLinks from 'rehype-external-links';
import { useTranslations } from '@src/stores/TranslationContext';

interface Props {
  infoText: string;
  style?: React.CSSProperties;
}

export default function SectionInfo({ infoText, style }: Props) {
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const { tr } = useTranslations();

  return (
    <div style={style ?? {}}>
      <Tooltip title={tr.SurveyQuestion.showInfo}>
        <IconButton aria-label={'info'} onClick={() => setInfoDialogOpen(true)}>
          <HelpIcon color="primary" fontSize="medium" />
        </IconButton>
      </Tooltip>
      <Dialog onClose={() => setInfoDialogOpen(false)} open={infoDialogOpen}>
        <DialogContent tabIndex={0}>
          <ReactMarkdown rehypePlugins={[rehypeExternalLinks]}>
            {infoText}
          </ReactMarkdown>
        </DialogContent>
        <DialogActions>
          <Button
            tabIndex={1}
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
