import { Box, CircularProgress } from '@mui/material';
import { useUser } from '@src/stores/UserContext';
import React from 'react';
import { PropsWithChildren } from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';

export function ProtectedRoute(props: PropsWithChildren<RouteProps>) {
  const { activeUserIsAdmin, activeUserIsSuperUser, isInitialized } = useUser();

  if (!isInitialized) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        sx={{ gap: '1rem' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!activeUserIsAdmin && !activeUserIsSuperUser) {
    return <Redirect to="/admin" />;
  }
  return <Route {...props}>{props.children}</Route>;
}
