import {
  AnswerEntry,
  LocalizedText,
  SectionOption,
  Survey,
  SurveyBackgroundImage,
  SurveyCheckboxQuestion,
  SurveyMapQuestion,
  SurveyMapSubQuestion,
  SurveyPage,
  SurveyPageSection,
  SurveyRadioQuestion,
  SurveyTheme,
} from '@interfaces/survey';
import { User } from '@interfaces/user';
import {
  getColumnSet,
  getDb,
  getGeoJSONColumn,
  getMultiInsertQuery,
} from '@src/database';
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from '@src/error';
import logger from '@src/logger';

// TODO: Find a better way to pass the language code when/if the localization is fully implemented
const languageCode = 'fi';

const sectionTypesWithOptions: SurveyPageSection['type'][] = [
  'radio',
  'checkbox',
  'sorting',
];

/**
 * Survey's DB model
 */
interface DBSurvey {
  id: number;
  name: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  author: string;
  author_unit: string;
  author_id: string;
  admins: string[];
  map_url: string;
  start_date: Date;
  end_date: Date;
  created_at: Date;
  updated_at: Date;
  thanks_page_title: LocalizedText;
  thanks_page_text: LocalizedText;
  background_image_id: number;
  section_title_color: string;
}

/**
 * DB row of the data.survey_page table
 */
interface DBSurveyPage {
  id: number;
  survey_id: number;
  idx: number;
  title: LocalizedText;
  /**
   * IDs of the map layers visible on the page
   * For some reason, pg won't be able to cast number[] to json - the array should be JSON.stringified
   */
  map_layers: string;
}

/**
 * DB row of the data.page_section
 */
interface DBSurveyPageSection {
  id: number;
  survey_page_id: number;
  type: string;
  title: LocalizedText;
  body: LocalizedText;
  idx: number;
  details: object;
  parent_section: number;
  info: LocalizedText;
}

/**
 * DB row of table data.option
 */
interface DBSectionOption {
  id?: number;
  idx: number;
  text: LocalizedText;
  section_id: number;
}

/**
 * Type for join DB query containing survey row and selected page, section & option columns.
 */
type DBSurveyJoin = DBSurvey & {
  page_id: number;
  page_title: LocalizedText;
  page_map_layers: number[];
  section_id: number;
  section_title: LocalizedText;
  section_title_color: string;
  section_body: LocalizedText;
  section_type: string;
  section_details: object;
  section_parent_section: number;
  section_info: LocalizedText;
  option_id: number;
  option_text: LocalizedText;
  theme_id: number;
  theme_name: string;
  theme_data: SurveyTheme;
};

/**
 * DB row of table data.answer_entry
 */
interface DBAnswerEntry {
  id?: number;
  submission_id: number;
  section_id: number;
  value_text: string;
  value_numeric: number;
  value_option_id: number;
  value_geometry: GeoJSON.Geometry;
  value_json: string;
}

/**
 * Helper function for creating survey page column set for database queries
 */
const surveyPageColumnSet = getColumnSet<DBSurveyPage>('survey_page', [
  'id',
  'survey_id',
  'idx',
  {
    name: 'title',
    cast: 'json',
  },
  {
    name: 'map_layers',
    cast: 'json',
  },
]);

/**
 * Helper function for creating section option column set for database queries
 */
const sectionOptionColumnSet = getColumnSet<DBSectionOption>('option', [
  'section_id',
  'idx',
  { name: 'text', cast: 'json' },
]);

/**
 * Helper function for creating answer entry column set for database queries
 */
const submissionEntryColumnSet = (inputSRID: number) =>
  getColumnSet<DBAnswerEntry>('answer_entry', [
    'submission_id',
    'section_id',
    'value_text',
    'value_option_id',
    getGeoJSONColumn('value_geometry', inputSRID),
    'value_numeric',
    {
      name: 'value_json',
      cast: 'json',
    },
  ]);

/**
 * Gets the survey with given ID or name from the database.
 * @param params Query parameter (search by ID or name)
 * @returns Requested survey
 */
export async function getSurvey(params: { id: number } | { name: string }) {
  const rows = await getDb().manyOrNone<DBSurveyJoin>(
    `
    SELECT
      survey_page_section.*,
      option.id as option_id,
      option.text as option_text,
      option.idx as option_idx
    FROM (
      SELECT
        survey_page.*,
        section.id as section_id,
        section.title as section_title,
        section.body as section_body,
        section.type as section_type,
        section.details as section_details,
        section.idx as section_idx,
        section.parent_section as section_parent_section,
        section.info as section_info
      FROM (
        SELECT
          survey.*,
          page.id as page_id,
          page.title as page_title,
          page.idx as page_idx,
          page.map_layers as page_map_layers
        FROM
          (
            SELECT
              survey.*,
              theme.id as theme_id,
              theme.name as theme_name,
              theme.data as theme_data
            FROM data.survey survey
            LEFT JOIN application.theme theme ON survey.theme_id = theme.id
          ) survey
          LEFT JOIN data.survey_page page ON survey.id = page.survey_id
        WHERE ${'id' in params ? `survey.id = $1` : `survey.name = $1`}
      ) AS survey_page
      LEFT JOIN data.page_section section ON survey_page.page_id = section.survey_page_id
    ) AS survey_page_section
    LEFT JOIN data.option option ON survey_page_section.section_id = option.section_id
    ORDER BY
      section_parent_section ASC NULLS FIRST,
      page_idx ASC,
      section_idx ASC,
      option_idx ASC;
  `,
    ['id' in params ? params.id : params.name]
  );

  if (!rows.length) {
    throw new NotFoundError(
      'id' in params
        ? `Survey with ID ${params.id} not found`
        : `Survey with name ${params.name} not found`
    );
  }

  return rows.reduce((survey, row) => {
    // Try to find the pre-existing page object
    let page = survey.pages.find((page) => page.id === row.page_id);
    if (!page && (page = dbSurveyJoinToPage(row))) {
      // Page not yet added - add converted row to survey
      survey.pages.push(page);
    }

    // Try to find the pre-existing page section object
    let section = page.sections.find(
      (section) => section.id === row.section_id
    );
    if (!section && (section = dbSurveyJoinToSection(row))) {
      // Section not yet added - add converted row to survey page
      if (row.section_parent_section != null) {
        // Parent section should already exist because of the ordering by parent section rule
        const parentSection = page.sections.find(
          (section) => section.id === row.section_parent_section
        ) as SurveyMapQuestion;
        // Initialize subquestion array if it doesn't yet exist
        if (!parentSection.subQuestions) {
          parentSection.subQuestions = [];
        }
        // Try to find the pre-existing subquestion - if none is found, create it from the row
        let subQuestion = parentSection.subQuestions.find(
          (subQuestion) => subQuestion.id === section.id
        );
        if (
          !subQuestion &&
          (subQuestion = dbSurveyJoinToSection(row) as SurveyMapSubQuestion)
        ) {
          // Subquestion didn't yet exist - add it to the parent section
          parentSection.subQuestions.push(subQuestion);
        }
        // If question contains options, add the option in the current row there
        if ('options' in subQuestion) {
          const option = dbSurveyJoinToOption(row);
          if (option) {
            subQuestion.options.push(option);
          }
        }
      } else {
        page.sections.push(section);
      }
    }

    // Only look for options if the section type allows options
    if (sectionTypesWithOptions.includes(section?.type)) {
      // For some reason TS cannot infer the section here correctly from the if above - assume the type in the new variable
      const question = section as SurveyRadioQuestion | SurveyCheckboxQuestion;
      // Try to find the pre-existing question option object
      let option = question.options.find(
        (option) => option.id === row.option_id
      );
      if (!option && (option = dbSurveyJoinToOption(row))) {
        // Option not yet added - add converted row to section
        question.options.push(option);
      }
    }

    return survey;
  }, dbSurveyToSurvey(rows[0])) as any;
}

/**
 * Get all surveys from the db
 * @returns Array of Surveys
 */
export async function getSurveys() {
  const rows = await getDb().manyOrNone<DBSurvey>(`SELECT * FROM data.survey`); // TODO order by
  return rows.map((row) => dbSurveyToSurvey(row));
}

/**
 * Creates a new survey entry into the database
 * @param user Author
 */
export async function createSurvey(user: User) {
  const surveyRow = await getDb().one<DBSurvey>(
    `INSERT INTO data.survey (author_id) VALUES ($1) RETURNING *`,
    [user.id]
  );

  if (!surveyRow) {
    throw new InternalServerError(`Error while creating a new survey`);
  }

  const survey = dbSurveyToSurvey(surveyRow);
  const page = await createSurveyPage(survey.id);

  return { ...survey, pages: [page] };
}

async function insertSection(section: DBSurveyPageSection, index: number) {
  return await getDb().one<DBSurveyPageSection>(
    `
    INSERT INTO data.page_section (survey_page_id, idx, title, type, body, details, parent_section, info)
    VALUES ($1, $2, $3::json, $4, $5::json, $6::json, $7, $8) RETURNING id;
  `,
    [
      section.survey_page_id,
      index,
      section.title,
      section.type,
      section.body,
      section.details,
      section.parent_section,
      section.info,
    ]
  );
}

/**
 * Updates a premade survey entry
 * @param survey
 */
export async function updateSurvey(survey: Survey) {
  // Update the survey itself
  const surveyRow = await getDb()
    .one<DBSurvey>(
      `UPDATE data.survey SET
        name = $2,
        title = $3,
        subtitle = $4,
        author = $5,
        author_unit = $6,
        map_url = $7,
        start_date = $8,
        end_date = $9,
        thanks_page_title = $10,
        thanks_page_text = $11,
        background_image_id = $12,
        admins = $13,
        theme_id = $14,
        section_title_color = $15
      WHERE id = $1 RETURNING *`,
      [
        survey.id,
        survey.name,
        { fi: survey.title },
        { fi: survey.subtitle },
        survey.author,
        survey.authorUnit,
        survey.mapUrl,
        survey.startDate,
        survey.endDate,
        { fi: survey.thanksPage.title },
        { fi: survey.thanksPage.text },
        survey.backgroundImageId,
        survey.admins,
        survey.theme?.id ?? null,
        survey.sectionTitleColor,
      ]
    )
    .catch((error) => {
      throw error.constraint === 'survey_name_key'
        ? new BadRequestError(
            `Survey name ${survey.name} already exists`,
            'duplicate_survey_name'
          )
        : error;
    });

  if (!surveyRow) {
    throw new NotFoundError(`Survey with ID ${survey.id} not found`);
  }

  if (survey.pages.length) {
    // Clear old pages
    await getDb().none(`DELETE FROM data.survey_page WHERE survey_id = $1;`, [
      survey.id,
    ]);
    // Re-insert pages belonging to the survey
    // Form a query for inserting multiple rows
    const query = getMultiInsertQuery(
      surveyPagesToRows(survey.pages, survey.id),
      surveyPageColumnSet
    );
    await getDb().none(query);
  }

  // First delete all previously stored sections that are under the survey at hand, then insert the fresh batch of sections
  const sections = survey.pages.reduce((result, page) => {
    return [...result, ...surveySectionsToRows(page.sections, page.id)];
  }, [] as ReturnType<typeof surveySectionsToRows>);

  await getDb().none(
    `
    DELETE FROM data.page_section WHERE survey_page_id = ANY(
      SELECT sp.id FROM data.survey s LEFT JOIN data.survey_page sp ON $1 = sp.survey_id WHERE sp.id IS NOT NULL
    );
  `,
    [survey.id]
  );

  // Loop through sections and insert them one at a time to returning the new id of the section.
  // Use the section id to insert a batch of section options and map subquestions (if present)
  if (sections.length) {
    sections.forEach(async (section, index) => {
      const sectionRow = await insertSection(section, index);
      if (section.options?.length) {
        const sectionID = sectionRow.id;
        const options = optionsToRows(section.options, sectionID);

        await getDb().none(
          getMultiInsertQuery(options, sectionOptionColumnSet)
        );
      }
      if (section.subQuestions?.length) {
        const sectionID = sectionRow.id;
        const subQuestions = surveySectionsToRows(
          section.subQuestions,
          section.survey_page_id,
          sectionID
        );
        // Do this insert in a loop too, to make it possible to add subquestion options with correct foreign key
        subQuestions.forEach(async (subQuestion, index) => {
          const subQuestionRow = await insertSection(subQuestion, index);
          if (subQuestion.options) {
            const options = optionsToRows(
              subQuestion.options,
              subQuestionRow.id
            );
            await getDb().none(
              getMultiInsertQuery(options, sectionOptionColumnSet)
            );
          }
        });
      }
    });
  }

  // TODO pages and sections also from db?
  return { ...dbSurveyToSurvey(surveyRow), pages: survey.pages } as Survey;
}

/**
 * Delete a survey
 * @param survey
 */
export async function deleteSurvey(id: Number) {
  const row = await getDb().oneOrNone<DBSurvey>(
    `DELETE FROM data.survey WHERE id = $1 RETURNING *`,
    [id]
  );

  if (!row) {
    throw new NotFoundError(`Survey with ID ${id} not found`);
  }
}

/**
 * Calculates publish status from survey start and end dates.
 * Survey is considered published when:
 * 1) `startDate` is defined and in the past, and
 * 2) `endDate` is not defined or in the future
 * @param survey Survey
 * @returns Is survey published?
 */
function isPublished(survey: Pick<Survey, 'startDate' | 'endDate'>) {
  const now = new Date();
  return Boolean(
    survey.startDate &&
      now > survey.startDate &&
      (!survey.endDate || now < survey.endDate)
  );
}

/**
 * Function to map survey's db type into the application type
 * @param dbSurvey
 * @returns Survey containing the database entries
 */
function dbSurveyToSurvey(
  dbSurvey: DBSurvey | DBSurveyJoin
): Omit<Survey, 'createdAt' | 'updatedAt'> {
  const survey = {
    id: dbSurvey.id,
    name: dbSurvey.name,
    title: dbSurvey.title?.fi,
    subtitle: dbSurvey.subtitle?.fi,
    author: dbSurvey.author,
    authorUnit: dbSurvey.author_unit,
    authorId: dbSurvey.author_id,
    admins: dbSurvey.admins,
    mapUrl: dbSurvey.map_url,
    startDate: dbSurvey.start_date,
    endDate: dbSurvey.end_date,
    thanksPage: {
      title: dbSurvey.thanks_page_title?.fi,
      text: dbSurvey.thanks_page_text?.fi,
    },
    backgroundImageId: dbSurvey.background_image_id,
    sectionTitleColor: dbSurvey.section_title_color,
    // Single survey row won't contain pages - they get aggregated from a join query
    pages: [],
  };
  return {
    ...survey,
    isPublished: isPublished(survey),
    ...('theme_id' in dbSurvey && {
      theme: dbSurveyJoinToTheme(dbSurvey),
    }),
  };
}

/**
 * Converts a DB survey join query row into a survey theme.
 */
function dbSurveyJoinToTheme(dbSurveyJoin: DBSurveyJoin): SurveyTheme {
  return dbSurveyJoin.theme_id == null
    ? null
    : {
        id: dbSurveyJoin.theme_id,
        name: dbSurveyJoin.theme_name,
        data: dbSurveyJoin.theme_data,
      };
}

/**
 * Converts a DB survey join query row into a survey page.
 * @param dbSurveyJoin Join query row
 * @returns Survey page
 */
function dbSurveyJoinToPage(dbSurveyJoin: DBSurveyJoin): SurveyPage {
  return dbSurveyJoin.page_id == null
    ? null
    : {
        id: dbSurveyJoin.page_id,
        title: dbSurveyJoin.page_title?.[languageCode],
        sections: [],
        mapLayers: dbSurveyJoin.page_map_layers ?? [],
      };
}

/**
 * Converts a DB survey join query row into a survey page section.
 * @param dbSurveyJoin Join query row
 * @returns Survey page section
 */
function dbSurveyJoinToSection(dbSurveyJoin: DBSurveyJoin): SurveyPageSection {
  const type = dbSurveyJoin.section_type as SurveyPageSection['type'];
  return dbSurveyJoin.section_id == null
    ? null
    : {
        id: dbSurveyJoin.section_id,
        title: dbSurveyJoin.section_title?.[languageCode],
        type: dbSurveyJoin.section_type as SurveyPageSection['type'],
        body: dbSurveyJoin.section_body?.[languageCode],
        info: dbSurveyJoin.section_info?.[languageCode],
        // Trust that the JSON in the DB fits the rest of the detail fields
        ...(dbSurveyJoin.section_details as any),
        // Add an initial empty option array if the type allows options
        ...(sectionTypesWithOptions.includes(type) && { options: [] }),
      };
}

/**
 * Converts a DB survey join query row into a question option.
 * @param dbSurveyJoin Join query row
 * @returns Question option
 */
function dbSurveyJoinToOption(dbSurveyJoin: DBSurveyJoin): SectionOption {
  return dbSurveyJoin.option_id == null
    ? null
    : {
        id: dbSurveyJoin.option_id,
        text: dbSurveyJoin.option_text?.[languageCode],
      };
}

/**
 * Create a new survey page (database row)
 * @returns SurveyPage
 */
export async function createSurveyPage(
  surveyId: number,
  partialPage?: Partial<SurveyPage>
) {
  const row = await getDb().one<SurveyPage>(
    `INSERT INTO data.survey_page (survey_id, idx, title, map_layers)
     SELECT
       $1 as survey_id,
       COALESCE(MAX(idx) + 1, 0) as idx,
       '{"fi": ""}'::json,
       $2::json
     FROM data.survey_page WHERE survey_id = $1
     RETURNING *;`,
    [surveyId, JSON.stringify(partialPage?.mapLayers ?? [])]
  );

  if (!row) {
    throw new InternalServerError(`Error while creating a new survey page`);
  }

  return {
    id: row.id,
    title: row.title?.[languageCode],
    sections: [],
    mapLayers: partialPage?.mapLayers ?? [],
  } as SurveyPage;
}

/**
 * Delete a survey page with given id
 * @param id
 * @returns SurveyPage
 */
export async function deleteSurveyPage(id: number) {
  const row = await getDb().one<SurveyPage>(
    `DELETE FROM data.survey_page WHERE id = $1 RETURNING *`,
    [id]
  );

  if (!row) {
    throw new InternalServerError(
      `Error while deleting survey page with id: ${id}`
    );
  }

  return row;
}

/**
 * Create a submission and related answer entries
 * @param surveyID
 * @param submissionEntries
 */
export async function createSurveySubmission(surveyID, submissionEntries) {
  const submissionRow = await getDb().one(
    `
    INSERT INTO data.submission (survey_id) VALUES ($1) RETURNING id;
  `,
    [surveyID]
  );

  if (!submissionRow) {
    logger.error(
      `Error while creating submission for survey with id: ${surveyID}, submission entries: ${submissionEntries}`
    );
    throw new InternalServerError(`Error while creating submission for survey`);
  }

  const submissionID = submissionRow.id;
  const submissionRows = answerEntriesToRows(submissionID, submissionEntries);
  const inputSRID = getSRIDFromEntries(submissionEntries);
  await getDb().none(
    getMultiInsertQuery(submissionRows, submissionEntryColumnSet(inputSRID))
  );
}

/**
 * Parse SRID information from geometry entries
 * @param submissionEntries
 * @returns SRID describing the coordinate reference system in which the geometry entries are described in
 */
function getSRIDFromEntries(submissionEntries: AnswerEntry[]) {
  const geometryEntry = submissionEntries.find((entry) => entry.type === 'map');
  if (!geometryEntry) return null;

  return geometryEntry?.value[0]?.geometry?.crs?.properties?.name
    ? parseInt(
        geometryEntry?.value[0]?.geometry?.crs?.properties?.name?.split(':')[1]
      )
    : null;
}

/**
 * Convert array of entries into db row entries
 * @param submissionID
 * @param submission
 * @returns DBAnswerEntry, object describing a single row of the table data.answer_entry
 */
function answerEntriesToRows(
  submissionID: number,
  submissionEntries: AnswerEntry[]
) {
  return submissionEntries.reduce((entries, entry) => {
    let newEntries: DBAnswerEntry[];

    switch (entry.type) {
      case 'free-text':
        newEntries = [
          {
            submission_id: submissionID,
            section_id: entry.sectionId,
            value_text: entry.value,
            value_option_id: null,
            value_geometry: null,
            value_numeric: null,
            value_json: null,
          },
        ];
        break;
      case 'radio':
        newEntries = [
          {
            submission_id: submissionID,
            section_id: entry.sectionId,
            value_text: typeof entry.value === 'string' ? entry.value : null,
            value_option_id:
              typeof entry.value === 'number' ? entry.value : null,
            value_geometry: null,
            value_numeric: null,
            value_json: null,
          },
        ];
        break;
      case 'checkbox':
        newEntries =
          entry.value.length !== 0
            ? [
                ...entry.value.map((value) => {
                  return {
                    submission_id: submissionID,
                    section_id: entry.sectionId,
                    value_text: typeof value === 'string' ? value : null,
                    value_option_id: typeof value === 'number' ? value : null,
                    value_geometry: null,
                    value_numeric: null,
                    value_json: null,
                  };
                }),
              ]
            : [
                {
                  submission_id: submissionID,
                  section_id: entry.sectionId,
                  value_text: null,
                  value_option_id: null,
                  value_geometry: null,
                  value_numeric: null,
                  value_json: null,
                },
              ];
        break;
      case 'numeric':
        newEntries = [
          {
            submission_id: submissionID,
            section_id: entry.sectionId,
            value_text: null,
            value_option_id: null,
            value_geometry: null,
            value_numeric: entry.value,
            value_json: null,
          },
        ];
        break;
      case 'map':
        newEntries = entry.value.reduce((prevEntries, currentValue) => {
          const geometryEntry = {
            submission_id: submissionID,
            section_id: entry.sectionId,
            value_text: null,
            value_option_id: null,
            value_geometry: currentValue.geometry?.geometry,
            value_numeric: null,
            value_json: null,
          } as DBAnswerEntry;

          // Map over different subquestion answers using the same function recursively
          const subquestionEntries = currentValue.subQuestionAnswers
            ? answerEntriesToRows(submissionID, currentValue.subQuestionAnswers)
            : [];

          return [...prevEntries, geometryEntry, ...subquestionEntries];
        }, []);

        break;
      case 'sorting':
        newEntries = [
          {
            submission_id: submissionID,
            section_id: entry.sectionId,
            value_text: null,
            value_option_id: null,
            value_geometry: null,
            value_numeric: null,
            value_json: JSON.stringify(entry.value),
          },
        ];
        break;
      case 'slider':
        newEntries = [
          {
            submission_id: submissionID,
            section_id: entry.sectionId,
            value_text: null,
            value_option_id: null,
            value_geometry: null,
            value_numeric: entry.value,
            value_json: null,
          },
        ];
        break;
      case 'matrix':
        newEntries = [
          {
            submission_id: submissionID,
            section_id: entry.sectionId,
            value_text: null,
            value_option_id: null,
            value_geometry: null,
            value_numeric: null,
            value_json: JSON.stringify(entry.value),
          },
        ];
        break;
    }

    return [...entries, ...(newEntries ?? [])];
  }, [] as DBAnswerEntry[]);
}

/**
 * Function for converting an array of survey pages into an array of survey page db rows
 * @param surveyPages
 * @param surveyId
 * @returns DBSurveyPage[]
 */
function surveyPagesToRows(
  surveyPages: SurveyPage[],
  surveyId: number
): DBSurveyPage[] {
  return surveyPages.map((surveyPage, index) => {
    return {
      id: surveyPage.id,
      idx: index,
      survey_id: surveyId,
      title: {
        fi: surveyPage.title,
      },
      map_layers: JSON.stringify(surveyPage.mapLayers),
    } as DBSurveyPage;
  });
}

/**
 * Function for converting an array of survey page sections into an array of survey page section db rows.
 * If section contains options and/or subquestions, they are returned as unmodified.
 * @param surveySections
 * @param pageId
 * @param parentSectionId
 * @returns
 */
function surveySectionsToRows(
  surveySections: SurveyPageSection[],
  pageId: number,
  parentSectionId?: number
) {
  return surveySections.filter(Boolean).map((surveySection, index) => {
    const {
      id,
      type,
      title,
      body = undefined,
      options = undefined,
      subQuestions = undefined,
      info = undefined,
      ...details
    } = { ...surveySection };
    return {
      survey_page_id: pageId,
      idx: index,
      type: type,
      title: {
        fi: title,
      },
      body: {
        fi: body,
      },
      details,
      options,
      subQuestions,
      parent_section: parentSectionId ?? null,
      info: {
        fi: info,
      },
    } as DBSurveyPageSection & {
      options: SectionOption[];
      subQuestions: SurveyMapSubQuestion[];
    };
  });
}

/**
 * Convert section options to db rows
 * @param sectionOptions
 * @param sectionId
 * @returns DBSectionOption[]
 */
function optionsToRows(
  sectionOptions: SectionOption[],
  sectionId: number
): DBSectionOption[] {
  return sectionOptions.map((option, index) => {
    return {
      section_id: sectionId,
      id: option.id ?? null,
      idx: index,
      text: {
        fi: option.text,
      },
    } as DBSectionOption;
  });
}

/**
 * Publish survey by setting its start date to 'now'.
 * If end date is in the past, reset it to null.
 * @param surveyId
 */
export async function publishSurvey(surveyId: number) {
  const row = await getDb().oneOrNone<DBSurvey>(
    `
    UPDATE data.survey
      SET start_date = NOW(),
      end_date = CASE
        WHEN end_date < NOW() THEN NULL
        ELSE end_date
      END
      WHERE id = $1 RETURNING *;
  `,
    [surveyId]
  );

  if (!row) {
    throw new InternalServerError(
      `Error while publishing survey with id:${surveyId}`
    );
  }

  return dbSurveyToSurvey(row);
}

/**
 * End survey by setting its end date to 'now'
 * @param surveyId
 */
export async function unpublishSurvey(surveyId: number) {
  const row = await getDb().oneOrNone(
    `
    UPDATE data.survey SET end_date = NOW() WHERE id = $1 RETURNING *;
  `,
    [surveyId]
  );

  if (!row) {
    throw new InternalServerError(
      `Error while publishing survey with id:${surveyId}`
    );
  }

  return dbSurveyToSurvey(row);
}

/**
 * Store survey image to database to table 'data.images'
 * @param imageBuffer
 * @param fileName
 * @param attributions
 * @returns Database row id of the uploaded image
 */
export async function storeImage(
  imageBuffer: Buffer,
  fileName: string,
  attributions: string,
  fileFormat: string
) {
  const imageString = `\\x${imageBuffer.toString('hex')}`;
  const row = await getDb().oneOrNone(
    `
    INSERT INTO data.images (image, attributions, image_name, file_format) values ($1, $2, $3, $4) RETURNING id;
    `,
    [imageString, attributions, fileName, fileFormat]
  );

  if (!row) {
    throw new InternalServerError(`Error while inserting survey image to db`);
  }

  return row.id;
}

/**
 * Get a single image with id from the database
 * @param id
 * @returns SurveyBackgroudImage
 */
export async function getImage(id: number) {
  const row = await getDb().oneOrNone(
    `
    SELECT image, attributions FROM data.images WHERE id = $1;
  `,
    [id]
  );

  if (!row) {
    throw new NotFoundError(`Image with ID ${id} not found`);
  }

  return {
    data: row.image.toString('base64'),
    attributions: row.attributions,
  } as SurveyBackgroundImage;
}

/**
 * Get all survey images from the database
 * @returns SurveyBackgroundImage[]
 */
export async function getImages() {
  const rows = await getDb().manyOrNone(`
    SELECT id, attributions, image, image_name, file_format FROM data.images ORDER BY created_at DESC;
  `);

  return rows.map((row) => ({
    id: row.id,
    data: row.image.toString('base64'),
    attributions: row.attributions,
    fileName: row.image_name,
    fileFormat: row.file_format,
  })) as SurveyBackgroundImage[];
}

/**
 * Delete a single survey background image from the db
 * @param id ID of the image
 * @returns
 */
export async function removeImage(id: number) {
  return await getDb().none(
    `
    DELETE FROM data.images WHERE id = $1;
  `,
    [id]
  );
}

/**
 * Checks if given user is allowed to edit the survey with given ID
 * @param user User
 * @param surveyId Survey ID
 * @returns Can the user edit the survey?
 */
export async function userCanEditSurvey(user: User, surveyId: number) {
  const { author_id: authorId, admins } = await getDb().oneOrNone<{
    author_id: string;
    admins: string[];
  }>(`SELECT author_id, admins FROM data.survey WHERE id = $1`, [surveyId]);
  return user.id === authorId || admins.includes(user.id);
}
