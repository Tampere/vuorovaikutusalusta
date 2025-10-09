import { Box } from '@mui/material';
import React from 'react';

interface Props {
  color: string;
}

const styles = {
  colorIndicator: {
    borderRadius: '50%',
    width: '1rem',
    height: '1rem',
    marginLeft: '0.5rem',
  },
};

export default function ColorIndicator({ color }: Props) {
  return (
    color && <Box sx={styles.colorIndicator} style={{ background: color }} />
  );
}
