import React, { SVGProps } from 'react';

export function CategorizedCheckboxIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <path
        d="M13 11V6C13 4.89543 13.8954 4 15 4H18V6H15V11H20V10H22V11C22 12.1046 21.1046 13 20 13H15C13.8954 13 13 12.1046 13 11ZM22.8818 5.70703L18.1748 10.4141L15.793 8.03223L17.207 6.61816L18.1748 7.58594L21.4678 4.29297L22.8818 5.70703Z"
        fill={props.fill ?? 'black'}
      />
      <path
        d="M2 15V9.99998C2 8.89541 2.89543 7.99998 4 7.99998H7V9.99998H4V15H9V14H11V15C11 16.1046 10.1046 17 9 17H4C2.89543 17 2 16.1046 2 15ZM11.8818 9.70701L7.1748 14.414L4.79297 12.0322L6.20703 10.6181L7.1748 11.5859L10.4678 8.29295L11.8818 9.70701Z"
        fill={props.fill ?? 'black'}
      />
      <path
        d="M22 19C22 20.1046 21.1046 21 20 21H15C13.8954 21 13 20.1046 13 19H22Z"
        fill={props.fill ?? 'black'}
      />
      <path
        d="M11 19C11 20.1046 10.1046 21 9 21H4C2.89543 21 2 20.1046 2 19H11Z"
        fill={props.fill ?? 'black'}
      />
      <path
        d="M22 15C22 16.1046 21.1046 17 20 17H15C13.8954 17 13 16.1046 13 15H22Z"
        fill={props.fill ?? 'black'}
      />
    </svg>
  );
}
