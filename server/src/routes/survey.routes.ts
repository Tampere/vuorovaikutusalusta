import { LanguageCode, Survey, SurveyPage } from '@interfaces/survey';
import { generatePdf } from '@src/application/pdf-generator';
import {
  getAnswerEntries,
  getSubmissionsForSurvey,
  getTimestamp,
} from '@src/application/submission';
import {
  createSurvey,
  createSurveyPage,
  deleteSurvey,
  deleteSurveyPage,
  getDistinctAutoSendToEmails,
  getFile,
  getSurvey,
  getSurveys,
  publishSurvey,
  storeFile,
  unpublishSurvey,
  updateSurvey,
  userCanEditSurvey,
} from '@src/application/survey';
import { ensureAuthenticated } from '@src/auth';
import { ForbiddenError } from '@src/error';
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../utils';
const router = Router();

/**
 * Endpoint for getting all email addresses that are used as report recipients
 */
router.get(
  '/report-emails',
  ensureAuthenticated(),
  asyncHandler(async (req, res) => {
    const emails = await getDistinctAutoSendToEmails();
    res.json(emails);
  }),
);

/**
 * Endpoint for getting all surveys.
 */
router.get(
  '/',
  validateRequest([
    query('filterByAuthored')
      .toBoolean()
      .isBoolean()
      .withMessage('filterByAuthored must be a boolean'),
    query('filterByPublished')
      .toBoolean()
      .isBoolean()
      .withMessage('filterByPublished must be a boolean'),
  ]),
  ensureAuthenticated(),
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { filterByAuthored, filterByPublished } = req.query;
    const surveys = await getSurveys(
      filterByAuthored ? userId : null,
      Boolean(filterByPublished),
    );
    res.status(200).json(surveys);
  }),
);

/**
 * Endpoint for getting a single survey
 */
router.get(
  '/:id',
  validateRequest([
    param('id').isNumeric().toInt().withMessage('ID must be a number'),
  ]),
  ensureAuthenticated(),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const survey = await getSurvey({ id });
    res.status(200).json(survey);
  }),
);

/**
 * Endpoint for creating a new survey
 */
router.post(
  '/',
  ensureAuthenticated(),
  asyncHandler(async (req, res) => {
    const createdSurvey = await createSurvey(req.user);
    res.status(201).json(createdSurvey);
  }),
);

/**
 * Endpoint for updating an existing survey
 */
router.put(
  '/:id',
  ensureAuthenticated(),
  validateRequest([
    param('id').isNumeric().toInt().withMessage('ID must be a number'),
    body('name')
      .isString()
      .optional({ nullable: true })
      .withMessage('Name must be a string'),
    body('title')
      .isObject()
      .optional({ nullable: true })
      .withMessage('Title must be a string'),
    body('subtitle')
      .isObject()
      .optional({ nullable: true })
      .withMessage('Subtitle must be a string'),
    body('author')
      .isString()
      .optional({ nullable: true })
      .withMessage('Author must be a string'),
    body('authorUnit')
      .isString()
      .optional({ nullable: true })
      .withMessage('Author unit must be a string'),
    body('backgroundImageName')
      .isString()
      .optional({ nullable: true })
      .withMessage('Background image name must be a string'),
    body('backgroundImagePath')
      .isArray()
      .optional({ nullable: true })
      .withMessage('Background image path must be an array'),
    body('thanksPageImageName')
      .isString()
      .optional({ nullable: true })
      .withMessage('Thanks page image name must be a string'),
    body('thanksPageImagePath')
      .isArray()
      .optional({ nullable: true })
      .withMessage('Thanks page image path must be an array'),
    body('startDate')
      .isString()
      .optional({ nullable: true })
      .withMessage('Start date must be a date'),
    body('endDate')
      .isString()
      .optional({ nullable: true })
      .withMessage('End date must be a date'),
    body('pages').optional().isArray().withMessage('Pages must be an array'),
    body('pages.*.id')
      .optional()
      .isNumeric()
      .toInt()
      .withMessage('Page id must be a number'),
    body('pages.*.title')
      .optional()
      .isObject()
      .withMessage('Page title must be a string'),
    body('pages.*.sections')
      .optional()
      .isArray()
      .withMessage('Sections must be an array'),
    body('pages.*.sections.*.id')
      .optional({ checkFalsy: true })
      .isNumeric()
      .withMessage('Section id must be a number'),
    body('pages.*.sections.*.type')
      .optional({ checkFalsy: true })
      .isString()
      .withMessage('Section type must be a string'),
  ]),
  asyncHandler(async (req, res) => {
    const surveyId = Number(req.params.id);
    const permissionsOk = await userCanEditSurvey(req.user, surveyId);
    if (!permissionsOk) {
      throw new ForbiddenError('User not author nor admin of the survey');
    }
    const survey: Survey = {
      ...req.body,
      id: surveyId,
      startDate: req.body.startDate ? new Date(req.body.startDate) : null,
      endDate: req.body.endDate ? new Date(req.body.endDate) : null,
      pages: req.body.pages,
    };
    const updatedSurvey = await updateSurvey(survey);
    res.status(200).json(updatedSurvey);
  }),
);

/**
 * Endpoint for deleting an existing survey
 */
router.delete(
  '/:id',
  ensureAuthenticated(),
  validateRequest([
    param('id').isNumeric().toInt().withMessage('ID must be a number'),
  ]),
  asyncHandler(async (req, res) => {
    const surveyId = Number(req.params.id);
    const permissionsOk = await userCanEditSurvey(req.user, surveyId);
    if (!permissionsOk) {
      throw new ForbiddenError('User not author nor admin of the survey');
    }
    const deletedSurvey = await deleteSurvey(surveyId);
    res.status(200).json(deletedSurvey);
  }),
);

/**
 * Endpoint for creating a new survey from the data of a previous survey
 */
router.post(
  '/:id/copy',
  ensureAuthenticated(),
  validateRequest([
    param('id').isNumeric().toInt().withMessage('ID must be a number'),
  ]),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    // Create a new empty survey
    const createdSurvey = await createSurvey(req.user);
    // Get data of the survey that were copied
    const copiedSurveyData = await getSurvey({ id });
    if (!copiedSurveyData || !createdSurvey) {
      res.status(500).json('Error while copying survey');
      return;
    }

    // Just in case: change every 'id' -field found on the copied survey into null to prevent overwriting anything
    function eachRecursive(obj) {
      for (const key in obj) {
        if (typeof obj[key] == 'object' && obj[key] !== null) {
          eachRecursive(obj[key]);
        } else {
          if (obj.hasOwnProperty('id')) {
            obj.id = null;
          }
        }
      }
    }

    eachRecursive(copiedSurveyData);

    // Duplicates all files in original survey to keep fileurls unique
    const surveyWithDuplicatedFiles = await duplicateFiles(
      copiedSurveyData,
      createdSurvey,
    );

    // For every page that exist on the copied survey's data, create a new page skeleton
    // createdSurvey.pages will already include one page on it by default
    const pageSkeletons = createdSurvey.pages;
    if (surveyWithDuplicatedFiles.pages.length > 1) {
      const additionalPages = await Promise.all(
        Array(surveyWithDuplicatedFiles.pages.length - 1)
          .fill(null)
          .map(() => createSurveyPage(createdSurvey.id)),
      );
      pageSkeletons.push(...additionalPages);
    }

    const newPages = surveyWithDuplicatedFiles.pages.map((page, index) => ({
      ...page,
      id: pageSkeletons[index].id,
    }));

    const newSurvey = {
      ...createdSurvey,
      mapUrl: surveyWithDuplicatedFiles.mapUrl,
      pages: newPages,
      thanksPage: surveyWithDuplicatedFiles.thanksPage,
    } as Survey;

    // Just to make sure that we are not overwriting the previous survey
    if (newSurvey.name === null && newSurvey.id !== id) {
      await updateSurvey(newSurvey);
      res.status(200).json(newSurvey.id);
      return;
    } else {
      res.status(500).json('Error while copying survey');
      return;
    }
  }),
);

export async function duplicateFiles<T extends object>(
  object: T,
  activeSurvey: Omit<Survey, 'createdAt' | 'updatedAt'>,
) {
  if (typeof object !== 'object' || object == null) return object;

  // check for files in attachment/media sections
  await processFileUrl(object, 'fileName', activeSurvey);
  // Check for image on sidepanel
  await processFileUrl(object, 'imageName', activeSurvey);

  await Promise.all(
    Object.keys(object).map(async (key) => {
      const child = object[key as keyof typeof object];
      if (Array.isArray(child)) {
        return Promise.all(
          child
            .filter((item) => typeof item === 'object')
            .map(async (item) => {
              await duplicateFiles(item, activeSurvey);
            }),
        );
      } else if (typeof child === 'object') {
        await duplicateFiles(child, activeSurvey);
      }
    }),
  );
  return object;
}

async function processFileUrl(
  object: { [key in 'fileName' | 'imageName']?: string } & {
    [key in 'filePath' | 'imagePath']?: string[];
  },
  key: 'fileName' | 'imageName',
  activeSurvey: Omit<Survey, 'createdAt' | 'updatedAt'>,
) {
  if (key in object && object[key] != null && typeof object[key] === 'string') {
    const row = await getFile(
      object[key],
      key === 'fileName' ? object.filePath : object.imagePath,
    );
    const { name, path } = await storeFile({
      buffer: row.data,
      path: [String(activeSurvey.id)],
      name: object[key],
      mimetype: row.mimeType,
      details: row.details,
      surveyId: activeSurvey.id,
    });

    object[key] = name;
    if (key === 'imageName') {
      object.imagePath = path;
    } else if (key === 'fileName') {
      object.filePath = path;
    }
  }
}

/**
 * Endpoint for publishing the survey
 */
router.post(
  '/:id/publish',
  ensureAuthenticated(),
  validateRequest([
    param('id').isNumeric().toInt().withMessage('ID must be a number'),
  ]),
  asyncHandler(async (req, res) => {
    const surveyId = Number(req.params.id);
    const permissionsOk = await userCanEditSurvey(req.user, surveyId);
    if (!permissionsOk) {
      throw new ForbiddenError('User not author nor admin of the survey');
    }

    const survey = await publishSurvey(surveyId);
    res.status(200).json(survey);
  }),
);

/**
 * Endpoint for unpublishing the survey
 */
router.post(
  '/:id/unpublish',
  ensureAuthenticated(),
  validateRequest([
    param('id').isNumeric().toInt().withMessage('ID must be a number'),
  ]),
  asyncHandler(async (req, res) => {
    const surveyId = Number(req.params.id);
    const permissionsOk = await userCanEditSurvey(req.user, surveyId);
    if (!permissionsOk) {
      throw new ForbiddenError('User not author nor admin of the survey');
    }

    const survey = await unpublishSurvey(surveyId);
    res.status(200).json(survey);
  }),
);

/**
 * Endpoint for creating a new survey page
 */
router.post(
  '/:id/page',
  ensureAuthenticated(),
  validateRequest([
    param('id').isNumeric().toInt().withMessage('ID must be a number'),
  ]),
  asyncHandler(async (req, res) => {
    const surveyId = Number(req.params.id);
    const permissionsOk = await userCanEditSurvey(req.user, surveyId);
    if (!permissionsOk) {
      throw new ForbiddenError('User not author nor admin of the survey');
    }
    const partialPage = req.body as Partial<SurveyPage>;
    const createdSurveyPage = await createSurveyPage(surveyId, partialPage);
    res.status(201).json(createdSurveyPage);
  }),
);

/**
 * Endpoint for deleting an existing survey page
 */
router.delete(
  '/:surveyId/page/:id',
  ensureAuthenticated(),
  validateRequest([
    param('surveyId')
      .isNumeric()
      .toInt()
      .withMessage('surveyId must be a number'),
  ]),
  validateRequest([
    param('id').isNumeric().toInt().withMessage('ID must be a number'),
  ]),
  asyncHandler(async (req, res) => {
    const pageId = Number(req.params.id);
    const surveyId = Number(req.params.surveyId);
    const permissionsOk = await userCanEditSurvey(req.user, surveyId);
    if (!permissionsOk) {
      throw new ForbiddenError('User not author nor admin of the survey');
    }

    const deletedSurveyPage = await deleteSurveyPage(pageId);
    res.status(200).json(deletedSurveyPage);
  }),
);

/**
 * Endpoint for getting the PDF report for a single submission
 */
router.get(
  '/:surveyId/report/:submissionId/:lang',
  ensureAuthenticated(),
  asyncHandler(async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const submissionId = Number(req.params.submissionId);
    const permissionsOk = await userCanEditSurvey(req.user, surveyId);
    const language = req.params.lang as LanguageCode;
    if (!permissionsOk) {
      throw new ForbiddenError('User not author nor admin of the survey');
    }

    const [survey, answerEntries, timestamp] = await Promise.all([
      getSurvey({ id: surveyId }),
      getAnswerEntries(submissionId),
      getTimestamp(submissionId),
    ]);
    const pdfBuffer = await generatePdf(
      survey,
      { id: submissionId, timestamp },
      answerEntries,
      language,
    );
    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }),
);

/**
 * Get list of submissions for a survey
 */
router.get(
  '/:id/submissions',
  ensureAuthenticated(),
  validateRequest([
    param('id').isNumeric().toInt().withMessage('ID must be a number'),
  ]),
  asyncHandler(async (req, res) => {
    const surveyId = Number(req.params.id);

    const isAdmin = await userCanEditSurvey(req.user, surveyId);

    if (!isAdmin) {
      throw new ForbiddenError('User not author nor admin of the survey');
    }

    const submissions = await getSubmissionsForSurvey(surveyId);
    res.json(submissions);
  }),
);

export default router;
