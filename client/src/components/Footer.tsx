import { Box } from '@mui/material';
import React, { ReactNode } from 'react';

type FooterProps = {
  children?: ReactNode;
  style?: React.CSSProperties;
};

export default function Footer(props: FooterProps) {
  if (props.children === undefined) return null;

  return (
    <Box
      component="footer"
      style={props.style ?? {}}
      sx={{
        fontSize: '.8rem',
        padding: '0.5rem 1rem 0',
        '& ul': {
          padding: 0,
          '& li': {
            display: 'inline-block',
            marginLeft: '.8em',
            '&::before': {
              content: '"•"',
              marginRight: '.8em',
            },
          },
        },
      }}
    >
      <nav>
        <ul>
          {React.Children.map(props.children, (child: React.ReactNode) => {
            return child ? <li>{child}</li> : null;
          })}
        </ul>
      </nav>
    </Box>
  );
}
