import { Components, createTheme, Theme } from '@mui/material/styles';

const havu = '#00a393';
export const harmaa = '#515b68';
const textlink = '#219acd';
const borderPrimary = '#E9ECF0';
const baseTheme = createTheme({});

declare module '@mui/material/styles' {
  interface Palette {
    borderPrimary: Palette['primary'];
    brandYellow: Palette['primary'];
  }

  interface PaletteOptions {
    borderPrimary?: PaletteOptions['primary'];
    brandYellow?: PaletteOptions['primary'];
  }
}

export const ubiElevated =
  '0px 2px 4px rgba(63, 111, 127, 0.09), 0px 10px 20px rgba(10, 104, 129, 0.15)';
export const surveyCardOverrides: Components<Omit<Theme, 'components'>> = {
  MuiCard: {
    styleOverrides: {
      root: {
        boxShadow: ubiElevated,
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

const overridableComponents = [
  'MuiAccordion',
  'MuiInputBase',
  'MuiList',
  'MuiTypography',
  'MuiFormLabel',
  'MuiTableCell',
];

const MuiTypographyOverrides = {
  variants: [
    {
      props: { variant: 'questionTitle' },
      style: {
        fontWeight: 700,
        fontSize: '1.2em',
        margin: '1em 0',
      },
    },
    {
      props: { variant: 'followUpSectionTitle' },
      style: {
        fontWeight: 700,
        fontSize: '1em',
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
      color: harmaa,
      textTransform: 'none',
    },
  },
};

const commonComponentOverrides: Components<Omit<Theme, 'components'>> = {
  MuiCssBaseline: {
    styleOverrides: {
      color: harmaa,
      body: {
        color: harmaa,
      },
    },
  },
  ...overridableComponents.reduce((object, component) => {
    if (component === 'MuiTypography') {
      return {
        ...object,
        [component]: MuiTypographyOverrides,
      };
    }
    return {
      ...object,
      [component]: { styleOverrides: { root: { color: harmaa } } },
    };
  }, {}),
};

/**  Use this common theme as baseline for all themes */
export const ubiTheme = createTheme({
  palette: {
    primary: {
      main: havu,
    },
    brandYellow: {
      main: '#FFECAB',
    },
    borderPrimary: baseTheme.palette.augmentColor({
      color: {
        main: borderPrimary,
      },
      name: 'border',
    }),
  },
  typography: { fontFamily: 'Nunito' },
  components: commonComponentOverrides,
});
