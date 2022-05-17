import { AnswerEntry } from '@interfaces/survey';
import {
  createSurveySubmission,
  getUnfinishedAnswerEntries,
} from '@src/application/submission';
import { getSurvey } from '@src/application/survey';
import { ForbiddenError, NotFoundError } from '@src/error';
import { validateRequest } from '@src/utils';
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { body, query } from 'express-validator';

const router = Router();

router.get(
  '/:name',
  asyncHandler(async (req, res) => {
    const survey = await getSurvey({ name: req.params.name });
    if (!survey.isPublished) {
      // In case the survey shouldn't be published, throw the same not found error
      throw new ForbiddenError(`Survey with name ${req.params.name} not found`);
    }
    res.json(survey);
  })
);

/**
 * Endpoint for creating a submission under the survey
 */
router.post(
  '/:name/submission',
  validateRequest([
    body('entries').isArray().withMessage('Entries must be an array'),
    body('entries.*.sectionId')
      .isNumeric()
      .withMessage('Section id must be an integer'),
    body('entries.*.type')
      .isString()
      .withMessage('Section type must be a string'),
    body('entries.*.value')
      .exists()
      .withMessage('Entry values must be provided'),
    query('token').optional().isString().withMessage('Token must be a string'),
  ]),
  asyncHandler(async (req, res) => {
    const survey = await getSurvey({ name: req.params.name });
    if (!survey.isPublished) {
      // In case the survey shouldn't be published, throw the same not found error
      throw new NotFoundError(`Survey with name ${req.params.name} not found`);
    }
    const answerEntries: AnswerEntry[] = req.body.entries;
    const unfinishedToken = req.query.token ? String(req.query.token) : null;
    await createSurveySubmission(survey.id, answerEntries, unfinishedToken);
    res.status(201).send();
  })
);

/**
 * Endpoint for saving an unfinished submission
 */
router.post(
  '/:name/unfinished-submission',
  validateRequest([
    body('entries').isArray().withMessage('Entries must be an array'),
    body('entries.*.sectionId')
      .isNumeric()
      .withMessage('Section id must be an integer'),
    body('entries.*.type')
      .isString()
      .withMessage('Section type must be a string'),
    body('entries.*.value')
      .exists()
      .withMessage('Entry values must be provided'),
    body('email').isEmail().withMessage('Email must be valid'),
    query('token').optional().isString().withMessage('Token must be a string'),
  ]),
  asyncHandler(async (req, res) => {
    const survey = await getSurvey({ name: req.params.name });
    if (!survey.isPublished) {
      // In case the survey shouldn't be published, throw the same not found error
      throw new NotFoundError(`Survey with name ${req.params.name} not found`);
    }
    const answerEntries: AnswerEntry[] = req.body.entries;
    const unfinishedToken = req.query.token ? String(req.query.token) : null;
    const token = await createSurveySubmission(
      survey.id,
      answerEntries,
      unfinishedToken,
      true
    );
    // TODO send email
    res.json({ token });
  })
);

/**
 * Endpoint for getting an unfinished submission by token
 */
router.get(
  '/:name/unfinished-submission',
  validateRequest([
    query('token').isString().withMessage('Token must be a string'),
  ]),
  asyncHandler(async (req, res) => {
    const survey = await getSurvey({ name: req.params.name });
    if (!survey.isPublished) {
      // In case the survey shouldn't be published, throw the same not found error
      throw new NotFoundError(`Survey with name ${req.params.name} not found`);
    }
    const entries = await getUnfinishedAnswerEntries(String(req.query.token));
    res.json(entries);
  })
);

export default router;
