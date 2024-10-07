import React from 'react';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';

export default function CheckboxCheckedIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M9.75 1.5H2C1.44772 1.5 1 1.94772 1 2.5V12C1 12.5523 1.44772 13 2 13H11.5C12.0523 13 12.5 12.5523 12.5 12V5M3.69556 5.9773L7.02222 8.47229L13 1"
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
