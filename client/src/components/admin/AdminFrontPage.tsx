import React from 'react';
import { Box, Toolbar } from '@mui/material';
import SurveyList from './SurveyList';
import { AdminAppBar } from './AdminAppBar';
import { useTranslations } from '@src/stores/TranslationContext';

export default function AdminFrontPage() {
  const { tr } = useTranslations();
  return (
    <Box sx={{ display: 'flex' }}>
      <AdminAppBar labels={[tr.SurveyList.title.frontPage]} />
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
