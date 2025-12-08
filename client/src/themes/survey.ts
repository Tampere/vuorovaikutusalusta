import {
  Theme,
  Components,
  createTheme,
  CSSInterpolation,
} from '@mui/material/styles';
import { fiFI } from '@mui/material/locale';
import { sharedTheme } from './shared';

declare module '@mui/material/styles' {
  interface Palette {
    disabled: Palette['primary'];
  }
  interface PaletteOptions {
    disabled?: PaletteOptions['primary'];
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    questionTitle: true;
    followUpSectionTitle: true;
  }
}

const idleOutlineStyle: CSSInterpolation = {
  outlineOffset: 0,
  outlineColor: 'rgba(0,0,0,.0);',
  transition: 'outline-offset 400ms, outline-color 400ms',
};

const disabledColor = '#636363';
const focusBackground = '#40aeff2e';
const defaultFocusOutlineShorthand = '2px solid black';

const defaultFocusOutlineStyles: CSSInterpolation = {
  outline: defaultFocusOutlineShorthand,
  outlineOffset: '2px',
};

const defaultFocusStyles: CSSInterpolation = {
  backgroundColor: focusBackground,
  ...defaultFocusOutlineStyles,
};

const defaultFocus: CSSInterpolation = {
  ...idleOutlineStyle,
  '&.Mui-focusVisible': defaultFocusStyles,
};

export const buttonOverrides: Components<Omit<Theme, 'components'>> = {
  MuiButtonBase: {
    styleOverrides: {
      root: {
        ...idleOutlineStyle,
        '&.Mui-focusVisible:not(.MuiButton-contained)': defaultFocusStyles,
        '&.Mui-focusVisible.MuiButton-contained': defaultFocusOutlineStyles,
        textTransform: 'none',
        '&.Mui-disabled': {
          color: disabledColor,
        },
      },
    },
    defaultProps: {
      disableRipple: true,
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        '&.Mui-disabled': {
          color: disabledColor,
        },
      },
    },
  },
  MuiFab: {
    styleOverrides: {
      root: {
        textTransform: 'none',
      },
    },
  },
  MuiToggleButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
      },
    },
  },

  MuiCssBaseline: {
    styleOverrides: {
      'input:focus-visible': { outline: defaultFocusOutlineShorthand },
    },
  },
};

export const inputOverrides: Components<Omit<Theme, 'components'>> = {
  MuiAccordionSummary: {
    styleOverrides: {
      root: {
        '&.Mui-focusVisible': {
          background: focusBackground,
          zIndex: 100, // Outline might get obstructed by its following siblings
        },
      },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        ...idleOutlineStyle,
        '&.Mui-focused': {
          backgroundColor: focusBackground,
          ...defaultFocusOutlineStyles,
        },
      },
    },
  },
  MuiLink: {
    styleOverrides: {
      root: { borderRadius: '2px', ...defaultFocus },
    },
  },
  MuiSlider: {
    styleOverrides: {
      thumb: {
        ...idleOutlineStyle,
        '&.Mui-focusVisible': {
          outlineOffset: '10px',
          outline: defaultFocusOutlineShorthand,
        },
      },
    },
  },
  MuiFormControlLabel: {
    styleOverrides: {
      label: {
        '&.Mui-disabled': {
          color: 'rgba(0, 0, 0, 0.54)',
        },
      },
    },
  },
};

export const stepperOverrides: Components<Omit<Theme, 'components'>> = {
  MuiStepLabel: {
    styleOverrides: {
      root: {
        '& .Mui-disabled circle': {
          fill: '#e9e9e9',
        },
        '& .Mui-disabled text': {
          fill: 'black',
        },
      },
    },
  },
};

export const textOverrides: Components<Omit<Theme, 'components'>> = {
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
};
/**
 * Default theme - used only when survey doesn't have a theme at all set in DB
 */
export let defaultSurveyTheme = createTheme(
  {
    components: {
      ...buttonOverrides,
      ...inputOverrides,
      ...stepperOverrides,
      ...textOverrides,
    },
    palette: {
      primary: {
        main: '#135b9a',
      },
      secondary: {
        main: '#abc872',
      },
    },
  },
  fiFI,
);

defaultSurveyTheme = createTheme(defaultSurveyTheme, sharedTheme, {
  palette: {
    disabled: defaultSurveyTheme.palette.augmentColor({
      color: {
        main: '#858585',
      },
    }),
  },
});
