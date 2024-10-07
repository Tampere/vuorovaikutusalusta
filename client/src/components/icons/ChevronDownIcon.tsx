import React from 'react';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';

export default function ChevronDownIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M23.25 7.311L12.53 18.03C12.4604 18.0997 12.3778 18.1549 12.2869 18.1926C12.1959 18.2304 12.0984 18.2498 12 18.2498C11.9016 18.2498 11.8041 18.2304 11.7131 18.1926C11.6222 18.1549 11.5396 18.0997 11.47 18.03L0.75 7.311"
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
