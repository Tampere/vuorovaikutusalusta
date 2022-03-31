import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
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

export function NotFoundPage() {
  const { tr } = useTranslations();
  const classes = useStyles();

  return (
    <Box
      className={classes.infoContainer}
      sx={{
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography classes={{ body1: classes.infoText }}>
        {tr.NotFoundPage.pageNotFound}
      </Typography>{' '}
      <Typography
        classes={{ body1: classes.infoText }}
        style={{ color: 'purple' }}
      >
        {' '}
        (404: page not found){' '}
      </Typography>
    </Box>
  );
}
