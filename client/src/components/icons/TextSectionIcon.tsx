import React from 'react';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';

export default function TextSectionIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M13 1H8.5M13 4H8.5M13 7H8.5M13 13H1M13 10H1M1.26648 7L3.10837 1.47434C3.20279 1.19107 3.46788 1 3.76648 1C4.06507 1 4.33017 1.19107 4.42459 1.47434L6.26648 7M1.93311 5H5.59977"
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
