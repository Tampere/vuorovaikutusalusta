import React from 'react';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';

export default function ImageSmallIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12.0865 13L4.85382 5.76733L1 9.62116M9.25 6.25C8.42157 6.25 7.75 5.57843 7.75 4.75C7.75 3.92157 8.42157 3.25 9.25 3.25C10.0784 3.25 10.75 3.92157 10.75 4.75C10.75 5.57843 10.0784 6.25 9.25 6.25ZM12.0769 13H1.92308C1.41328 13 1 12.5867 1 12.0769V1.92308C1 1.41328 1.41328 1 1.92308 1H12.0769C12.5867 1 13 1.41328 13 1.92308V12.0769C13 12.5867 12.5867 13 12.0769 13Z"
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
