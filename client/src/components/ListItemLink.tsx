import { Link, ListItem } from '@material-ui/core';
import { OpenInNew } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import React, { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

interface Props {
  to: string;
  external?: boolean;
  newTab?: boolean;
  children: ReactNode;
}

const useStyles = makeStyles({
  item: {
    '&:not(.Mui-selected)': {
      backgroundColor: '#333',
    },
  },
});

export default function ListItemLink(props: Props) {
  const classes = useStyles();
  return (
    <ListItem
      button
      className={classes.item}
      component={props.external ? Link : NavLink}
      {...(!props.external && {
        to: props.to,
        activeClassName: 'Mui-selected',
      })}
      {...(props.external && { href: props.to })}
      {...(props.newTab
        ? {
            target: '_blank',
            rel: 'noopener noreferrer',
          }
        : {})}
    >
      {props.children}
      {props.newTab && <OpenInNew />}
    </ListItem>
  );
}
