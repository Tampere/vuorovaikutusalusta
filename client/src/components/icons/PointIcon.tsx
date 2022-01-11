import React from 'react';

interface Props {
  width?: string;
  height?: string;
}

export default function PointIcon({ width, height }: Props) {
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
      <circle cx="128.036" cy="127.947" r="124.999" fill="#007DC3"></circle>
      <path
        fill="#498FCC"
        d="M87.558 112.182L82.635 103.674 91.462 104.466z"
      ></path>
      <path
        fill="none"
        stroke="#FFF"
        strokeLinecap="square"
        strokeWidth="8"
        d="M183.604 78.519c0-30.689-24.879-55.568-55.567-55.568-30.689 0-55.568 24.878-55.568 55.568a55.299 55.299 0 008.6 29.681h-.054l45.054 77.53 46.645-74.171a55.33 55.33 0 0010.89-33.04z"
      ></path>
      <path
        fill="none"
        stroke="#FFF"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="10"
        d="M162.406 76.2c.135 1.229.201 2.478.201 3.741 0 19.095-15.479 34.571-34.571 34.571-19.095 0-34.572-15.477-34.572-34.571 0-19.094 15.477-34.572 34.572-34.572a34.396 34.396 0 0118.649 5.457M159.119 61.126c.166.277.324.554.48.834"
      ></path>
      <circle
        cx="128.036"
        cy="219.794"
        r="17.91"
        fill="#FFF"
        stroke="#FFF"
        strokeWidth="5.87"
      ></circle>
    </svg>
  );
}
