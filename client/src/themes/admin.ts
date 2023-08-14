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
        },
      },
    },
  },
  fiFI
);
