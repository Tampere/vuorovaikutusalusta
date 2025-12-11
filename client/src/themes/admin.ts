import { createTheme } from '@mui/material/styles';
import { fiFI } from '@mui/material/locale';
import { buttonOverrides } from './survey';
import { sharedTheme } from './shared';

export let theme = createTheme(
  {
    components: {
      ...buttonOverrides,
      MuiTypography: {
        variants: [
          {
            props: { variant: 'questionTitle' },
            style: {
              fontWeight: 700,
              fontSize: '1.2em',
              color: '#000000DE',
              margin: '1em 0',
            },
          },
          {
            props: { variant: 'followUpSectionTitle' },
            style: {
              fontWeight: 700,
              fontSize: '1em',
              color: '#000000',
              margin: '0.5em 0',
            },
          },
        ],
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

theme = createTheme({
  ...theme,
  ...sharedTheme,
  palette: {
    ...theme.palette,
    disabled: theme.palette.augmentColor({
      color: {
        main: '#858585',
      },
    }),
  },
});
