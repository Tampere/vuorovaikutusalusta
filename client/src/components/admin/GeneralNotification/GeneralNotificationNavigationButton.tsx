import { Box, IconButton, Tooltip } from '@mui/material';
import { MegaphoneIcon } from '@src/components/icons/MegaphoneIcon';
import { useToasts } from '@src/stores/ToastContext';
import { useTranslations } from '@src/stores/TranslationContext';
import { request } from '@src/utils/request';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

export function GeneralNotificationNavigationButton() {
  const { tr } = useTranslations();
  const { showToast } = useToasts();
  const history = useHistory();
  const [newNotifications, setNewNotifications] = useState(false);

  async function refreshRecentCount() {
    const data = (await request('/api/general-notifications/recent-count')) as {
      count: number;
    };

    setNewNotifications(data.count > 0);
  }

  useEffect(() => {
    const eventSource = new EventSource('/api/general-notifications/events');
    eventSource.onerror = () => {
      showToast({
        message: tr.AppBar.generalNotificationsError,
        severity: 'error',
      });
    };
    eventSource.onmessage = (message) => {
      const data = JSON.parse(message.data);

      if (data.newGeneralNotifications || data.deletedGeneralNotification) {
        refreshRecentCount();
      } else {
        setNewNotifications(false);
      }
    };
    return () => eventSource.close();
  }, []);

  useEffect(() => {
    refreshRecentCount();
  }, []);

  return (
    <Tooltip
      title={
        tr.AppBar[
          newNotifications ? 'generalNotificationsNew' : 'generalNotifications'
        ]
      }
    >
      <IconButton onClick={() => history.push('/tiedotteet')}>
        <MegaphoneIcon htmlColor="white" />
        {newNotifications && (
          <Box
            component="span"
            sx={(theme) => ({
              position: 'absolute',
              top: '12px',
              right: '0',
              boxShadow: theme.shadows[1],
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: theme.palette.brandYellow.main,
            })}
          />
        )}
      </IconButton>
    </Tooltip>
  );
}
