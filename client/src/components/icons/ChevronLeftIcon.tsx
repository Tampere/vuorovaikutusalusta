import React from 'react';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';

export default function ChevronLeftIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M16.25 23.25L5.53 12.53C5.46033 12.4604 5.40507 12.3778 5.36736 12.2869C5.32965 12.1959 5.31024 12.0984 5.31024 12C5.31024 11.9016 5.32965 11.8041 5.36736 11.7131C5.40507 11.6222 5.46033 11.5396 5.53 11.47L16.25 0.75"
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
