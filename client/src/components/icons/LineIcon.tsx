import React from 'react';

interface Props {
  width?: string;
  height?: string;
}

export default function LineIcon({ width, height }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      x="0"
      y="0"
      version="1.1"
      viewBox="0 0 255.121 255.121"
      xmlSpace="preserve"
    >
      <circle cx="128" cy="127.947" r="124.999" fill="#007DC3"></circle>
      <path
        fill="none"
        stroke="#FFF"
        strokeLinecap="round"
        strokeWidth="22"
        d="M50.566 82.951l18.792 5.465c10.335 3.006 26.269 14.177 35.407 24.825l32.902 38.34c9.14 10.647 27.719 16.438 41.287 12.869l35.049-9.222"
      ></path>
    </svg>
  );
}
