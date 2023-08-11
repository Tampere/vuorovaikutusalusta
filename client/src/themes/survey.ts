import { Theme, Components, createTheme, CSSInterpolation } from '@mui/material/styles';
import { fiFI } from '@mui/material/locale';

const idleOutlineStyle: CSSInterpolation = {
  outlineOffset: 0,
  outlineColor: 'rgba(0,0,0,.0);',
  transition: 'outline-offset 400ms, outline-color 400ms',
}

const disabledColor = '#636363';
const focusBackground = '#40aeff2e';
const defaultFocusOutlineShorthand = '2px solid black';

const defaultFocusOutlineStyles: CSSInterpolation = {
  outline: defaultFocusOutlineShorthand,
  outlineOffset: '2px',
}

const defaultFocusStyles: CSSInterpolation = {
  backgroundColor: focusBackground,
  ...defaultFocusOutlineStyles,
}

const defaultFocus: CSSInterpolation = {
  ...idleOutlineStyle,
  '&.Mui-focusVisible': defaultFocusStyles,
}

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
    }
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
  MuiToggleButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
      },
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
      root: { ...idleOutlineStyle,
        '&.Mui-focused': {
          backgroundColor: focusBackground,
          ...defaultFocusOutlineStyles,
        },
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
}

export const stepperOverrides: Components<Omit<Theme, 'components'>> = {
  MuiStepLabel: {
    styleOverrides: {
      root: {
        '& .Mui-disabled circle': {
          fill: '#e9e9e9',
        },
        '& .Mui-disabled text': {
          fill: 'black',
        }
      }
    }
  }
};

/**
 * Default theme - used only when survey doesn't have a theme at all set in DB
 */
export const defaultSurveyTheme = createTheme(
  {
    components: { ...buttonOverrides, ...inputOverrides, ...stepperOverrides },
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
