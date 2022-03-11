import { getDb } from '@src/database';
import { parseAsync } from 'json2csv';
import ogr2ogr from 'ogr2ogr';
import { DBAnswerEntry, DBOptionTextRow } from '@interfaces/answers';
import internal from 'stream';

const textSeparator = '::';
const separatorEscape = '//';

/**
 * Interface for the custom JSON format from which the CSV is created
 */
interface CSVJson {
  headers: {};
  submissions: {};
}

/**
 * Reduce DB query rows to a GeoJSON FeatureCollection
 * @param entries DB answer entry rows
 * @returns
 */
function dbEntriesToGeoJSON(entries: DBAnswerEntry[]) {
  return entries.reduce(
    (prevValue, currentValue) => {
      // Skip entries which don't include geometries
      // TODO: Might be better to create a separate SQL query for the geometry answer entries,
      // Look into this when the most important use cases for file export have been determined
      if (!currentValue.value_geometry) {
        return prevValue;
      } else {
        return {
          ...prevValue,
          features: [
            ...prevValue.features,
            {
              type: 'Feature',
              geometry: currentValue.value_geometry,
              properties: {
                submissionId: currentValue.submission_id,
                questionId: currentValue.section_id,
                questionTitle: currentValue.title?.fi,
              },
            },
          ],
        };
      }
    },
    {
      type: 'FeatureCollection',
      features: [],
    }
  );
}

/**
 * Parses custom CSVJson format into csv
 * @param entries
 * @returns Promise resolving to csv formatted string
 */
async function answerEntriesToCSV(entries: CSVJson): Promise<string> {
  const headers = ['Vastauksen tunniste', ...Object.values(entries.headers)];

  const data = Object.keys(entries.submissions).map((key) => {
    return Object.keys(entries.submissions[key]).reduce(
      (prevValue, questionKey) => {
        return {
          ...prevValue,
          [entries.headers[questionKey]]: entries.submissions[key][questionKey],
        };
      },
      { 'Vastauksen tunniste': Number([key][0]) }
    );
  });

  try {
    const csv = await parseAsync(data, { headers } as any);
    return csv;
  } catch (err) {
    console.error(err);
  }
}

/**
 * Handler function for downloading csv file
 * @param surveyId
 * @returns Promise resolving to csv formatted string
 */
export async function getCSVFile(surveyId: number): Promise<string> {
  const rows = await getAnswerDBEntries(surveyId);
  if (!rows) return null;

  return answerEntriesToCSV(await dbEntriesToCSVFormat(rows));
}

/**
 * Handler function for downloading geopackage file
 * @param surveyId
 * @returns Promise resolving to readable stream streaming geopackage data
 */
export async function getGeoPackageFile(
  surveyId: number
): Promise<internal.Readable> {
  const rows = await getAnswerDBEntries(surveyId);
  if (!rows) return null;

  const { stream } = await ogr2ogr(dbEntriesToGeoJSON(rows), {
    format: 'GPKG',
  });
  return stream;
}

/**
 * Get all DB answer entries for the given survey id
 * @param surveyId
 * @returns
 */
async function getAnswerDBEntries(surveyId: number): Promise<DBAnswerEntry[]> {
  const rows = (await getDb().manyOrNone(
    `
    SELECT * FROM 
      (SELECT 
          ae.submission_id,
          ae.section_id,
          ae.value_text, 
          ae.value_option_id, 
          public.ST_AsGeoJSON(public.ST_Transform(ae.value_geometry, 4326))::json as value_geometry,
          ae.value_numeric,
          ae.value_json
      FROM data.answer_entry ae 
      LEFT JOIN data.submission sub ON ae.submission_id = sub.id
      WHERE sub.survey_id = $1) AS temp1 
        LEFT JOIN 
          (SELECT 
            ps.id, 
            ps.title, 
            ps.type, 
            ps.details, 
            ps.parent_section 
          FROM data.page_section ps 
          LEFT JOIN data.survey_page sp ON ps.survey_page_id = sp.id 
          LEFT JOIN data.survey s ON sp.survey_id = s.id WHERE s.id = $1 ORDER BY ps.id) AS temp2
    ON temp1.section_id = temp2.id;
  `,
    [surveyId]
  )) as DBAnswerEntry[];

  if (!rows || rows.length === 0) return null;
  return rows;
}

/**
 * Format different answer entry types so that they are presentable for the CSV
 * @param questionType
 * @param dbRow
 * @param optionTexts
 * @returns
 */
function formatAnswerType(
  questionType: string,
  dbRow: DBAnswerEntry,
  optionTexts: DBOptionTextRow
): string | number | {} {
  switch (questionType) {
    case 'free-text':
      return dbRow.value_text.replace(textSeparator, separatorEscape);
    case 'radio':
    case 'checkbox':
      // Nullish coalescing handles the 'something else' kind of answer
      return (
        optionTexts[dbRow.value_option_id]?.replace(
          textSeparator,
          separatorEscape
        ) ?? dbRow.value_text.replace(textSeparator, separatorEscape)
      );
    case 'numeric':
    case 'slider':
      return dbRow.value_numeric;
    case 'sorting':
      return dbRow.value_json.reduce((prevValue, currentValue) => {
        return currentValue
          ? `${prevValue ? prevValue + textSeparator : ''}${optionTexts[
              Number(currentValue)
            ].replace(textSeparator, separatorEscape)}`
          : prevValue;
      }, '');
    case 'matrix':
      return dbRow.value_json.reduce(
        (prevAnswers, currentAnswer, answerIndex) => {
          return {
            ...prevAnswers,
            [`${dbRow.section_id}-m${answerIndex}`]:
              dbRow.details.classes[Number(currentAnswer)]['fi'],
          };
        },
        {}
      );
    default:
      return null;
  }
}

/**
 * Convert DB query rows into json format to be used for the CSV parser
 * @param dbEntries
 * @returns
 */
async function dbEntriesToCSVFormat(
  dbEntries: DBAnswerEntry[]
): Promise<CSVJson> {
  if (!dbEntries) return;

  const optionTexts = await getDb().manyOrNone(
    `
      SELECT id, text FROM data.option;
    `
  );

  const refinedOptionTexts = optionTexts.reduce((prevValue, currentValue) => {
    return {
      ...prevValue,
      [Number(currentValue['id'])]: currentValue?.text?.['fi'],
    };
  }, {});

  return dbEntries.reduce((prevValue, currentValue) => {
    if (currentValue.value_geometry) return prevValue;

    const answerEntry = formatAnswerType(
      currentValue.type,
      currentValue,
      refinedOptionTexts
    );

    // If question is a matrix question, create 'n' new headers where n is the number of question rows in the matrix
    const matrixHeaders = currentValue.details?.subjects?.reduce(
      (prevHeaders, currentMatrixSubject, subjectIndex) => {
        return {
          ...prevHeaders,
          [`${currentValue.section_id}-m${subjectIndex}`]: `${currentValue.title?.fi}: ${currentMatrixSubject['fi']}`,
        };
      },
      {}
    );

    return {
      headers: {
        ...prevValue.headers,
        ...(currentValue.type === 'matrix'
          ? matrixHeaders
          : { [currentValue.section_id]: currentValue.title?.fi }),
      },
      submissions: {
        ...prevValue.submissions,
        [currentValue.submission_id]: {
          // Items that were previously stored under the same submission
          ...(prevValue?.submissions?.[`${currentValue.submission_id}`]
            ? prevValue.submissions[`${currentValue.submission_id}`]
            : {}),
          // Items to be added under the same submission and section id
          // TODO: This applies almost only for the 'checkbox' -answers as many checkbox rows are
          // aggregated into a single string. Maybe a better solution for this at some point.
          ...(currentValue.type === 'matrix'
            ? answerEntry
            : {
                [currentValue.section_id]: prevValue?.submissions?.[
                  `${currentValue.submission_id}`
                ]?.[`${currentValue.section_id}`]
                  ? `${
                      prevValue?.submissions?.[
                        `${currentValue.submission_id}`
                      ]?.[`${currentValue.section_id}`]
                    }${textSeparator}${answerEntry}`
                  : answerEntry,
              }),
        },
      },
    };
  }, {} as CSVJson);
}
