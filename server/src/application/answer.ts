import { FileAnswer, LanguageCode, LocalizedText } from '@interfaces/survey';
import { getDb } from '@src/database';
import { readFileSync, rmSync, writeFile } from 'fs';
import moment from 'moment';
import ogr2ogr from 'ogr2ogr';
import useTranslations from '@src/translations/useTranslations';

const tr = useTranslations('fi');

/**
 * Interface for answer entry db row
 */
interface DBAnswerEntry {
  answer_id: number;
  page_index: number;
  details: {
    subjects?: LocalizedText[];
    classes?: LocalizedText[];
  };
  section_id: number;
  parent_section?: number;
  parent_entry_id?: number;
  section_index: number;
  submission_id: number;
  language: LanguageCode;
  title: LocalizedText;
  type: string;
  value_geometry: GeoJSON.Point | GeoJSON.LineString | GeoJSON.Polygon;
  value_text: string;
  value_json: JSON[];
  value_option_id: number;
  value_numeric: number;
  created_at: Date;
  option_text: string;
  option_group_index: number;
}

/**
 * Interface for data.answer_entry file -entries
 */
interface DBFileEntry {
  value_file: string;
  value_file_name: string;
  submission_id: number;
}

interface AnswerEntry {
  answerId: number;
  pageIndex: number;
  details: {
    subjects?: LocalizedText[];
    classes?: LocalizedText[];
    allowCustomAnswer?: boolean;
  };
  sectionId: number;
  parentSectionId?: number;
  parentEntryId?: number;
  sectionIndex: number;
  submissionId: number;
  submissionLanguage: LanguageCode;
  title: LocalizedText;
  type: string;
  valueGeometry: GeoJSON.Point | GeoJSON.LineString | GeoJSON.Polygon;
  valueText: string;
  valueJson: JSON[];
  valueOptionId: number;
  valueNumeric: number;
  createdAt: Date;
  groupIndex: number;
  optionIndex: number;
  optionText?: string;
}

interface CheckboxOptions {
  text: LocalizedText;
  sectionId: number;
}

/**
 * Single cell on the CSV
 */
interface TextCell {
  [key: string]: string;
}

/**
 * GeoJSON Feature interface
 */
interface Feature {
  type: string;
  geometry: JSON;
  properties: JSON;
}

/**
 * Interface for the custom JSON format from which the CSV is created
 */
interface CSVJson {
  headers: TextCell[];
  submissions: {
    [key: number]: TextCell[];
    timeStamp: Date;
    submissionLanguage: LanguageCode;
  }[];
}

/**
 * Interface for section details
 */
interface TypeDetails {
  type: string;
  details: JSON;
  optionTexts?: TextCell;
  pageIndex: number;
}

/**
 * Interface for section header
 */
interface SectionHeader {
  optionId: number;
  optionIndex: number;
  text: LocalizedText;
  sectionId: number;
  title: LocalizedText;
  type: string;
  details: JSON;
  parentSection: number;
  groupName: LocalizedText;
  groupIndex: number;
  pageIndex: number;
  sectionIndex: number;
}

/**
 * Convert db answer row to js format
 * @param rows
 * @returns
 */
function dbAnswerEntryRowsToAnswerEntries(rows: DBAnswerEntry[]) {
  if (!rows) return null;

  return rows.map((row) => ({
    answerId: row.answer_id,
    pageIndex: row.page_index,
    details: row.details,
    sectionId: row.section_id,
    parentSectionId: row?.parent_section,
    parentEntryId: row?.parent_entry_id,
    sectionIndex: row.section_index,
    submissionId: row.submission_id,
    submissionLanguage: row?.language,
    title: row.title,
    type: row.type,
    valueGeometry: row.value_geometry,
    valueText: row.value_text,
    valueJson: row.value_json,
    valueOptionId: row.value_option_id,
    valueNumeric: row.value_numeric,
    optionText: row?.option_text,
    createdAt: row.created_at,
    groupIndex: row.option_group_index,
  })) as AnswerEntry[];
}

/**
 * Helper function for converting answer entries into a GeoJSON Feature
 * @param answer
 * @returns
 */
function geometryAnswerToFeature(answer: AnswerEntry) {
  // Some erroneous data might not have a geometry - return null for them to avoid further errors
  if (!answer.valueGeometry) {
    return null;
  }
  return {
    type: 'Feature',
    geometry: {
      type: answer.valueGeometry.type,
      coordinates: answer.valueGeometry.coordinates,
    },
    properties: {
      ['Vastaustunniste']: answer.submissionId,
      ['Aikaleima']: moment(answer.createdAt).format('DD-MM-YYYY, HH:mm'),
      ['Vastauskieli']: tr[answer?.submissionLanguage ?? 'fi'],
      ['Kysymys']: `Sivu ${answer.pageIndex + 1} / Kysymys ${
        answer.sectionIndex + 1
      }: ${answer.title?.['fi'] ?? ''}`,
    },
  };
}

/**
 * Reduce DB query rows to GeoJSON features
 * @param entries DB answer entry rows
 * @returns
 */
function dbEntriesToFeatures(
  entries: AnswerEntry[],
  checkboxOptions: CheckboxOptions[]
) {
  // Sort entries first by submission, then by sectionId
  // Each sectionId instance (separated by submission) will represent a single Feature

  const answersToSubmissions = entries.reduce((submissionGroup, answer) => {
    const { submissionId } = answer;
    submissionGroup[submissionId] = submissionGroup[submissionId] ?? {};
    // If answer doesn't have parentEntryId, it is the parent itself. Store following answers under the parent
    if (!answer.parentEntryId) {
      submissionGroup[submissionId][answer.answerId] =
        geometryAnswerToFeature(answer);
    } else if (submissionGroup[submissionId][answer.parentEntryId]) {
      // Add subquestion answer
      let newAnswer: string;
      let key: string = `Alikysymys ${answer.sectionIndex + 1}: ${
        answer.title?.['fi'] ?? 'Nimetön alikysymys'
      }`;
      const keyOther: string = `${key} - jokin muu, mikä?`;

      switch (answer.type) {
        case 'checkbox':
          // initialize subquestion headers for checkbox question
          checkboxOptions
            .filter((opt) => opt.sectionId === answer.sectionId)
            .forEach((opt) => {
              const questionKey = `${key} - ${opt.text['fi']}`;
              if (
                !submissionGroup[submissionId][answer.parentEntryId].properties[
                  questionKey
                ]
              ) {
                submissionGroup[submissionId][answer.parentEntryId].properties[
                  questionKey
                ] = null;
              }
            });

          if (
            !submissionGroup[submissionId][answer.parentEntryId].properties[
              keyOther
            ]
          ) {
            submissionGroup[submissionId][answer.parentEntryId].properties[
              keyOther
            ] = null;
          }

          newAnswer = answer.optionText?.['fi'] ?? '';
          key = `${key} - ${answer.valueText ? 'jokin muu, mikä?' : newAnswer}`;

          submissionGroup[submissionId][answer.parentEntryId].properties[key] =
            answer.valueText ?? true;
          break;
        default:
          newAnswer =
            answer.valueNumeric ??
            answer.valueText ??
            answer.optionText?.['fi'] ??
            '';

          submissionGroup[submissionId][answer.parentEntryId].properties[key] =
            newAnswer;
      }
    }

    return submissionGroup;
  }, {});

  return Object.values(answersToSubmissions).reduce<Feature[]>(
    (featuresArray, submissionObj) => {
      return [
        ...featuresArray,
        ...Object.values(submissionObj).filter(Boolean),
      ];
    },
    []
  );
}

/**
 * Parses custom CSVJson format into csv
 * @param entries
 * @returns Promise resolving to csv formatted string
 */
async function answerEntriesToCSV(entries: CSVJson): Promise<string> {
  const { submissions, headers } = entries;

  let csvData = `Vastaustunniste,Vastauskieli,Aikaleima,${headers.map(
    (header) => `${Object.values(header)[0]}`
  )}\n`;

  for (let i = 0; i < submissions.length; ++i) {
    // Timestamp + submission language
    csvData += `${Object.keys(submissions[i])[0]},${moment(
      submissions[i].timeStamp
    ).format('DD-MM-YYYY HH:mm')},${submissions[i].submissionLanguage}`;
    csvData += ',';

    headers.forEach((headerObj, index) => {
      for (const [headerKey, headerValue] of Object.entries(headerObj)) {
        csvData += Object.values(submissions[i])[0].hasOwnProperty(headerKey)
          ? Object.values(submissions[i])[0][headerKey]
          : '';

        csvData += ',';
      }
    });

    csvData = csvData.substring(0, csvData.length - 1);

    // Newline
    csvData += '\n';
  }

  return csvData;
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
export async function getGeoPackageFile(surveyId: number): Promise<Buffer> {
  const rows = await getGeometryDBEntries(surveyId);
  const checkboxOptions = await getCheckboxOptionsFromDB(surveyId);

  if (!rows || !checkboxOptions) return null;

  const features = dbEntriesToFeatures(rows, checkboxOptions);
  // There could be rows where the parent map answer (erroneously) has null geometry - if there are no valid map answers, return null from here too
  if (!features.length) return null;

  // Group features by question to add them to separate layers
  const featuresByQuestion = features.reduce((questions, feature) => {
    const { properties } = feature;
    const questionTitle = properties['Kysymys'];
    questions[questionTitle] = questions[questionTitle] ?? [];
    questions[questionTitle].push(feature);
    return questions;
  }, {} as { [key: string]: Feature[] });

  const tmpFilePath = `/tmp/geopackage_${Date.now()}.gpkg`;

  const [[firstQuestion, firstFeatures], ...rest] =
    Object.entries(featuresByQuestion);

  // The first question needs to be created first - the remaining questions will be added to it via -update
  // Tried to conditionally add the "-update" flag but there was some race condition and I couldn't figure it out
  await ogr2ogr(
    {
      type: 'FeatureCollection',
      features: firstFeatures,
      crs: {
        type: 'name',
        properties: { name: 'urn:ogc:def:crs:EPSG::3067' },
      },
    },
    {
      format: 'GPKG',
      destination: tmpFilePath,
      options: ['-nln', firstQuestion],
    }
  );

  for (const [question, features] of rest) {
    await ogr2ogr(
      {
        type: 'FeatureCollection',
        features,
        crs: {
          type: 'name',
          properties: { name: 'urn:ogc:def:crs:EPSG::3067' },
        },
      },
      {
        format: 'GPKG',
        destination: tmpFilePath,
        options: ['-nln', question, '-update'],
      }
    );
  }

  // Read the file contents and remove it from the disk
  const file = readFileSync(tmpFilePath);
  rmSync(tmpFilePath);
  return file;
}

/**
 * Handler function for downloading survey attachments
 * @param surveyId
 */
export async function getAttachments(surveyId: number): Promise<FileAnswer[]> {
  const rows = await getAttachmentDBEntries(surveyId);

  if (!rows) return null;

  return attachmentEntriesToFiles(rows);
}

async function getCheckboxOptionsFromDB(surveyId: number) {
  const rows = await getDb().manyOrNone(
    `SELECT 
        opt.TEXT, 
        opt.section_id as "sectionId"
      FROM data.option opt 
        LEFT JOIN data.page_section ps ON opt.section_id = ps.id
        LEFT JOIN data.survey_page sp ON ps.survey_page_id = sp.id 
        LEFT JOIN data.survey s ON sp.survey_id = s.id 
      WHERE s.id = $1;`,
    [surveyId]
  );
  if (!rows || rows.length === 0) return null;
  return rows;
}

async function getAttachmentDBEntries(surveyId: number) {
  const rows = await getDb().manyOrNone(
    `
    SELECT * FROM
      (SELECT
          ae.submission_id,
          ae.section_id,
          ae.value_file,
          ae.value_file_name
      FROM data.answer_entry ae
      LEFT JOIN data.submission sub ON ae.submission_id = sub.id
      WHERE sub.survey_id = $1 AND ae.value_file IS NOT NULL AND sub.unfinished_token IS NULL) AS temp1
        LEFT JOIN
          (SELECT
            ps.id
          FROM data.page_section ps
          LEFT JOIN data.survey_page sp ON ps.survey_page_id = sp.id
          LEFT JOIN data.survey s ON sp.survey_id = s.id WHERE s.id = $1 ORDER BY ps.id) AS temp2
        ON temp1.section_id = temp2.id;
    `,
    [surveyId]
  );

  if (!rows || rows.length === 0) return null;
  return rows;
}

/**
 * Convert DB rows to file objects
 * @param rows
 * @returns
 */
function attachmentEntriesToFiles(rows: DBFileEntry[]) {
  return rows.map((row) => ({
    fileName: `vastausnro_${row.submission_id}.${row.value_file_name}`,
    fileString: row.value_file,
  }));
}

/**
 * Get all DB answer entries for the given survey id
 * @param surveyId
 * @returns
 */
async function getAnswerDBEntries(surveyId: number): Promise<AnswerEntry[]> {
  const rows = (await getDb().manyOrNone(
    `
    SELECT
      ae.submission_id,
      ae.section_id,
      ae.value_text,
      ae.value_option_id,
      ae.value_numeric,
      ae.value_json,
      ps.type,
      ps.idx as section_index,
      og.idx as option_group_index,
      sub.created_at,
      sub.language
        FROM data.answer_entry ae
        LEFT JOIN data.submission sub ON ae.submission_id = sub.id
        LEFT JOIN data.page_section ps ON ps.id = ae.section_id
        LEFT JOIN data.option opt ON ps.id = opt.section_id
        LEFT JOIN data.option_group og ON opt.group_id = og.id
        LEFT JOIN data.survey_page sp ON ps.survey_page_id = sp.id
        LEFT JOIN data.survey s ON sp.survey_id = s.id
      WHERE ps.type <> 'map'
        AND ps.type <> 'attachment'
        AND ps.type <> 'document'
        AND ps.type <> 'text'
        AND ps.type <> 'image'
        AND sub.unfinished_token IS NULL
        AND ps.parent_section IS NULL AND sub.survey_id = $1;
    `,
    [surveyId]
  )) as DBAnswerEntry[];

  if (!rows || rows.length === 0) return null;
  return dbAnswerEntryRowsToAnswerEntries(rows);
}

/**
 * Get all DB answer entries for the given survey id
 * @param surveyId
 * @returns
 */
async function getGeometryDBEntries(surveyId: number): Promise<AnswerEntry[]> {
  const rows = (await getDb().manyOrNone(
    `SELECT
      ae.submission_id,
      ae.id as answer_id,
      ae.section_id,
      ae.value_text,
      ae.value_option_id,
      opt.text as option_text,
      public.ST_AsGeoJSON(public.ST_Transform(ae.value_geometry, 3067))::json as value_geometry,
      ae.value_numeric,
      ae.value_json,
      ae.parent_entry_id,
      sp.idx as page_index,
      ps.idx as section_index,
      ps.type,
      ps.title,
      ps.details,
      ps.parent_section,
      sub.created_at,
      sub.language
        FROM data.answer_entry ae
        LEFT JOIN data.submission sub ON ae.submission_id = sub.id
        LEFT JOIN data.page_section ps ON ps.id = ae.section_id
        LEFT JOIN data.survey_page sp ON ps.survey_page_id = sp.id
        LEFT JOIN data.survey s ON sp.survey_id = s.id
        LEFT JOIN data.option opt ON opt.id = ae.value_option_id
        WHERE (type = 'map' OR parent_section IS NOT NULL)
          AND sub.unfinished_token IS NULL
          AND sub.survey_id = $1
          ORDER BY submission_id, ae.parent_entry_id ASC NULLS FIRST, section_index`,
    [surveyId]
  )) as DBAnswerEntry[];

  if (!rows || rows.length === 0) return null;
  return dbAnswerEntryRowsToAnswerEntries(rows);
}

/**
 * Get survey section, options and optiongroups for CSV headers
 * @param surveyId
 * @returns
 */
const getSectionHeaders = async (surveyId: number) =>
  getDb().manyOrNone<SectionHeader>(
    `
  SELECT
    opt.id as "optionId",
    opt.idx as "optionIndex",
    opt.text,
    ps.id as "sectionId",
    ps.idx as "sectionIndex",
    ps.title,
    ps.type,
    ps.details,
    ps.parent_section as "parentSection",
    og.name as "groupName",
    og.idx as "groupIndex",
    sp.idx as "pageIndex"
  FROM data.page_section ps
    LEFT JOIN data.option opt ON ps.id = opt.section_id
    LEFT JOIN data.option_group og ON opt.group_id = og.id
    LEFT JOIN data.survey_page sp ON ps.survey_page_id = sp.id
    LEFT JOIN data.survey s ON sp.survey_id = s.id
    WHERE s.id = $1
      AND ps.type <> 'map'
      AND ps.type <> 'attachment'
      AND ps.type <> 'document'
      AND ps.type <> 'text'
      AND ps.type <> 'image'
      AND ps.parent_section IS NULL
    ORDER BY "pageIndex", "sectionIndex", og.idx, opt.idx;
`,
    [surveyId]
  );

/**
 * Create key for CSV headers and submissions
 * @pageIndex pageIndex
 * @param sectionIndex
 * @param groupIndex
 * @param optionIndex
 * @returns
 */
function getHeaderKey(
  pageIndex: number,
  sectionIndex: number,
  groupIndex?: number,
  optionIndex?: number
) {
  return `${pageIndex}-${sectionIndex}${groupIndex ? '-' + groupIndex : ''}${
    optionIndex ? '-' + optionIndex : ''
  }`;
}

/**
 * Format headers for the CSV file
 * @param sectionMetadata
 * @returns
 */
function createCSVHeaders(sectionMetadata: SectionHeader[]) {
  const indexesToSections = sectionMetadata.reduce((group, section) => {
    const { pageIndex, sectionIndex } = section;
    group[`${pageIndex}-${sectionIndex}`] =
      group[`${pageIndex}-${sectionIndex}`] ?? [];
    group[`${pageIndex}-${sectionIndex}`].push(section);
    return group;
  }, {});

  const allHeaders = [];
  Object.keys(indexesToSections).map((indexKey) => {
    const sectionGroup = indexesToSections[indexKey];
    const sectionHead = sectionGroup[0];
    switch (sectionHead.type) {
      case 'radio':
      case 'checkbox':
      case 'grouped-checkbox':
        sectionGroup.forEach((section) => {
          const key = getHeaderKey(
            section.pageIndex,
            section.sectionIndex,
            section.groupIndex,
            section.optionId
          );

          allHeaders.push({
            [key]: `s${section.pageIndex}k${section.sectionIndex}: ${
              section.title?.['fi'] ?? ''
            }${section.groupName ? ' - ' + section.groupName['fi'] : ''} - ${
              section.text?.['fi'] ?? ''
            }`,
          });
        });
        if (sectionHead.details.allowCustomAnswer) {
          const key = getHeaderKey(
            sectionHead.pageIndex,
            sectionHead.sectionIndex,
            null,
            -1
          );
          allHeaders.push({
            [key]: `s${sectionHead.pageIndex + 1}k${
              sectionHead.sectionIndex + 1
            }: ${sectionHead.title['fi']} - joku muu, mikä?`,
          });
        }
        break;
      case 'matrix':
        sectionHead.details.subjects.forEach(
          (subject: LocalizedText, idx: number) => {
            const key = getHeaderKey(
              sectionHead.pageIndex,
              sectionHead.sectionIndex,
              idx + 1
            );
            allHeaders.push({
              [key]: `s${sectionHead.pageIndex + 1}k${
                sectionHead.sectionIndex + 1
              }: ${sectionHead.title['fi']} - ${subject['fi']}`,
            });
          }
        );
        break;
      case 'sorting':
        sectionGroup.forEach((section) => {
          const key = getHeaderKey(
            section.pageIndex,
            section.sectionIndex,
            null,
            section.optionIndex + 1
          );
          allHeaders.push({
            [key]: `s${section.pageIndex + 1}k${section.sectionIndex + 1}: ${
              section.title['fi']
            } - ${section.optionIndex + 1}.`,
          });
        });
        break;
      // numeric, free-text, slider
      default:
        allHeaders.push({
          [getHeaderKey(sectionHead.pageIndex, sectionHead.sectionIndex)]:
            `s${sectionHead.pageIndex + 1}k${sectionHead.sectionIndex + 1}: ${
              sectionHead.title?.['fi']
            }` ?? '',
        });
    }
  });
  return allHeaders;
}

/**
 * Create CSV submissions from grouped submission data
 * @param answerEntries
 * @param sectionMetadata
 * @returns
 */
function createCSVSubmissions(
  answerEntries: AnswerEntry[],
  sectionMetadata: SectionHeader[]
) {
  const sectionIdToDetails = sectionMetadata.reduce((group, section) => {
    const { sectionId, optionId, text } = section;
    group[sectionId] = {
      type: section.type,
      details: section.details,
      optionTexts: {
        ...(group[sectionId]?.optionTexts ?? {}),
        [optionId]: text?.['fi'] ?? '',
      },
      pageIndex: section.pageIndex,
    } as TypeDetails;
    return group;
  }, {});

  // Group answer entries by submissionId
  const answersToSubmissionId = answerEntries.reduce((group, answer) => {
    const { submissionId } = answer;
    group[submissionId] = group[submissionId] ?? [];
    group[submissionId].push(answer);
    return group;
  }, {});

  const allAnswers = [];

  Object.entries(answersToSubmissionId).forEach(([key, value]) => {
    allAnswers.push({
      [key]: submissionAnswersToJson(
        value as AnswerEntry[],
        sectionIdToDetails
      ),
      timeStamp: value[0].createdAt,
      submissionLanguage: value[0].submissionLanguage,
    });
  });

  return allAnswers;
}

/**
 * Create JSON formatted answers for each answer under a submission
 * @param answerEntries
 * @param sectionIdToDetails
 * @returns
 */
function submissionAnswersToJson(
  answerEntries: AnswerEntry[],
  sectionIdToDetails
) {
  const ret = {};

  answerEntries.forEach((answer) => {
    const sectionDetails = sectionIdToDetails[answer.sectionId];

    switch (sectionDetails.type) {
      case 'radio':
      case 'checkbox':
      case 'grouped-checkbox':
        ret[
          getHeaderKey(
            sectionDetails.pageIndex,
            answer.sectionIndex,
            answer.groupIndex,
            answer.valueOptionId ?? -1
          )
        ] = answer.valueOptionId ? 1 : answer.valueText ?? '';
        break;
      case 'matrix':
        sectionDetails.details.subjects.forEach((_subject, index) => {
          const classIndex = answer.valueJson?.[index];
          ret[
            getHeaderKey(
              sectionDetails.pageIndex,
              answer.sectionIndex,
              index + 1
            )
          ] = !classIndex
            ? ''
            : Number(classIndex) === -1
            ? 'EOS'
            : sectionDetails.details.classes[Number(classIndex)]['fi'];
        });
        break;
      case 'sorting':
        answer.valueJson?.forEach((optionId, index) => {
          ret[
            getHeaderKey(
              sectionDetails.pageIndex,
              answer.sectionIndex,
              null,
              index + 1
            )
          ] = optionId ? sectionDetails?.optionTexts[String(optionId)] : '';
        });
        break;
      // numeric, free-text, slider
      default:
        ret[getHeaderKey(sectionDetails.pageIndex, answer.sectionIndex)] =
          getValue(answer, sectionDetails.type);
        break;
    }
  });

  return ret;
}

function getValue(answer: AnswerEntry, answerType: string) {
  switch (answerType) {
    case 'slider':
    case 'numeric':
      return answer.valueNumeric;
    case 'free-text':
      return answer.valueText;
  }
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

  const sectionMetadata = await getSectionHeaders(surveyId);

  return {
    headers: createCSVHeaders(sectionMetadata),
    submissions: createCSVSubmissions(answerEntries, sectionMetadata),
  };
}
