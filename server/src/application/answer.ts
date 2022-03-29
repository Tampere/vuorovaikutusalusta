import { getDb } from '@src/database';
import { parseAsync } from 'json2csv';
import ogr2ogr from 'ogr2ogr';
import internal from 'stream';
import { LocalizedText } from '@interfaces/survey';
import { GeoJSONWithCRS } from '@interfaces/geojson';
import moment from 'moment';

const textSeparator = '::';
const separatorEscape = '//';

/**
 * Interface for answer entry db row
 */
interface DBAnswerEntry {
  details: {
    subjects?: LocalizedText[];
    classes?: LocalizedText[];
  };
  section_id: number;
  section_index: number;
  submission_id: number;
  title: LocalizedText;
  type: string;
  value_geometry: GeoJSONWithCRS<
    GeoJSON.Feature<GeoJSON.Point | GeoJSON.LineString | GeoJSON.Polygon>
  >;
  value_text: string;
  value_json: JSON[];
  value_option_id: number;
  value_numeric: number;
  created_at: Date;
}

interface AnswerEntry {
  details: {
    subjects?: LocalizedText[];
    classes?: LocalizedText[];
  };
  sectionId: number;
  sectionIndex: number;
  submissionId: number;
  title: LocalizedText;
  type: string;
  valueGeometry: GeoJSONWithCRS<
    GeoJSON.Feature<GeoJSON.Point | GeoJSON.LineString | GeoJSON.Polygon>
  >;
  valueText: string;
  valueJson: JSON[];
  valueOptionId: number;
  valueNumeric: number;
  createdAt: Date;
}

/**
 * Option text localizations
 */
interface DBOptionTextRow {
  section_id: number;
  text: LocalizedText;
}

/**
 * Single cell on the CSV
 */
interface TextCell {
  [key: string]: string;
}

/**
 * Interface for the custom JSON format from which the CSV is created
 */
interface CSVJson {
  headers: TextCell[];
  submissions: { [key: number]: TextCell[]; timeStamp: Date }[];
}

/**
 * Convert db answer row to js format
 * @param rows
 * @returns
 */
function dbAnswerEntryRowsToAnswerEntries(rows: DBAnswerEntry[]) {
  if (!rows) return null;

  return rows.map((row) => ({
    details: row.details,
    sectionId: row.section_id,
    sectionIndex: row.section_index,
    submissionId: row.submission_id,
    title: row.title,
    type: row.type,
    valueGeometry: row.value_geometry,
    valueText: row.value_text,
    valueJson: row.value_json,
    valueOptionId: row.value_option_id,
    valueNumeric: row.value_numeric,
    createdAt: row.created_at,
  })) as AnswerEntry[];
}

/**
 * Reduce DB query rows to a GeoJSON FeatureCollection
 * @param entries DB answer entry rows
 * @returns
 */
function dbEntriesToGeoJSON(entries: AnswerEntry[]) {
  return entries.reduce(
    (prevValue, currentValue) => {
      // Skip entries which don't include geometries
      // TODO: Might be better to create a separate SQL query for the geometry answer entries,
      // Look into this when the most important use cases for file export have been determined
      if (!currentValue.valueGeometry) {
        return prevValue;
      } else {
        return {
          ...prevValue,
          features: [
            ...prevValue.features,
            {
              type: 'Feature',
              geometry: currentValue.valueGeometry,
              properties: {
                submissionId: currentValue.submissionId,
                timeStamp: currentValue.createdAt,
                questionId: currentValue.sectionId,
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
  const headers = [
    'Vastauksen tunniste',
    'Aikaleima',
    ...entries.headers.map((headerObj) => Object.values(headerObj)[0]),
  ];

  const data = entries.submissions.map((submission) => {
    const answers = (Object.values(submission)[0] as TextCell[]).map(
      (answerObj) => {
        return Object.keys(answerObj).map((key) => {
          return {
            [entries.headers.find((headerObj) =>
              Object.keys(headerObj).includes(key)
            )[key]]: answerObj[key],
          };
        })[0];
      }
    );

    return Object.assign(
      {
        'Vastauksen tunniste': Number(Object.keys(submission)[0]),
      },
      {
        Aikaleima: moment(submission.timeStamp).format('DD-MM-YYYY, HH:mm'),
      },
      ...answers
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

  return answerEntriesToCSV(await entriesToCSVFormat(rows));
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
async function getAnswerDBEntries(surveyId: number): Promise<AnswerEntry[]> {
  const rows = (await getDb().manyOrNone(
    `
    SELECT * FROM 
      (SELECT 
          ae.submission_id,
          ae.section_id,
          ae.value_text, 
          ae.value_option_id, 
          public.ST_AsGeoJSON(public.ST_Transform(ae.value_geometry, 3067))::json as value_geometry,
          ae.value_numeric,
          ae.value_json,
          sub.created_at
      FROM data.answer_entry ae 
      LEFT JOIN data.submission sub ON ae.submission_id = sub.id
      WHERE sub.survey_id = $1) AS temp1 
        LEFT JOIN 
          (SELECT 
            ps.id,
            ps.idx as section_index,
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
  return dbAnswerEntryRowsToAnswerEntries(rows);
}

/**
 * Format different answer entry types so that they are presentable for the CSV
 * @param questionType
 * @param entryRow
 * @param optionTexts
 * @returns
 */
function formatAnswerType(
  questionType: string,
  entryRow: AnswerEntry,
  optionTexts: DBOptionTextRow
): string | number | [] {
  switch (questionType) {
    case 'free-text':
      return entryRow.valueText.replace(textSeparator, separatorEscape);
    case 'radio':
    case 'checkbox':
      // Nullish coalescing handles the 'something else' kind of answer
      return (
        optionTexts[entryRow.valueOptionId]?.replace(
          textSeparator,
          separatorEscape
        ) ?? entryRow.valueText.replace(textSeparator, separatorEscape)
      );
    case 'numeric':
    case 'slider':
      return entryRow.valueNumeric;
    case 'sorting':
      return entryRow.valueJson.reduce(
        (prevValue, currentValue, answerIndex) => {
          return [
            ...prevValue,
            {
              [`${entryRow.sectionId}-s${answerIndex}`]:
                optionTexts[Number(currentValue)],
            },
          ];
        },
        [] as any
      );
    case 'matrix':
      return entryRow.valueJson.reduce(
        (prevAnswers, currentAnswer, answerIndex) => {
          return [
            ...prevAnswers,
            {
              [`${entryRow.sectionId}-m${answerIndex}`]:
                entryRow.details.classes[Number(currentAnswer)]['fi'],
            },
          ];
        },
        [] as any
      );
    default:
      return null;
  }
}

/**
 * Convert DB query rows into json format to be used for the CSV parser
 * @param answerEntries
 * @returns
 */
async function entriesToCSVFormat(
  answerEntries: AnswerEntry[]
): Promise<CSVJson> {
  if (!answerEntries) return;

  const optionTexts = await getDb().manyOrNone(
    `
      SELECT * FROM data.option;
    `
  );

  const refinedOptionTexts = optionTexts.reduce((prevValue, currentValue) => {
    return {
      ...prevValue,
      [Number(currentValue['id'])]: currentValue?.text?.['fi'],
    };
  }, {});

  let checkBoxIndex = 0;
  const referenceSubmissionID = answerEntries[0].submissionId;
  return answerEntries.reduce((prevValue, currentValue) => {
    let customHeaders = [];
    // Don't include geometry entries on the CSV
    if (currentValue.valueGeometry) return prevValue;

    const answerEntry = formatAnswerType(
      currentValue.type,
      currentValue,
      refinedOptionTexts
    );

    // If question is a matrix question, create 'n' new headers where n is the number of question rows in the matrix
    customHeaders = currentValue.details?.subjects?.reduce(
      (prevHeaders, currentMatrixSubject, subjectIndex) => {
        return [
          ...prevHeaders,
          {
            [`${currentValue.sectionId}-m${subjectIndex}`]: `${currentValue.title?.fi}_${currentMatrixSubject['fi']}`,
          },
        ];
      },
      []
    );

    // Answer types 'checkbox' and 'sorting' need a subheader as there will be multiple rows on the csv for these answer types
    let sectionSubmissionKey = currentValue.sectionId.toString();
    let headerTitle;
    if (currentValue.type === 'checkbox') {
      sectionSubmissionKey += `-${checkBoxIndex}`;
      headerTitle = `${currentValue.title?.fi}_${checkBoxIndex + 1}.`;
      ++checkBoxIndex;
    } else if (currentValue.type === 'sorting') {
      customHeaders = currentValue.valueJson.map((_, index) => ({
        [`${sectionSubmissionKey}-s${index}`]: `${currentValue.title?.fi}_${
          index + 1
        }.`,
      }));
    } else {
      checkBoxIndex = 0;
      headerTitle = currentValue.title?.fi;
    }

    const existingSubmissionIndex = []
      .concat(
        prevValue?.submissions?.map((submissionObj) =>
          Object.keys(submissionObj)
        )
      )
      .map((submissionString) => parseInt(submissionString))
      .indexOf(currentValue.submissionId);

    let submission = {
      [currentValue.submissionId]: [],
      timeStamp: currentValue.createdAt,
    };
    if (existingSubmissionIndex !== -1) {
      // Get previous entries under the submission
      submission = prevValue.submissions.splice(existingSubmissionIndex, 1)[0];
    }

    // Add current answer entry under the submission. Matrix and sorting questions behave a bit differently
    if (currentValue.type === 'matrix') {
      submission[currentValue.submissionId].push(...(answerEntry as any));
    } else if (currentValue.type === 'sorting') {
      submission[currentValue.submissionId].push(...(answerEntry as any));
    } else {
      submission[currentValue.submissionId].push({
        [sectionSubmissionKey]: answerEntry,
      });
    }

    return {
      // Headers are objects { [sectionID]: sectionTitle }: we have to find out if a header object
      // with current sectionId already exists in the headers array
      headers:
        referenceSubmissionID === currentValue.submissionId
          ? [
              ...(prevValue?.headers ? prevValue.headers : []),
              ...(currentValue.type === 'matrix' ||
              currentValue.type === 'sorting'
                ? customHeaders
                : [
                    ...([]
                      .concat(
                        ...prevValue?.headers?.map((headerObj) =>
                          Object.keys(headerObj)
                        )
                      )
                      .map((headerString) => headerString)
                      .includes(sectionSubmissionKey)
                      ? []
                      : [{ [sectionSubmissionKey]: headerTitle }]),
                  ]),
            ]
          : prevValue.headers,
      // If
      submissions: [...(prevValue?.submissions ?? []), submission],
    };
  }, {} as CSVJson);
}
