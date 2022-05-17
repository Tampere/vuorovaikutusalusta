import { Router } from 'express';
import { ensureAuthenticated } from '@src/auth';
import asyncHandler from 'express-async-handler';
import { param } from 'express-validator';
import { validateRequest } from '../utils';
import {
  getAttachments,
  getCSVFile,
  getGeoPackageFile,
} from '@src/application/answer';
import { userCanEditSurvey } from '@src/application/survey';
import { BadRequestError, ForbiddenError } from '@src/error';

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
      res.status(200).json(exportFiles);
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

    const geopackageStream = await getGeoPackageFile(surveyId);
    if (!geopackageStream) {
      throw new BadRequestError('No answers available');
    } else {
      res.status(200);
      geopackageStream.on('data', (buffer) => {
        res.write(buffer);
      });

      geopackageStream.on('end', () => {
        res.end();
      });
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
