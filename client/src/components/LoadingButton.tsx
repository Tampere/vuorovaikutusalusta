import { CircularProgress } from '@mui/material';
import { Button, ButtonProps } from '@mui/material';
import React from 'react';

// Size of the circular progress component
const progressSize = 24;

const styles = {
  progress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -0.5 * progressSize,
    marginLeft: -0.5 * progressSize,
  },
};

interface Props {
  loading?: boolean;
}

/**
 * Wrapper element for Material UI button with an integrated loading indicator.
 */
export default function LoadingButton({
  loading,
  ...props
}: Props & ButtonProps) {
  return (
    <Button {...props} disabled={loading || props.disabled}>
      {props.children}
      {loading && <CircularProgress size={progressSize} sx={styles.progress} />}
    </Button>
  );
}
