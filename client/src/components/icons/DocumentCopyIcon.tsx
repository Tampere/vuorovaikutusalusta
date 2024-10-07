import React from 'react';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';

export default function DocumentCopyIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M2.16193 3.6478V2.0072C2.16193 1.45491 2.60964 1.0072 3.16193 1.0072H4.34279M2.16193 8.27665V11.5775M7.49192 1.0072H9.5787M2.16193 16.0546V17.7407C2.16193 18.293 2.60964 18.7407 3.16193 18.7407H4.57044M12.8796 1.0072H14.0113C14.3626 1.0072 14.6882 1.19156 14.8689 1.49286L15.7715 2.9978M8.76617 22.993H19.8381C20.9426 22.993 21.8381 22.0975 21.8381 20.993V9.80867C21.838 9.46223 21.7004 9.12998 21.4555 8.88492L18.9527 6.38209C18.7076 6.1372 18.3754 5.9996 18.0289 5.99952H8.76617C8.41949 5.99952 8.087 6.13724 7.84185 6.38239C7.59671 6.62753 7.45898 6.96002 7.45898 7.30671V21.6858C7.45898 22.0325 7.59671 22.365 7.84185 22.6101C8.087 22.8553 8.41949 22.993 8.76617 22.993Z"
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
