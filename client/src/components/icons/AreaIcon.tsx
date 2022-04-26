import React from 'react';

interface Props {
  width?: string;
  height?: string;
}

export default function AreaIcon({ width, height }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width ?? height}
      height={height ?? width}
      x="0"
      y="0"
      version="1.1"
      viewBox="0 0 255.121 255.121"
      xmlSpace="preserve"
    >
      <circle cx="127.924" cy="127.947" r="124.999" fill="#007DC3"></circle>
      <path
        fill="none"
        stroke="#FFF"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="20.95"
        d="M46.97 87.797L146.658 59.278 216.468 130.189 169.696 204.849 64.301 150.832z"
      ></path>
      <path
        fill="none"
        stroke="#FFF"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="20.95"
        d="M46.97 87.797L146.658 59.278 216.468 130.189 169.696 204.849 64.301 150.832z"
        opacity="0.3"
      ></path>
    </svg>
  );
}
