import {
  getAttachments,
  getCSVFile,
  getGeoPackageFile,
} from '@src/application/answer';
import { userCanEditSurvey } from '@src/application/survey';
import { ensureAuthenticated } from '@src/auth';
import { BadRequestError, ForbiddenError } from '@src/error';
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { param } from 'express-validator';
import { validateRequest } from '../utils';

const router = Router();

/**
 * Endpoint for getting answer entry files for the given survey
 */
router.post(
  '/:id/file-export/csv',
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

    const exportFiles = await getCSVFile(surveyId);

    if (!exportFiles) {
      res.status(404).json({ message: 'No attachments found' });
    } else {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="data.csv"');
      res.status(200).send(exportFiles);
    }
  })
);

/**
 * Endpoint for getting answer entry files for the given survey
 */
router.post(
  '/:id/file-export/geopackage',
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

    const geopackageBuffer = await getGeoPackageFile(surveyId);
    if (!geopackageBuffer) {
      throw new BadRequestError('No answers available');
    } else {
      res.status(200);
      res.end(geopackageBuffer);
    }
  })
);

/**
 * Endpoint for getting answer attachments for given survey
 */
router.get(
  '/:id/file-export/attachments',
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

    const attachments = await getAttachments(surveyId);

    if (!attachments) {
      throw new BadRequestError('No attachments available');
    } else {
      res.status(200).json(attachments);
    }
  })
);

export default router;
