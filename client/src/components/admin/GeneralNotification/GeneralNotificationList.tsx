import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  CircularProgress,
  Stack,
  Theme,
  Typography,
  useTheme,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { GeneralNotification } from '@interfaces/generalNotification';
import { Campaign, Edit, ExpandMore } from '@mui/icons-material';

import { useTranslations } from '@src/stores/TranslationContext';
import { GeneralNotificationCard } from './GeneralNotificationCard';
import { useToasts } from '@src/stores/ToastContext';
import { User } from '@interfaces/user';
import { format } from 'date-fns';

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
  const { tr, language } = useTranslations();
  const { showToast } = useToasts();
  const theme = useTheme();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    async function fetchOtherUsers() {
      try {
        const users = await fetch('/api/users').then(
          (response) => response.json() as Promise<User[]>,
        );
        setUsers(users);
      } catch (error) {
        showToast({
          severity: 'error',
          message: tr.EditSurveyInfo.userFetchFailed,
        });
      }
    }

    fetchOtherUsers();
  }, []);

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
        <Campaign
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
    <Box component={'ul'} sx={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {notifications.map((notification) => {
        const editingNotification =
          editing && notification.id === activeNotification?.id;
        return (
          <Box key={notification.id} sx={notificationListStyle} component="li">
            <Accordion
              disableGutters
              slotProps={{ heading: { component: 'div' } }}
            >
              <AccordionSummary
                sx={{
                  marginLeft: 0,
                  '& .MuiAccordionSummary-content': {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  },
                  ...((notification.publishedExternally ||
                    notification.publishedInternally) && {
                    '& .MuiAccordionSummary-expandIconWrapper': {
                      alignSelf: 'flex-start',
                      marginTop: '1rem',
                    },
                  }),
                }}
                expandIcon={<ExpandMore />}
              >
                <Box
                  display="flex"
                  flex={1}
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="h5" component="p" color="primary">
                    {notification.title[language]}
                  </Typography>
                  <Typography color={'#c4c4c4'} fontSize={'14px'}>
                    {users.find((usr) => usr.id === notification.publisher)
                      ?.fullName ?? tr.GeneralNotification.maintenance}
                    , {new Date(notification.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
                {(notification.publishedExternally ||
                  notification.publishedInternally) && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'flex-end',
                    }}
                  >
                    {/* Scheduling info (start/end dates) */}
                    {notification.startDate && notification.endDate ? (
                      <Typography variant="body1" color="textSecondary">
                        {tr.SurveyList.open}{' '}
                        {format(notification.startDate, 'd.M.yyyy')}—
                        {format(notification.endDate, 'd.M.yyyy')}
                      </Typography>
                    ) : notification.startDate ? (
                      <Typography variant="body1" color="textSecondary">
                        {tr.SurveyList.openFrom}{' '}
                        {format(notification.startDate, 'd.M.yyyy')}
                      </Typography>
                    ) : null}
                    {/* Current publish status */}
                    <Stack
                      sx={{
                        marginLeft: 'auto',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                      }}
                    >
                      {notification.publishedExternally && (
                        <Typography
                          style={{ fontSize: '0.875rem', color: 'green' }}
                        >
                          {tr.GeneralNotification.publishedExternally}
                        </Typography>
                      )}
                      {notification.publishedInternally && (
                        <Typography
                          style={{ fontSize: '0.875rem', color: 'green' }}
                        >
                          {tr.GeneralNotification.publishedInternally}
                        </Typography>
                      )}
                    </Stack>
                  </div>
                )}
              </AccordionSummary>
              <AccordionDetails>
                <GeneralNotificationCard
                  content={notification.message[language]}
                />

                {editingEnabled && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() =>
                      editingNotification ? onCancel() : onEdit(notification)
                    }
                    {...(!editingNotification && { endIcon: <Edit /> })}
                    sx={{ marginBottom: '1rem' }}
                  >
                    {editingNotification
                      ? tr.commands.cancel
                      : tr.commands.edit}
                  </Button>
                )}
              </AccordionDetails>
            </Accordion>
          </Box>
        );
      })}
    </Box>
  );
}
