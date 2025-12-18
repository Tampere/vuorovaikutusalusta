import { GeneralNotification } from '@interfaces/generalNotification';
import { Campaign, ExpandLess, ExpandMore } from '@mui/icons-material';
import {
  CardActionArea,
  Stack,
  SxProps,
  Typography,
  useTheme,
} from '@mui/material';
import { useToasts } from '@src/stores/ToastContext';
import { useTranslations } from '@src/stores/TranslationContext';
import { request } from '@src/utils/request';
import React, { Fragment, useEffect, useRef, useState } from 'react';

import { GeneralNotificationCard } from './GeneralNotificationCard';

interface Props {
  variant: 'internal' | 'external';
  sx?: SxProps;
  defaultOpen?: boolean;
  isMobile?: boolean;
}

export function PublishedGeneralNotification({
  variant,
  sx,
  defaultOpen = false,
  isMobile = false,
}: Props) {
  const [notifications, setNotifications] = useState<GeneralNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const { surveyLanguage, language, tr } = useTranslations();
  const { showToast } = useToasts();
  const [expanded, setExpaned] = useState(defaultOpen);
  const theme = useTheme();
  const [contentHeight, setContentHeight] = useState<number>(0);
  const contentRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [notifications, expanded]);

  if (loading) {
    return null;
  }

  if (notifications.length === 0) {
    return null;
  }

  return (
    <Stack
      ref={contentRef}
      sx={{
        maxHeight: expanded
          ? isMobile
            ? `${contentHeight}px`
            : '50vh'
          : '45px',
        overflowY: isMobile || !expanded ? 'hidden' : 'auto',
        transition: `max-height ${
          isMobile && contentHeight > 1000 ? '0.5s' : '0.3s'
        } ease-in-out`,
        alignItems: 'stretch',

        paddingTop: '0.25rem',
        border: `1px solid ${theme.brand.red}`,
        borderRadius: '4px',
        position: 'relative',
        background: 'white',
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
          htmlColor={theme.brand.red}
        />
        <Typography
          variant="h6"
          component={'p'}
          {...(!defaultOpen && { color: theme.brand.red })}
        >
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
          <Fragment key={notification.id}>
            <Typography
              variant="h6"
              component={'h2'}
              sx={{ marginTop: '1rem' }}
            >
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
          </Fragment>
        ))}
      </Stack>
    </Stack>
  );
}
