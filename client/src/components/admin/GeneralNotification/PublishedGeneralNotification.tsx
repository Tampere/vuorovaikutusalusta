import React, { useEffect, useState } from 'react';
import { GeneralNotification } from '@interfaces/generalNotification';
import { request } from '@src/utils/request';
import { GeneralNotificationCard } from './GeneralNotificationCard';
import { useToasts } from '@src/stores/ToastContext';
import { useTranslations } from '@src/stores/TranslationContext';
import {
  CardActionArea,
  Stack,
  SxProps,
  Typography,
  useTheme,
} from '@mui/material';
import { Campaign, ExpandLess, ExpandMore } from '@mui/icons-material';

interface Props {
  variant: 'internal' | 'external';
  sx?: SxProps;
  defaultOpen?: boolean;
}

export function PublishedGeneralNotification({
  variant,
  sx,
  defaultOpen = false,
}: Props) {
  const [notifications, setNotifications] = useState<GeneralNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const { surveyLanguage, language, tr } = useTranslations();
  const { showToast } = useToasts();
  const [expanded, setExpaned] = useState(defaultOpen);
  const theme = useTheme();

  useEffect(() => {
    async function fetchNotifications() {
      try {
        setLoading(true);
        const endpoint =
          variant === 'internal'
            ? '/api/general-notifications/published-internal'
            : '/api/general-notifications/published-external';
        const data = await request<GeneralNotification[]>(endpoint);
        setNotifications(data);
      } catch (error) {
        showToast({
          severity: 'error',
          message: tr.AppBar.generalNotificationsError,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, [variant]);

  if (loading) {
    return null;
  }

  if (notifications.length === 0) {
    return null;
  }

  return (
    <Stack
      sx={{
        maxHeight: expanded ? '100vh' : '45px',
        overflow: 'hidden',
        transition: 'max-height 0.3s ease-in-out',
        alignItems: 'stretch',

        paddingTop: '0.25rem',
        border: `1px solid ${theme.palette.primary.light}`,
        borderRadius: '4px',
        position: 'relative',
        ...sx,
      }}
    >
      <CardActionArea
        aria-expanded={expanded}
        aria-controls="notification-content"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}
        onClick={() => setExpaned((prev) => !prev)}
      >
        <Campaign
          sx={{ marginLeft: '0.5rem' }}
          fontSize="large"
          htmlColor={theme.palette.primary.main}
        />
        <Typography variant="h6" component={'p'}>
          {tr.GeneralNotification.newNotification}
        </Typography>

        {expanded ? (
          <ExpandLess
            sx={{
              marginLeft: 'auto',
              marginRight: '0.5rem',
            }}
          />
        ) : (
          <ExpandMore
            sx={{
              marginLeft: 'auto',
              marginRight: '0.5rem',
            }}
          />
        )}
      </CardActionArea>
      <Stack
        id={'notification-content'}
        sx={{
          position: 'sticky',
          paddingX: '1rem',
          '& .tiptap': {
            padding: 0,
          },
        }}
        aria-hidden={!expanded}
      >
        {notifications.map((notification) => (
          <>
            <Typography variant="h6" sx={{ marginTop: '1rem' }}>
              {
                notification.title[
                  variant === 'internal' ? language : surveyLanguage
                ]
              }
            </Typography>
            <GeneralNotificationCard
              key={notification.id}
              content={notification.message[language] ?? ''}
            />
          </>
        ))}
      </Stack>
    </Stack>
  );
}
