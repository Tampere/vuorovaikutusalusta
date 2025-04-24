import { Box } from '@mui/material';
import { useTranslations } from '@src/stores/TranslationContext';
import { useUser } from '@src/stores/UserContext';
import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { KartallaLogoDark } from '../icons/KartallaLogoDark';

export function LogoutPage() {
  const { tr } = useTranslations();
  const { activeUser, isInitialized } = useUser();
  const history = useHistory();

  React.useEffect(() => {
    if (activeUser) {
      window.location.pathname = '/admin';
    }
  }, [activeUser, history, isInitialized]);

  if (!isInitialized || activeUser) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100vw',
        height: '100vh',
      }}
    >
      <Box display="flex" flexDirection="column" alignItems="center">
        <KartallaLogoDark
          sx={{ width: '100%', height: '95px', paddingBottom: '1rem' }}
        />
        <p>{tr.LogoutPage.logoutSuccessful}</p>
        <p>
          <Link to="/admin">{tr.LogoutPage.loginAgain}</Link>
        </p>
      </Box>
    </Box>
  );
}
