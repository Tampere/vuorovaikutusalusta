import { ThemeOptions } from '@mui/material';

declare module '@mui/material/styles' {
  interface Theme {
    brand: {
      red: string;
    };
  }

  interface ThemeOptions {
    brand?: {
      red?: string;
    };
  }
}

export const sharedTheme: ThemeOptions = {
  brand: {
    red: 'rgb(173,57,99)',
  },
};
