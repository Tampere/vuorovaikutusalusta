import { Campaign } from '@mui/icons-material';
import { Box, IconButton, Tooltip } from '@mui/material';
import { useGeneralNotifications } from '@src/stores/GeneralNotificationContext';

import { useTranslations } from '@src/stores/TranslationContext';
import React from 'react';
import { useHistory } from 'react-router-dom';

export function GeneralNotificationNavigationButton() {
  const { tr } = useTranslations();
  const history = useHistory();
  const { newNotifications } = useGeneralNotifications();

  return (
    <Tooltip
      title={
        tr.AppBar[
          newNotifications ? 'generalNotificationsNew' : 'generalNotifications'
        ]
      }
    >
      <IconButton onClick={() => history.push('/tiedotteet')}>
        <Campaign htmlColor="white" />
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
              border: '0.5px solid white',
              backgroundColor: theme.brand.red,
            })}
          />
        )}
      </IconButton>
    </Tooltip>
  );
}
