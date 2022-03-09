import { Survey, SurveyPage } from '@interfaces/survey';
import {
  createSurvey,
  createSurveyPage,
  deleteSurvey,
  deleteSurveyPage,
  getSurvey,
  getSurveys,
  publishSurvey,
  unpublishSurvey,
  updateSurvey,
  userCanEditSurvey,
} from '@src/application/survey';
import { ensureAuthenticated } from '@src/auth';
import { ForbiddenError } from '@src/error';
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { body, param } from 'express-validator';
import { validateRequest } from '../utils';

const router = Router();

/**
 * Endpoint for getting all surveys.
 */
router.get(
  '/',
  ensureAuthenticated(),
  asyncHandler(async (req, res) => {
    const surveys = await getSurveys();
    res.status(200).json(surveys);
  })
);

/**
 * Endpoint for getting a single survey
 */
router.get(
  '/:id',
  validateRequest([
    param('id').isNumeric().toInt().withMessage('ID must be a number'),
  ]),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const survey = await getSurvey({ id });
    res.status(200).json(survey);
  })
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
  })
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
      .isString()
      .optional({ nullable: true })
      .withMessage('Title must be a string'),
    body('subtitle')
      .isString()
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
    body('backgroundImageId')
      .isNumeric()
      .optional({ nullable: true })
      .withMessage('Background image id must be a number'),
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
      .isString()
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
  })
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
  })
);

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
    const survey = await publishSurvey(surveyId);
    res.status(200).json(survey);
  })
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
    const survey = await unpublishSurvey(surveyId);
    res.status(200).json(survey);
  })
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
    const id = Number(req.params.id);
    const partialPage = req.body as Partial<SurveyPage>;
    const createdSurveyPage = await createSurveyPage(id, partialPage);
    res.status(201).json(createdSurveyPage);
  })
);

/**
 * Endpoint for deleting an existing survey page
 */
router.delete(
  '/page/:id',
  ensureAuthenticated(),
  validateRequest([
    param('id').isNumeric().toInt().withMessage('ID must be a number'),
  ]),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const deletedSurveyPage = await deleteSurveyPage(id);
    res.status(200).json(deletedSurveyPage);
  })
);

export default router;
