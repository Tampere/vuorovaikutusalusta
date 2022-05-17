import {
  File,
  LocalizedText,
  SectionOption,
  SectionOptionGroup,
  Survey,
  SurveyBackgroundImage,
  SurveyCheckboxQuestion,
  SurveyMapQuestion,
  SurveyMapSubQuestion,
  SurveyPage,
  SurveyPageSection,
  SurveyPageSidebarType,
  SurveyRadioQuestion,
  SurveyTheme,
} from '@interfaces/survey';
import { User } from '@interfaces/user';
import { getColumnSet, getDb, getMultiUpdateQuery } from '@src/database';
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from '@src/error';

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
  background_image_name: string;
  background_image_path: string[];
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
  sidebar_type: SurveyPageSidebarType;
  /**
   * IDs of the map layers visible on the page
   * For some reason, pg won't be able to cast number[] to json - the array should be JSON.stringified
   */
  sidebar_map_layers: string;
  sidebar_image_path: string[];
  sidebar_image_name: string;
  sidebar_image_alt_text: string;
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
  file_name: string;
  file_path: string[];
}

/**
 * DB row of table data.option
 */
interface DBSectionOption {
  id?: number;
  idx: number;
  text: LocalizedText;
  section_id: number;
  info?: LocalizedText;
  group_id: number;
}

/**
 * DB row of table data.option_group
 */
interface DBOptionGroup {
  id?: number;
  idx: number;
  name: LocalizedText;
  section_id: number;
}

/**
 * Type for join DB query containing survey row and selected page, section & option columns.
 */
type DBSurveyJoin = DBSurvey & {
  page_id: number;
  page_title: LocalizedText;
  page_sidebar_type: SurveyPageSidebarType;
  page_sidebar_map_layers: number[];
  page_sidebar_image_path: string[];
  page_sidebar_image_name: string;
  page_sidebar_image_alt_text: string;
  section_id: number;
  section_title: LocalizedText;
  section_title_color: string;
  section_body: LocalizedText;
  section_type: string;
  section_details: object;
  section_parent_section: number;
  section_info: LocalizedText;
  section_file_name: string;
  section_file_path: string[];
  option_id: number;
  option_text: LocalizedText;
  option_group_id: number;
  option_info: LocalizedText;
  theme_id: number;
  theme_name: string;
  theme_data: SurveyTheme;
};

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
  'sidebar_type',
  {
    name: 'sidebar_map_layers',
    cast: 'json',
  },
  {
    name: 'sidebar_image_path',
    cast: 'text[]',
  },
  'sidebar_image_name',
  'sidebar_image_alt_text',
]);

/**
 * Helper function for creating section option column set for database queries
 */
const sectionOptionColumnSet = getColumnSet<DBSectionOption>('option', [
  'section_id',
  'idx',
  { name: 'text', cast: 'json' },
  { name: 'info', cast: 'json' },
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
      option.idx as option_idx,
      option.group_id as option_group_id,
      option.info as option_info
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
        section.info as section_info,
        section.file_name as section_file_name,
        section.file_path as section_file_path
      FROM (
        SELECT
          survey.*,
          page.id as page_id,
          page.title as page_title,
          page.idx as page_idx,
          page.sidebar_type as page_sidebar_type,
          page.sidebar_map_layers as page_sidebar_map_layers,
          page.sidebar_image_path as page_sidebar_image_path,
          page.sidebar_image_name as page_sidebar_image_name,
          page.sidebar_image_alt_text as page_sidebar_image_alt_text
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

  // Get all option groups in its own query if needed
  const optionGroupIds = Array.from(
    new Set(rows.map((row) => row.option_group_id).filter(Boolean))
  );
  const optionGroups = !optionGroupIds.length
    ? []
    : (
        await getDb().manyOrNone<DBOptionGroup>(
          `SELECT * FROM data.option_group WHERE id = ANY ($1) ORDER BY idx ASC`,
          [optionGroupIds]
        )
      ).map(
        (group): SectionOptionGroup => ({
          id: group.id,
          name: group.name,
          options: [],
        })
      );

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

    // Gather grouped options only for grouped checkbox questions
    if (section?.type === 'grouped-checkbox') {
      // Try to find the pre-existing option group object
      let group = section.groups.find(
        (group) => group?.id === row.option_group_id
      );

      // If the group wasn't added yet, add it from the different query result
      if (
        !group &&
        (group = optionGroups.find((group) => group.id === row.option_group_id))
      ) {
        // Groups may be out of order, so use the index from the other query
        section.groups[optionGroups.indexOf(group)] = group;
      }

      // Only add options if the group exists - otherwise there are no options saved for this group
      if (group) {
        // Add the single option to the group
        group.options.push(dbSurveyJoinToOption(row));
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

/**
 * Upserts (updates or inserts) given survey page section with given index.
 * @param section Section
 * @param index Index
 * @returns Updated DB section
 */
async function upsertSection(section: DBSurveyPageSection, index: number) {
  // Negative IDs can be assigned as temporary IDs for e.g. drag and drop - change them to null
  return await getDb().one<DBSurveyPageSection>(
    `
    INSERT INTO data.page_section (id, survey_page_id, idx, title, type, body, details, parent_section, info, file_name, file_path)
    VALUES (
      COALESCE(
        CASE
          WHEN $(id) < 0 THEN NULL
          ELSE $(id)::integer
        END,
        NEXTVAL('data.page_section_id_seq')
      ),
      $(surveyPageId),
      $(index),
      $(title)::json,
      $(type),
      $(body)::json,
      $(details)::json,
      $(parentSection),
      $(info),
      $(fileName),
      $(filePath)
    )
    ON CONFLICT (id) DO
      UPDATE SET
        survey_page_id = $(surveyPageId),
        idx = $(index),
        title = $(title)::json,
        body = $(body)::json,
        details = $(details)::json,
        parent_section = $(parentSection),
        info = $(info),
        file_name = $(fileName),
        file_path = $(filePath)
    RETURNING *
  `,
    {
      id: section.id,
      surveyPageId: section.survey_page_id,
      index,
      title: section.title,
      type: section.type,
      body: section.body,
      details: section.details,
      parentSection: section.parent_section,
      info: section.info,
      fileName: section.file_name,
      filePath: section.file_path,
    }
  );
}

/**
 * Upserts (updates or inserts) given question option with given index.
 * @param option Option
 * @param index Index
 * @returns Updated DB option
 */
async function upsertOption(option: DBSectionOption, index: number) {
  // Negative IDs can be assigned as temporary IDs for e.g. drag and drop - change them to null
  return await getDb().one<DBSectionOption>(
    `
    INSERT INTO data.option (id, text, section_id, idx, group_id, info)
    VALUES (
      COALESCE(
        CASE
          WHEN $(id) < 0 THEN NULL
          ELSE $(id)::integer
        END,
        NEXTVAL('data.option_id_seq')
      ),
      $(text)::json,
      $(sectionId),
      $(index),
      $(groupId),
      $(info)::json
    )
    ON CONFLICT (id) DO
      UPDATE SET
        text = $(text)::json,
        section_id = $(sectionId),
        idx = $(index),
        group_id = $(groupId),
        info = $(info)::json
    RETURNING *
  `,
    {
      id: option.id,
      text: option.text,
      sectionId: option.section_id,
      index,
      groupId: option.group_id,
      info: option.info,
    }
  );
}

/**
 * Upserts (updates or inserts) given option group with given index.
 * @param group Option group
 * @param index Index
 * @returns Updated DB option group
 */
async function upsertOptionGroup(group: DBOptionGroup, index: number) {
  // Negative IDs can be assigned as temporary IDs for e.g. drag and drop - change them to null
  return await getDb().one<DBOptionGroup>(
    `
    INSERT INTO data.option_group (id, name, idx, section_id)
    VALUES (
      COALESCE(
        CASE
          WHEN $(id) < 0 THEN NULL
          ELSE $(id)::integer
        END,
        NEXTVAL('data.option_group_id_seq')
      ),
      $(name)::json,
      $(index),
      $(sectionId)
    )
    ON CONFLICT (id) DO
      UPDATE SET
        name = $(name)::json,
        idx = $(index),
        section_id = $(sectionId)
    RETURNING *
  `,
    {
      id: group.id,
      name: group.name,
      sectionId: group.section_id,
      index,
    }
  );
}

/**
 * When updating a survey, deletes all sections that should be removed from DB.
 * @param surveyId Survey ID
 * @param newSections New sections
 */
async function deleteRemovedSections(
  surveyId: number,
  newSections: DBSurveyPageSection[]
) {
  // Get all existing sections
  const rows = await getDb().manyOrNone<{ id: number }>(
    `SELECT id FROM data.page_section WHERE parent_section IS NULL AND survey_page_id IN (
       SELECT id FROM data.survey_page WHERE survey_id = $1
    )`,
    [surveyId]
  );
  const existingSectionIds = rows.map((row) => row.id);

  // All existing sections that aren't included in new sections should be removed
  const removedSectionIds = existingSectionIds.filter((id) =>
    (newSections ?? []).every((newSection) => newSection.id !== id)
  );
  if (removedSectionIds.length) {
    await getDb().none(`DELETE FROM data.page_section WHERE id = ANY ($1)`, [
      removedSectionIds,
    ]);
  }
}

/**
 * When updating a section, deletes all subquestions that should be removed from DB.
 * @param parentSectionId Parent section ID
 * @param newSubQuestions New subquestions
 */
async function deleteRemovedSubQuestions(
  parentSectionId: number,
  newSubQuestions: SurveyMapSubQuestion[]
) {
  // Get all existing sections
  const rows = await getDb().manyOrNone<{ id: number }>(
    `SELECT id FROM data.page_section WHERE parent_section = $1`,
    [parentSectionId]
  );
  const existingSubQuestionIds = rows.map((row) => row.id);

  // All existing sections that aren't included in new sections should be removed
  const removedSubQuestionIds = existingSubQuestionIds.filter((id) =>
    (newSubQuestions ?? []).every((newSubQuestion) => newSubQuestion.id !== id)
  );
  if (removedSubQuestionIds.length) {
    await getDb().none(`DELETE FROM data.page_section WHERE id = ANY ($1)`, [
      removedSubQuestionIds,
    ]);
  }
}

/**
 * When updating a page section, deletes all options that should be removed from DB.
 * @param sectionId Section ID
 * @param newOptions New options
 * @param optionGroupId Option group ID
 */
async function deleteRemovedOptions(
  sectionId: number,
  newOptions: SectionOption[],
  optionGroupId?: number
) {
  // Get all existing options
  const rows =
    optionGroupId != null
      ? await getDb().manyOrNone<{ id: number }>(
          `SELECT id FROM data.option WHERE section_id = $1 AND group_id = $2`,
          [sectionId, optionGroupId]
        )
      : await getDb().manyOrNone<{ id: number }>(
          `SELECT id FROM data.option WHERE section_id = $1 AND group_id IS NULL`,
          [sectionId]
        );
  const existingOptionIds = rows.map((row) => row.id);

  // All existing options that aren't included in new options should be removed
  const removedOptionIds = existingOptionIds.filter((id) =>
    (newOptions ?? []).every((newOption) => newOption.id !== id)
  );
  if (removedOptionIds.length) {
    await getDb().none(`DELETE FROM data.option WHERE id = ANY ($1)`, [
      removedOptionIds,
    ]);
  }
}

/**
 * When updating a page section, deletes all option groups that should be removed from DB.
 * @param sectionId Section ID
 * @param newGroups New option groups
 * @param optionGroupId Option group ID
 */
async function deleteRemovedOptionGroups(
  sectionId: number,
  newGroups: SectionOptionGroup[]
) {
  // Get all existing option groups
  const rows = await getDb().manyOrNone<{ id: number }>(
    `SELECT id FROM data.option_group WHERE section_id = $1`,
    [sectionId]
  );
  const existingGroupIds = rows.map((row) => row.id);

  // All existing groups that aren't included in new groups should be removed
  const removedGroupIds = existingGroupIds.filter((id) =>
    (newGroups ?? []).every((newGroup) => newGroup.id !== id)
  );
  if (removedGroupIds.length) {
    await getDb().none(`DELETE FROM data.option_group WHERE id = ANY ($1)`, [
      removedGroupIds,
    ]);
  }
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
        background_image_name = $12,
        background_image_path = $13,
        admins = $14,
        theme_id = $15,
        section_title_color = $16
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
        survey.backgroundImageName ?? null,
        survey.backgroundImagePath ?? null,
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

  // Update the survey pages
  await getDb().none(
    getMultiUpdateQuery(
      surveyPagesToRows(survey.pages, survey.id),
      surveyPageColumnSet
    ) + ' WHERE t.id = v.id'
  );

  // Form a flat array of all new section rows under each page
  const sections = survey.pages.reduce((result, page) => {
    return [...result, ...surveySectionsToRows(page.sections, page.id)];
  }, [] as ReturnType<typeof surveySectionsToRows>);

  // Delete sections that were removed from the updated survey
  await deleteRemovedSections(survey.id, sections);

  // Update all sections
  await Promise.all(
    sections.map(async (section, index) => {
      const sectionRow = await upsertSection(section, index);

      // Delete options that were removed
      await deleteRemovedOptions(section.id, section.options);

      // Update/insert the remaining options
      if (section.options?.length) {
        const options = optionsToRows(section.options, sectionRow.id);
        await Promise.all(options.map(upsertOption));
      }

      // Delete removed subquestion sections
      await deleteRemovedSubQuestions(section.id, section.subQuestions);

      // If there are subquestions, update them
      if (section.subQuestions?.length) {
        const subQuestions = surveySectionsToRows(
          section.subQuestions,
          section.survey_page_id,
          sectionRow.id
        );
        // Update each subquestion in its own block
        await Promise.all(
          subQuestions.map(async (subQuestion, index) => {
            const subQuestionRow = await upsertSection(subQuestion, index);

            // Delete subquestion options that were removed
            await deleteRemovedOptions(subQuestion.id, subQuestion.options);

            // Update/insert the remaining subquestion options
            if (subQuestion.options?.length) {
              const options = optionsToRows(
                subQuestion.options,
                subQuestionRow.id
              );
              await Promise.all(options.map(upsertOption));
            }
          })
        );
      }

      // Delete removed option groups
      await deleteRemovedOptionGroups(section.id, section.groups);

      // If there are option groups, update them
      if (section.groups?.length) {
        await Promise.all(
          section.groups.map(async (group, index) => {
            const groupRow = await upsertOptionGroup(
              {
                id: group.id,
                name: group.name,
                section_id: sectionRow.id,
                idx: index,
              },
              index
            );

            // Delete removed options from the group
            await deleteRemovedOptions(section.id, group.options, groupRow.id);

            // Upsert all options
            const options = optionsToRows(
              group.options,
              sectionRow.id,
              groupRow.id
            );
            await Promise.all(options.map(upsertOption));
          })
        );
      }
    })
  );

  return await getSurvey({ id: survey.id });
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
    backgroundImageName: dbSurvey.background_image_name,
    backgroundImagePath: dbSurvey.background_image_path,
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
        sidebar: {
          type: dbSurveyJoin.page_sidebar_type,
          mapLayers: dbSurveyJoin.page_sidebar_map_layers ?? [],
          imagePath: dbSurveyJoin.page_sidebar_image_path,
          imageName: dbSurveyJoin.page_sidebar_image_name,
          imageAltText: dbSurveyJoin.page_sidebar_image_alt_text,
        },
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
        fileName: dbSurveyJoin.section_file_name,
        filePath: dbSurveyJoin.section_file_path,
        // Trust that the JSON in the DB fits the rest of the detail fields
        ...(dbSurveyJoin.section_details as any),
        // Add an initial empty option array if the type allows options
        ...(sectionTypesWithOptions.includes(type) && { options: [] }),
        // Add an initial empty group array if the type allows option groups
        ...(type === 'grouped-checkbox' && { groups: [] }),
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
        info: dbSurveyJoin.option_info?.[languageCode],
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
  const row = await getDb().one<DBSurveyPage>(
    `INSERT INTO data.survey_page (survey_id, idx, title, sidebar_map_layers)
     SELECT
       $1 as survey_id,
       COALESCE(MAX(idx) + 1, 0) as idx,
       '{"fi": ""}'::json,
       $2::json
     FROM data.survey_page WHERE survey_id = $1
     RETURNING *;`,
    [surveyId, JSON.stringify(partialPage?.sidebar?.mapLayers ?? [])]
  );

  if (!row) {
    throw new InternalServerError(`Error while creating a new survey page`);
  }

  return {
    id: row.id,
    title: row.title?.[languageCode],
    sections: [],
    sidebar: {
      type: row.sidebar_type,
      mapLayers: partialPage?.sidebar?.mapLayers ?? [],
      imagePath: [],
      imageName: null,
    },
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
      sidebar_type: surveyPage.sidebar.type,
      sidebar_map_layers: JSON.stringify(surveyPage.sidebar.mapLayers),
      sidebar_image_path: surveyPage.sidebar.imagePath,
      sidebar_image_name: surveyPage.sidebar.imageName,
      sidebar_image_alt_text: surveyPage.sidebar.imageAltText,
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
      groups = undefined,
      fileName = undefined,
      filePath = undefined,
      ...details
    } = { ...surveySection };
    return {
      id,
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
      groups,
      parent_section: parentSectionId ?? null,
      info: {
        fi: info,
      },
      file_name: fileName,
      file_path: filePath,
    } as DBSurveyPageSection & {
      options: SectionOption[];
      subQuestions: SurveyMapSubQuestion[];
      groups: SectionOptionGroup[];
    };
  });
}

/**
 * Convert section options to db rows
 * @param sectionOptions
 * @param sectionId
 * @param optionGroupId
 * @returns DBSectionOption[]
 */
function optionsToRows(
  sectionOptions: SectionOption[],
  sectionId: number,
  optionGroupId?: number
): DBSectionOption[] {
  return sectionOptions.map((option, index) => {
    return {
      section_id: sectionId,
      id: option.id ?? null,
      idx: index,
      text: {
        fi: option.text,
      },
      info: option.info ? { fi: option.info } : null,
      group_id: optionGroupId ?? null,
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
 * Store file to database table 'data.files'
 * @param fileBuffer
 * @param filePath
 * @param fileName
 * @param mimeType
 * @param details
 * @returns Database row id of the uploaded image
 */

/**
 * Store file to database table 'data.files'
 * @param param0 File info
 * @returns Path and name of the uploaded file
 */
export async function storeFile({
  buffer,
  path,
  name,
  mimetype,
  details,
  surveyId,
}: {
  buffer: Buffer;
  path: string[];
  name: string;
  mimetype: string;
  details: { [key: string]: any };
  surveyId: number;
}) {
  const fileString = `\\x${buffer.toString('hex')}`;
  const row = await getDb().oneOrNone<{ path: string[]; name: string }>(
    `
    INSERT INTO data.files (file, details, file_path, file_name, mime_type, survey_id)
    VALUES ($(fileString), $(details), $(path), $(name), $(mimetype), $(surveyId))
    ON CONFLICT ON CONSTRAINT pk_files DO UPDATE SET
      file = $(fileString),
      details = $(details),
      file_path = $(path),
      file_name = $(name),
      mime_type = $(mimetype),
      survey_id = $(surveyId)
    RETURNING file_path AS path, file_name AS name;
    `,
    {
      fileString,
      details,
      path,
      name,
      mimetype,
      surveyId,
    }
  );

  if (!row) {
    throw new InternalServerError(`Error while inserting file to db`);
  }

  return row;
}

/**
 * Get a single file with id from the database
 * @param fileName
 * @param filePath
 * @returns SurveyBackgroudImage
 */
export async function getFile(fileName: string, filePath: string[]) {
  const row = await getDb().oneOrNone<{
    file: string;
    mime_type: string;
    details: { [key: string]: any };
  }>(
    `
    SELECT file, mime_type, details FROM data.files WHERE file_name = $1 AND file_path = $2;
  `,
    [fileName, filePath]
  );

  if (!row) {
    throw new NotFoundError(
      `File with fileName ${fileName} filePath ${filePath} not found`
    );
  }

  return {
    data: row.file,
    mimeType: row.mime_type,
    details: row.details,
  } as File;
}

/**
 * Get all survey images from the database
 * @returns SurveyBackgroundImage[]
 */
export async function getImages() {
  const rows = await getDb().manyOrNone(`
    SELECT id, details, file, file_name, file_path FROM data.files WHERE file_path = array[]::text[] ORDER BY created_at DESC;
  `);

  return rows.map((row) => ({
    id: row.id,
    data: row.file.toString('base64'),
    attributions: row.details?.attributions,
    fileName: row.file_name,
    filePath: row.file_path,
  })) as SurveyBackgroundImage[];
}

/**
 * Delete a single file from the db
 * @param fileName name of the file
 * @param filePath path of the file
 * @returns
 */
export async function removeFile(fileName: string, filePath: string[]) {
  return await getDb().none(
    `
    DELETE FROM data.files WHERE file_name = $1 AND file_path = $2;
  `,
    [fileName, filePath]
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
