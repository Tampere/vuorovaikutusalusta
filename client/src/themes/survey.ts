import { createTheme } from '@material-ui/core/styles';
import { fiFI } from '@material-ui/core/locale';

/**
 * Default theme - used only when survey doesn't have a theme at all set in DB
 */
export const defaultSurveyTheme = createTheme(
  {
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
