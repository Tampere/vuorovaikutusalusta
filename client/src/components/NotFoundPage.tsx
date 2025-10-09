import { Box, Typography } from '@mui/material';
import { useTranslations } from '@src/stores/TranslationContext';
import React from 'react';

const styles = {
  infoContainer: {
    margin: '0rem 1rem 0rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    '& p': {
      fontSize: '1.25rem',
      paddingBottom: '0.5rem',
    },
  },
};

export function NotFoundPage() {
  const { tr } = useTranslations();

  return (
    <Box
      sx={{
        ...styles.infoContainer,
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography>{tr.NotFoundPage.pageNotFound}</Typography>{' '}
      <Typography style={{ color: 'purple' }}>
        {' '}
        (404: page not found){' '}
      </Typography>
    </Box>
  );
}
