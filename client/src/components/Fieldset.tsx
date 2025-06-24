import React, { ReactNode } from 'react';
import { Box, Theme } from '@mui/material';

const styles = (theme: Theme) => ({
  loading: {
    '@keyframes pulse': {
      '0%': {
        opacity: 0.4,
      },
      '50%': {
        opacity: 0.7,
      },
      '100%': {
        opacity: 0.4,
      },
    },
    animation: `pulse 1s ${theme.transitions.easing.easeIn} infinite`,
    pointerEvents: 'none',
  },
  fieldset: {
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
});

interface Props {
  disabled?: boolean;
  loading?: boolean;
  children: ReactNode | ReactNode[];
}

export default function Fieldset({ disabled, loading, children }: Props) {
  return (
    <Box
      component="fieldset"
      disabled={disabled || loading}
      sx={(theme) => ({
        ...styles(theme).fieldset,
        ...(loading ? styles(theme).loading : {}),
      })}
    >
      {children}
    </Box>
  );
}
