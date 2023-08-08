import { Theme, Components, createTheme, CSSInterpolation } from '@mui/material/styles';
import { fiFI } from '@mui/material/locale';

export const buttonOverrides: Components<Omit<Theme, 'components'>> = {
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
      },
    },
  },
  MuiButtonBase: {
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
};

const idleOutlineStyle: CSSInterpolation = {
  outlineOffset: 0,
  outlineColor: 'rgba(0,0,0,.0);',
  transition: 'outline-offset 400ms, outline-color 400ms',
}

const defaultFocusOutlineShorthand = '2px solid black';

const defaultFocusStyles: CSSInterpolation = {
  outline: defaultFocusOutlineShorthand,
  outlineOffset: '2px',
}

const defaultFocus: CSSInterpolation = {
  ...idleOutlineStyle,
  '&.Mui-focusVisible': defaultFocusStyles,
}

export const focusOverrides: Components<Omit<Theme, 'components'>> = {
  MuiAccordionSummary: {
    styleOverrides: {
      root: {
        '&.Mui-focusVisible': {
          zIndex: 100, // Outline might get obstructed by its following siblings
        },
      },
    },
  },
  MuiButtonBase: {
    styleOverrides: {
      root: defaultFocus,
    },
    defaultProps: {
      disableRipple: true,
    }
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: { ...idleOutlineStyle,
        '&.Mui-focused': defaultFocusStyles,
      }
    },    
  },
  MuiLink: {
    styleOverrides: {
      root: { borderRadius: "2px", ...defaultFocus},
    },
  },
  MuiSlider: {
    styleOverrides: {
      thumb: { ...idleOutlineStyle,
        '&.Mui-focusVisible': {
          outlineOffset: '6px',
          outline: defaultFocusOutlineShorthand,
        },
      },
    },
  },
};

/**
 * Default theme - used only when survey doesn't have a theme at all set in DB
 */
export const defaultSurveyTheme = createTheme(
  {
    components: { ...buttonOverrides, ...focusOverrides },
    palette: {
      primary: {
        main: '#135b9a',
      },
      secondary: {
        main: '#abc872',
      },
    },
  },
  fiFI
);
