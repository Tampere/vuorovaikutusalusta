import { SurveyTheme } from '@interfaces/survey';
import { getDb } from '@src/database';

interface DbSurveyTheme {
  id: number;
  name: string;
  data: object;
}

function dbSurveyThemeToSurveyTheme(dbSurveyTheme: DbSurveyTheme): SurveyTheme {
  return {
    id: dbSurveyTheme.id,
    name: dbSurveyTheme.name,
    data: dbSurveyTheme.data,
  };
}

/**
 * Gets all available survey themes.
 * @returns All available survey themes
 */
export async function getAllSurveyThemes() {
  const rows = await getDb().manyOrNone<DbSurveyTheme>(
    `SELECT * FROM application.theme ORDER BY idx ASC`
  );
  return rows.map(dbSurveyThemeToSurveyTheme);
}
