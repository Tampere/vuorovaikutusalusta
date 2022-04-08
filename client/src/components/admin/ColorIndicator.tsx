import { makeStyles } from '@material-ui/styles';
import React from 'react';

interface Props {
  color: string;
}

const useStyles = makeStyles({
  colorIndicator: {
    borderRadius: '50%',
    width: '1rem',
    height: '1rem',
    marginLeft: '0.5rem',
  },
});

export default function ColorIndicator({ color }: Props) {
  const classes = useStyles();
  return (
    color && (
      <div className={classes.colorIndicator} style={{ background: color }} />
    )
  );
}
