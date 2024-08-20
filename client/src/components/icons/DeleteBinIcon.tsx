import React from 'react';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';

export default function DeleteBinIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M1 5H23M9.75 17.75V10.25M14.25 17.75V10.25M14.25 1H9.75C9.35218 1 8.97064 1.15804 8.68934 1.43934C8.40804 1.72064 8.25 2.10218 8.25 2.5V5H15.75V2.5C15.75 2.10218 15.592 1.72064 15.3107 1.43934C15.0294 1.15804 14.6478 1 14.25 1ZM18.86 21.62C18.8322 21.9958 18.663 22.3471 18.3865 22.6032C18.1101 22.8592 17.7468 23.001 17.37 23H6.63C6.25317 23.001 5.88994 22.8592 5.61347 22.6032C5.337 22.3471 5.16782 21.9958 5.14 21.62L3.75 5H20.25L18.86 21.62Z"
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
