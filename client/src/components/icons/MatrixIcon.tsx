import React from 'react';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';

export default function MatrixIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M4.5 1V13M1 9H13M1 5H13M2 1H12C12.5523 1 13 1.44772 13 2V12C13 12.5523 12.5523 13 12 13H2C1.44771 13 1 12.5523 1 12V2C1 1.44772 1.44771 1 2 1Z"
          stroke="currentColor"
          fill="none"
          strokeOpacity="1"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </SvgIcon>
  );
}
