import React, { ReactNode} from 'react';
import Box from '@mui/material/Box';

type FooterProps = {
  children?: ReactNode;
}

export default function Footer(props: FooterProps) {

  if (props.children === undefined) return null;

  return (
    <Box component="footer" sx={{
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
            }
          }
        }
      }}
    >
      <nav>
          <ul>
              {React.Children.map(props.children, (child: React.ReactNode) => 
                <li>
                  {child}
                </li>
              )}
          </ul>
      </nav>
    </Box>
  )
}
