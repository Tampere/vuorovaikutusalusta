import { Box, Link, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useTranslations } from '@src/stores/TranslationContext';
import React from 'react';

const useStyles = makeStyles({
  infoContainer: {
    margin: '0rem 1rem 0rem 1rem',
    display: 'flex',
    flexDirection: 'column',
  },
  infoText: {
    fontSize: '1.25rem',
    paddingBottom: '0.5rem',
  },
});

export function UnavailableSurvey() {
  const { tr } = useTranslations();
  const classes = useStyles();

  return (
    <Box
      className={classes.infoContainer}
      sx={{
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
      <Typography variant="body1" classes={{ body1: classes.infoText }}>
        {tr.UnavailableSurvey.surveyNotPublished}
      </Typography>
      <Typography variant="body1" classes={{ body1: classes.infoText }}>
        {tr.UnavailableSurvey.treTopicalInfo}
      </Typography>
      <br />
      <Link href="https://tampere.fi" className={classes.infoText}>
        {tr.UnavailableSurvey.tre}
      </Link>
    </Box>
  );
}
