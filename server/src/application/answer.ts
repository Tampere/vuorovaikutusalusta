import { getDb } from '@src/database';
import { parseAsync } from 'json2csv';
import ogr2ogr from 'ogr2ogr';
import internal from 'stream';
import { LocalizedText } from '@interfaces/survey';
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
  parent_section?: number;
  section_index: number;
  submission_id: number;
  title: LocalizedText;
  type: string;
  value_geometry: GeoJSON.Point | GeoJSON.LineString | GeoJSON.Polygon;
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
    allowCustomAnswer?: boolean;
  };
  sectionId: number;
  parentSectionId?: number;
  sectionIndex: number;
  submissionId: number;
  title: LocalizedText;
  type: string;
  valueGeometry: GeoJSON.Point | GeoJSON.LineString | GeoJSON.Polygon;
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
    parentSectionId: row?.parent_section,
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
  const features = entries
    .filter((entry) => entry.valueGeometry)
    .map((entry) => ({
      type: 'Feature',
      geometry: {
        type: entry.valueGeometry.type,
        coordinates: entry.valueGeometry.coordinates,
      },
      properties: {
        submissionId: entry.submissionId,
        timeStamp: entry.createdAt,
        questionId: entry.sectionId,
        questionTitle: entry.title?.fi,
      },
    }));

  return {
    type: 'FeatureCollection',
    features: features,
    crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:EPSG::3067' } },
  };
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
            )?.[key]]: answerObj[key],
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

  // The following is mainly to get answers via CSV from test surveys whose structure change:
  // if the structure of the survey changes between answers
  // all submissions have to be gone through and nullish answers are to be added for the questions
  // that the submission didn't previously have.
  const everyQuestionTopic = Array.from(
    new Set([].concat(...data.map((submission) => Object.keys(submission))))
  );

  let questionTopicsToAdd = [];
  data.forEach((submission) => {
    questionTopicsToAdd = [];
    everyQuestionTopic.map((topic) => {
      if (!Object.keys(submission).includes(topic)) {
        questionTopicsToAdd.push(topic);
      }
    });
    questionTopicsToAdd.map((topic) => {
      submission[topic] = '';
    });
  });

  try {
    const csv = await parseAsync(data.sort(sortByTimestamp), {
      headers,
    } as any);
    return csv;
  } catch (err) {
    console.error(err);
  }
}

function sortByTimestamp(a, b) {
  return a['Vastauksen tunniste'] > b['Vastauksen tunniste'] ? 1 : -1;
}

/**
 * Handler function for downloading csv file
 * @param surveyId
 * @returns Promise resolving to csv formatted string
 */
export async function getCSVFile(surveyId: number): Promise<string> {
  const rows = await getAnswerDBEntries(surveyId);
  if (!rows) return null;

  return answerEntriesToCSV(await entriesToCSVFormat(rows, surveyId));
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
    options: ['-nln', 'answer-layer'],
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
  isSectionPreviouslyAnswered: boolean,
  answersToSameQuestion: number,
  optionTexts: DBOptionTextRow
): string | number | [] | {} {
  switch (questionType) {
    case 'free-text':
      return entryRow.valueText.replace(textSeparator, separatorEscape);
    case 'radio':
    case 'checkbox':
    case 'grouped-checkbox':
      // If there is a radio/checkbox/grouped-checkbox answer present, it is interpretet as '1' marking that the option was selected
      // 'something else' answers are displayed as the answer itself
      return entryRow.valueOptionId
        ? 1
        : entryRow.valueText
        ? entryRow.valueText
        : '';
    case 'numeric':
    case 'slider':
      return entryRow.valueNumeric;
    case 'sorting': {
      return entryRow.valueJson.map((value, index) => {
        return {
          [`${entryRow.sectionId}-s${index}${
            isSectionPreviouslyAnswered ? `-sub${answersToSameQuestion}` : ''
          }`]: value ? optionTexts[`-${value}`] : '',
        };
      });
    }
    case 'matrix':
      return entryRow.valueJson.map((value, index) => {
        // Handle empty answers and 'don't know' answers along with the proper answers
        const answer = !value
          ? ''
          : Number(value) === -1
          ? 'EOS'
          : entryRow.details.classes[Number(value)]['fi'];

        return {
          [`${entryRow.sectionId}-m${index}${
            isSectionPreviouslyAnswered ? `-sub${answersToSameQuestion}` : ''
          }`]: answer,
        };
      });
    default:
      return null;
  }
}

/**
 * Get option texts for the given survey
 * @param surveyId
 * @returns
 */
async function getOptionTexts(surveyId: number) {
  const optionTexts = await getDb().manyOrNone(
    `
    SELECT 
      opt.id,
      opt.idx as option_index,
      opt.text,
      ps.id as section_id,
      ps.title,
      ps.type,
      og.name as group_name,
      og.idx as group_index
    FROM data.option opt
      LEFT JOIN data.option_group og ON opt.group_id = og.id
      LEFT JOIN data.page_section ps ON opt.section_id = ps.id
      LEFT JOIN data.survey_page sp ON ps.survey_page_id = sp.id
      LEFT JOIN data.survey s ON sp.survey_id = s.id WHERE s.id = $1
      ORDER BY group_index, opt.idx, opt.id;
    `,
    [surveyId]
  );

  if (!optionTexts) return [];

  return optionTexts.reduce((prevValue, currentValue) => {
    const previousSection = prevValue
      ?.map((optionObj) => optionObj.sectionId)
      .indexOf(currentValue.section_id);

    const text =
      currentValue.type === 'grouped-checkbox' && currentValue.group_name
        ? `${currentValue.group_name['fi']} - ${currentValue?.text?.['fi']}`
        : currentValue?.text?.['fi'];

    // Grouped checkbox questions will be ordered on the CSV by 1) group 2) index inside group
    const optionText =
      currentValue.type === 'grouped-checkbox'
        ? {
            [`${currentValue.group_index}${currentValue.option_index}-${currentValue.id}`]:
              text,
          }
        : { [`-${currentValue.id}`]: text };

    if (previousSection !== -1) {
      const temp = [...prevValue];
      temp[previousSection].sectionTexts = {
        ...temp[previousSection].sectionTexts,
        ...optionText,
      };
      return temp;
    } else {
      return [
        ...prevValue,
        {
          sectionId: currentValue.section_id,
          sectionTexts: {
            ...optionText,
          },
        },
      ];
    }
  }, []);
}

/**
 * Convert DB query rows into json format to be used for the CSV parser
 * @param answerEntries
 * @returns
 */
async function entriesToCSVFormat(
  answerEntries: AnswerEntry[],
  surveyId: number
): Promise<CSVJson> {
  if (!answerEntries) return;

  const refinedOptionTexts = (await getOptionTexts(surveyId)) ?? [];

  let checkboxInitialised = false;
  let previousSubmissionId = answerEntries[0].submissionId;
  let previousSectionId = answerEntries[0].sectionId;
  let customHeaders = [];
  let previousSectionIDs = [];
  let isSectionPreviouslyAnswered = false;
  let answersToSameQuestion = 0;
  return answerEntries.reduce((prevValue, currentValue) => {
    if (previousSubmissionId !== currentValue.submissionId) {
      previousSectionIDs = [];
      answersToSameQuestion = 0;
      isSectionPreviouslyAnswered = false;
      checkboxInitialised = false;
      previousSubmissionId = currentValue.submissionId;
    }
    if (previousSectionId !== currentValue.sectionId) {
      checkboxInitialised = false;
      previousSectionId = currentValue.sectionId;
    }

    // Question has already been answered under the current submission
    if (
      previousSectionIDs.includes(currentValue.sectionId) &&
      previousSubmissionId === currentValue.submissionId
    ) {
      if (currentValue.type === 'map') {
        checkboxInitialised = false;
        isSectionPreviouslyAnswered = true;
        ++answersToSameQuestion;
      }
    } else {
      previousSectionIDs.push(currentValue.sectionId);
      answersToSameQuestion = 0;
      isSectionPreviouslyAnswered = false;
    }

    // Don't include geometry entries on the CSV
    if (currentValue.type === 'map') return prevValue;

    // Format CSV headers for question types that will generate multiple columns into the CSV file
    let checkboxOptionTexts;
    let sectionSubmissionKey = currentValue.sectionId.toString();
    switch (currentValue.type) {
      case 'matrix':
        // For matrix questions, create 'n' new headers where n is the number of question rows in the matrix
        customHeaders = currentValue.details?.subjects?.reduce(
          (prevHeaders, currentMatrixSubject, subjectIndex) => {
            return [
              ...prevHeaders,
              {
                [`${currentValue.sectionId}-m${subjectIndex}${
                  isSectionPreviouslyAnswered
                    ? `-sub${answersToSameQuestion}`
                    : ''
                }`]: `${currentValue.title?.fi}_${currentMatrixSubject['fi']}${
                  isSectionPreviouslyAnswered
                    ? ' - ' + (answersToSameQuestion + 1) + '. karttavastaus'
                    : ''
                }`,
              },
            ];
          },
          []
        );
        break;
      case 'radio':
      case 'checkbox':
        // Custom headers for checkbox and radio questions
        checkboxOptionTexts = refinedOptionTexts?.find(
          (optionTextObj) => optionTextObj.sectionId === currentValue.sectionId
        ).sectionTexts;
        customHeaders = Object.keys(checkboxOptionTexts).map((key) => ({
          [`${currentValue.sectionId}-cr${key}${
            isSectionPreviouslyAnswered ? `-sub${answersToSameQuestion}` : ''
          }`]: `${currentValue.title?.fi}_${checkboxOptionTexts[key]}${
            isSectionPreviouslyAnswered
              ? ' - ' + (answersToSameQuestion + 1) + '. karttavastaus'
              : ''
          }`,
        }));
        // Add header for additional freetext answer, if it was allowed
        if (currentValue.details.allowCustomAnswer) {
          customHeaders.push({
            [`${currentValue.sectionId}-cr000${
              isSectionPreviouslyAnswered ? `-sub${answersToSameQuestion}` : ''
            }`]: `${currentValue.title?.fi}${
              isSectionPreviouslyAnswered
                ? ' - ' + (answersToSameQuestion + 1) + '. karttavastaus'
                : ''
            }_joku muu, mikä?`,
          });
        }

        sectionSubmissionKey += `-cr${
          currentValue.valueOptionId ? `-${currentValue.valueOptionId}` : '000'
        }${isSectionPreviouslyAnswered ? `-sub${answersToSameQuestion}` : ''}`;
        break;
      case 'grouped-checkbox': {
        // Custom headers for grouped-checkbox questions
        checkboxOptionTexts = refinedOptionTexts?.find(
          (optionTextObj) => optionTextObj.sectionId === currentValue.sectionId
        ).sectionTexts;
        customHeaders = Object.keys(checkboxOptionTexts).map((key) => ({
          [`${currentValue.sectionId}-gc${key}${
            isSectionPreviouslyAnswered ? `-sub${answersToSameQuestion}` : ''
          }`]: `${checkboxOptionTexts[key]}${
            isSectionPreviouslyAnswered
              ? ' - ' + (answersToSameQuestion + 1) + '. karttavastaus'
              : ''
          }`,
        }));
        const indexOfOptionId = Object.keys(checkboxOptionTexts)
          .map((key: string) => key.split('-')[1])
          .indexOf(currentValue.valueOptionId?.toString());
        sectionSubmissionKey += `-gc${
          currentValue.valueOptionId
            ? Object.keys(checkboxOptionTexts)[indexOfOptionId]
            : '000'
        }${isSectionPreviouslyAnswered ? `-sub${answersToSameQuestion}` : ''}`;
        break;
      }
      case 'sorting':
        customHeaders = currentValue.valueJson.map((_, index) => ({
          [`${sectionSubmissionKey}-s${index}${
            isSectionPreviouslyAnswered ? `-sub${answersToSameQuestion}` : ''
          }`]: `${currentValue.title?.fi}_${index + 1}.${
            isSectionPreviouslyAnswered
              ? ' - ' + (answersToSameQuestion + 1) + '. karttavastaus'
              : ''
          }`,
        }));
        break;
      default:
        sectionSubmissionKey += `${
          isSectionPreviouslyAnswered ? `-sub${answersToSameQuestion}` : ''
        }`;
        break;
    }

    // Format submission
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

    const answerEntry = formatAnswerType(
      currentValue.type,
      currentValue,
      isSectionPreviouslyAnswered,
      answersToSameQuestion,
      refinedOptionTexts?.find(
        (optionTextObj) => optionTextObj.sectionId === currentValue.sectionId
      )?.sectionTexts
    );

    switch (currentValue.type) {
      case 'matrix':
      case 'sorting':
        submission[currentValue.submissionId].push(...(answerEntry as any));
        break;
      case 'grouped-checkbox':
      case 'checkbox': {
        // Initialise submission with checkbox dummy answers, i.e. add 'null' answers for each checkbox option
        if (!checkboxInitialised) {
          const checkBoxTopics = customHeaders.map(
            (header) => Object.keys(header)[0]
          );
          const checkBoxDummyAnswers = checkBoxTopics.map((topic) => ({
            [topic]: '',
          }));
          submission[currentValue.submissionId].push(...checkBoxDummyAnswers);
          checkboxInitialised = true;
        }
        // Find the checkbox topic that the answer entry actually belongs to
        const checkboxAnswerIndex = submission[currentValue.submissionId]
          .map((sectionObj) => Object.keys(sectionObj)[0])
          .indexOf(sectionSubmissionKey);
        submission[currentValue.submissionId][checkboxAnswerIndex] = {
          [sectionSubmissionKey]: answerEntry,
        };
        break;
      }
      case 'radio': {
        // Initialise submission with radio dummy answers, i.e. add 'null' answers for each radio option
        const radioDummyAnswers = customHeaders
          .map((header) => Object.keys(header)[0])
          .map((topic) => ({
            [topic]: '',
          }));
        submission[currentValue.submissionId].push(...radioDummyAnswers);

        // Find the radio topic that the answer entry actually belongs to
        const radioAnswerIndex = submission[currentValue.submissionId]
          .map((sectionObj) => Object.keys(sectionObj)[0])
          .indexOf(sectionSubmissionKey);
        submission[currentValue.submissionId][radioAnswerIndex] = {
          [sectionSubmissionKey]: answerEntry,
        };
        break;
      }
      default:
        submission[currentValue.submissionId].push({
          [sectionSubmissionKey]: answerEntry,
        });
        break;
    }

    const headerAlreadyExists = []
      .concat(prevValue?.headers?.map((headerObj) => Object.keys(headerObj)[0]))
      .includes(sectionSubmissionKey);

    return {
      // Headers are objects { [sectionID]: sectionTitle }: we have to find out if a header object
      // with current sectionId already exists in the headers array
      headers: !headerAlreadyExists
        ? [
            ...(prevValue?.headers ? prevValue.headers : []),
            ...([
              'matrix',
              'sorting',
              'checkbox',
              'grouped-checkbox',
              'radio',
            ].includes(currentValue.type)
              ? customHeaders
              : [
                  ...(headerAlreadyExists
                    ? []
                    : [
                        {
                          [sectionSubmissionKey]: currentValue?.title?.fi
                            ? `${currentValue.title.fi}${
                                isSectionPreviouslyAnswered
                                  ? ' - ' +
                                    (answersToSameQuestion + 1) +
                                    '. karttavastaus'
                                  : ''
                              }`
                            : '',
                        },
                      ]),
                ]),
          ]
        : prevValue.headers,
      submissions: [...(prevValue?.submissions ?? []), submission],
    };
  }, {} as CSVJson);
}
