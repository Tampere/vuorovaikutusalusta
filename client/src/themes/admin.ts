import { fiFI } from '@mui/material/locale';
import { createTheme } from '@mui/material/styles';
import { surveyCardOverrides, ubiColors, ubiElevated } from './common';
import { buttonOverrides } from './survey';

declare module '@mui/material/styles' {
  interface TypographyVariants {
    published: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    published?: React.CSSProperties;
  }
}
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    published: true;
  }
}

export let theme = createTheme(
  {
    typography: {
      fontFamily: 'Nunito',
    },
    components: {
      ...surveyCardOverrides,
      ...buttonOverrides,
      ...ubiColors,
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: ubiElevated,
          },
        },
      },
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
          {
            props: { variant: 'published' },
            style: {
              fontStyle: 'italic',
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
      MuiChip: {
        styleOverrides: {
          root: {
            '&.Mui-disabled': {
              opacity: 0.8,
            },
          },
        },
      },
    },
  },
  fiFI,
);

theme = createTheme(theme, {
  palette: {
    ...ubiColors.palette,
    disabled: theme.palette.augmentColor({
      color: {
        main: '#858585',
      },
    }),
  },
});
