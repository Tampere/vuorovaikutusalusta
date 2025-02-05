import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  CircularProgress,
  Theme,
  Typography,
  useTheme,
} from '@mui/material';
import React from 'react';
import { GeneralNotification } from '@interfaces/generalNotification';
import { Edit, ExpandMore } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';

import { useTranslations } from '@src/stores/TranslationContext';
import { MegaphoneIcon } from '@src/components/icons/MegaphoneIcon';

const notificationListStyle = (theme: Theme) => ({
  marginBottom: theme.spacing(1),
  '& .MuiAccordion-root': {
    boxShadow: 'none',
    border: '0.5px solid #c4c4c4',
  },
  '& .MuiAccordionSummary-root': {
    paddingLeft: '4px',
    flexDirection: 'row-reverse',
    gap: '6px',
  },
  '& .MuiAccordionSummary-expandIconWrapper': {
    color: '#c4c4c4',
    transform: 'rotate(-90deg)',
    '&.Mui-expanded': {
      transform: 'rotate(0deg)',
    },
  },
  '& .MuiAccordionDetails-root': {
    padding: '0 1rem 0 calc(6px + 24px + 4px - 8px)',
  },
});

interface Props {
  onEdit: (notification: GeneralNotification) => void;
  onCancel: () => void;
  activeNotification: GeneralNotification | null;
  notifications: GeneralNotification[];
  editing: boolean;
  loading: boolean;
  editingEnabled: boolean;
}

export function GeneralNotificationList({
  onEdit,
  onCancel,
  notifications,
  activeNotification,
  loading,
  editing,
  editingEnabled,
}: Props) {
  const { tr } = useTranslations();
  const theme = useTheme();

  if (loading) {
    return (
      <CircularProgress
        sx={{
          height: '150px',
          margin: 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      />
    );
  }

  if (notifications.length === 0) {
    return (
      <Box
        sx={{
          height: '150px',
          margin: 'auto',
          display: 'flex',
          gap: '0.5rem',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <MegaphoneIcon
          sx={{ height: '50px', width: '50px' }}
          htmlColor={theme.palette.primary.main}
        />
        <Typography variant="h6" component="p">
          {tr.GeneralNotification.noResults}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ overflowY: 'auto' }}>
      {notifications.map((notification) => (
        <Box
          component="article"
          key={notification.id}
          sx={notificationListStyle}
        >
          <Accordion disableGutters>
            <AccordionSummary
              sx={{
                marginLeft: 0,
              }}
              expandIcon={<ExpandMore />}
            >
              <Box
                display="flex"
                flex={1}
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h5" component="h1" color="primary">
                  {notification.title}
                </Typography>
                <Typography color={'#c4c4c4'} fontSize={'14px'}>
                  {notification.publisher},{' '}
                  {new Date(notification.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <ReactMarkdown>{notification.message}</ReactMarkdown>
              {editingEnabled && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() =>
                    editing && notification.id === activeNotification?.id
                      ? onCancel()
                      : onEdit(notification)
                  }
                  {...(!(
                    editing && notification.id === activeNotification?.id
                  ) && { endIcon: <Edit /> })}
                  sx={{ marginBottom: '1rem' }}
                >
                  {editing && notification.id === activeNotification?.id
                    ? tr.commands.cancel
                    : tr.commands.edit}
                </Button>
              )}
            </AccordionDetails>
          </Accordion>
        </Box>
      ))}
    </Box>
  );
}
