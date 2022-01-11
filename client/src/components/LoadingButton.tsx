import { CircularProgress } from '@material-ui/core';
import { Button, ButtonProps } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';

// Size of the circular progress component
const progressSize = 24;

const useStyles = makeStyles({
  progress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -0.5 * progressSize,
    marginLeft: -0.5 * progressSize,
  },
});

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
  const classes = useStyles();
  return (
    <Button {...props} disabled={loading || props.disabled}>
      {props.children}
      {loading && (
        <CircularProgress size={progressSize} className={classes.progress} />
      )}
    </Button>
  );
}
