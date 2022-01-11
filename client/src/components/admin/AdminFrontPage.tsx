import React from 'react';
import { AppBar, Box, Toolbar, Typography } from '@material-ui/core';
import SurveyList from './SurveyList';
import { useTranslations } from '@src/stores/TranslationContext';
import AppBarUserMenu from './AppBarUserMenu';

export default function AdminFrontPage() {
  const { tr } = useTranslations();
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            {tr.SurveyList.title}
          </Typography>
          <AppBarUserMenu />
        </Toolbar>
      </AppBar>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          maxWidth: '40rem',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        <Toolbar />
        <SurveyList />
      </Box>
    </Box>
  );
}
