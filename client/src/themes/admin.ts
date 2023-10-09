import { createTheme } from '@mui/material/styles';
import { fiFI } from '@mui/material/locale';
import { buttonOverrides } from './survey';

export const theme = createTheme(
  {
    components: {
      ...buttonOverrides,
      MuiTypography: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
          h1: { color: '#000000DE' },
          h2: { color: '#000000DE' },
          h3: { color: '#000000DE' },
          h4: { color: '#000000DE' },
          h5: { color: '#000000DE' },
          h6: { color: '#000000DE' },
        },
      },
    },
  },
  fiFI,
);
