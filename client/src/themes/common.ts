import { alpha, Components, createTheme, Theme } from '@mui/material/styles';

const havu = '#00a393';
const textlink = '#219acd';
const borderPrimary = '#939ca6';
const baseTheme = createTheme({});

declare module '@mui/material/styles' {
  interface Palette {
    borderPrimary: Palette['primary'];
  }

  interface PaletteOptions {
    borderPrimary?: PaletteOptions['primary'];
  }
}

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
      },
    },
  },
  MuiLink: {
    styleOverrides: {
      root: {
        color: textlink,
      },
    },
  },
};
