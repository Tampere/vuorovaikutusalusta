import { AnswerEntry } from '@interfaces/survey';
import { createSurveySubmission, getSurvey } from '@src/application/survey';
import { NotFoundError } from '@src/error';
import { validateRequest } from '@src/utils';
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { body } from 'express-validator';

const router = Router();

router.get(
  '/:name',
  asyncHandler(async (req, res) => {
    const survey = await getSurvey({ name: req.params.name });
    if (!survey.isPublished) {
      // In case the survey shouldn't be published, throw the same not found error
      throw new NotFoundError(`Survey with name ${req.params.name} not found`);
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
  ]),
  asyncHandler(async (req, res) => {
    const survey = await getSurvey({ name: req.params.name });
    if (!survey.isPublished) {
      // In case the survey shouldn't be published, throw the same not found error
      throw new NotFoundError(`Survey with name ${req.params.name} not found`);
    }
    const answerEntries: AnswerEntry[] = req.body.entries;
    await createSurveySubmission(survey.id, answerEntries);
    res.status(201).send();
  })
);

export default router;
