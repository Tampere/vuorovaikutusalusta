import { Box, Link, Typography } from '@mui/material';
import { useTranslations } from '@src/stores/TranslationContext';
import React from 'react';

const styles = {
  infoContainer: {
    margin: '0rem 1rem 0rem 1rem',
    display: 'flex',
    flexDirection: 'column',
  },
  infoText: {
    fontSize: '1.25rem',
    paddingBottom: '0.5rem',
  },
};

export function UnavailableSurvey() {
  const { tr } = useTranslations();

  return (
    <Box
      sx={{
        ...styles.infoContainer,
        display: 'flex',
        height: '75vh',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img
        style={{ height: '125px', width: '351px' }}
        src={`api/feature-styles/icons/logo`}
        alt={tr.IconAltTexts.logoAltText}
      />
      <br />
      <Typography variant="body1" sx={styles.infoText}>
        {tr.UnavailableSurvey.surveyNotPublished}
      </Typography>
      <Typography variant="body1" sx={styles.infoText}>
        {tr.UnavailableSurvey.treTopicalInfo}
      </Typography>
      <br />
      <Link href="https://tampere.fi" sx={styles.infoText}>
        {tr.UnavailableSurvey.tre}
      </Link>
    </Box>
  );
}
