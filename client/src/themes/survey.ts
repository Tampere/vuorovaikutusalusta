import { createTheme } from '@material-ui/core/styles';
import { fiFI } from '@material-ui/core/locale';

/**
 * Creates a simple survey theme with given primary & secondary colors.
 * @param primaryColor Primary color
 * @param secondaryColor Secondary color
 * @returns Survey theme
 */
function createSurveyTheme(primaryColor: string, secondaryColor: string) {
  return createTheme(
    {
      palette: {
        primary: {
          main: primaryColor,
        },
        secondary: {
          main: secondaryColor,
        },
      },
    },
    fiFI
  );
}

export const survey1 = createSurveyTheme('#135b9a', '#abc872');
export const survey2 = createSurveyTheme('#933457', '#f8de79');
export const survey3 = createSurveyTheme('#346058', '#bedcd4');
