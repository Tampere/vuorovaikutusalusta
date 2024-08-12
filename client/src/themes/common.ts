import { alpha, Components, createTheme, Theme } from '@mui/material/styles';

const havu = '#00a393';
const textlink = '#219acd';
const borderPrimary = '#939ca6';
const baseTheme = createTheme({});

export const ubiColors = createTheme({
  palette: {
    primary: {
      main: havu,
    },
    borderPrimary: baseTheme.palette.augmentColor({
      color: {
        main: borderPrimary,
      },
      name: 'border',
    }),
  },
});

export const ubiShadow =
  '0px 2px 4px rgba(63, 111, 127, 0.9), 0px 10px 20px rgba(10, 104, 129, 0.15)';
export const surveyCardOverrides: Components<Omit<Theme, 'components'>> = {
  MuiCard: {
    styleOverrides: {
      root: {
        boxShadow: ubiShadow,
        border: `0.5px solid ${borderPrimary};`,
        // border: '0.5px solid color(display-p3 0.914 0.925 0.937);', TODO: support for P3 color space seems poor/non existant
      },
    },
  },
};

//
// /* .Effect sample */
//
// box-sizing: border-box;
//
// /* Auto layout */
// display: flex;
// flex-direction: row;
// justify-content: center;
// align-items: center;
// padding: 27px 28px;
// gap: 10px;
//
// position: absolute;
// width: 100px;
// height: 50px;
// left: 33px;
// top: 37px;
//
// background: #FFFFFF;
// background: color(display-p3 1.000 1.000 1.000);
// border: 0.5px solid #E9ECF0;
// border: 0.5px solid color(display-p3 0.914 0.925 0.937);
// /* Elevation
//
// Depict an element is detached from the surface it&#39;s on.
// */
// /* Elevation
//
// Depict an element is detached from the surface it&#39;s on.
// */
// box-shadow: 0px 2px 4px rgba(63, 111, 127, 0.09), 0px 10px 20px rgba(10, 104, 129, 0.15);
// box-shadow: 0px 2px 4px color(display-p3 0.290 0.431 0.490 / 0.09), 0px 10px 20px color(display-p3 0.180 0.404 0.498 / 0.15);
// border-radius: 24px;
//
