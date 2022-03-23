import { Link, ListItem } from '@material-ui/core';
import { OpenInNew } from '@material-ui/icons';
import React, { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

interface Props {
  to: string;
  external?: boolean;
  newTab?: boolean;
  children: ReactNode;
}

export default function ListItemLink(props: Props) {
  return (
    <ListItem
      button
      style={{ backgroundColor: '#333' }}
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
