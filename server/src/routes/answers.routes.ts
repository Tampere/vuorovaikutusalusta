import {
  getAttachments,
  getCSVFile,
  getGeometryDBEntriesAsGeoJSON,
  getGeoPackageFile,
} from '@src/application/answer';
import { userCanViewSurvey } from '@src/application/survey';
import { ensureAuthenticated, ensureSurveyGroupAccess } from '@src/auth';
import { BadRequestError, ForbiddenError } from '@src/error';
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { param, query } from 'express-validator';
import { validateRequest } from '../utils';

const router = Router();

/**
 * Endpoint for getting answer entry files for the given survey
 */
router.get(
  '/:id/file-export/csv',
  ensureAuthenticated(),
  ensureSurveyGroupAccess(),
  validateRequest([
    param('id').isNumeric().toInt().withMessage('ID must be a number'),
  ]),
  asyncHandler(async (req, res) => {
    const surveyId = Number(req.params.id);
    const permissionsOk = await userCanViewSurvey(req.user, surveyId);
    if (!permissionsOk) {
      throw new ForbiddenError(
        'User not author, editor nor viewer of the survey',
      );
    }

    const exportFiles = await getCSVFile(surveyId);

    if (!exportFiles) {
      res.status(404).json({ message: 'No attachments found' });
    } else {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="data.csv"');
      res.status(200).send(exportFiles);
    }
  }),
);

/**
 * Endpoint for getting answer entry files for the given survey
 */
router.get(
  '/:id/file-export/geopackage',
  ensureAuthenticated(),
  ensureSurveyGroupAccess(),
  validateRequest([
    param('id').isNumeric().toInt().withMessage('ID must be a number'),
  ]),
  asyncHandler(async (req, res) => {
    const surveyId = Number(req.params.id);
    const permissionsOk = await userCanViewSurvey(req.user, surveyId);
    if (!permissionsOk) {
      throw new ForbiddenError(
        'User not author, editor nor viewer of the survey',
      );
    }

    const geopackageBuffer = await getGeoPackageFile(surveyId);
    if (!geopackageBuffer) {
      throw new BadRequestError('No answers available');
    } else {
      res.status(200);
      res.end(geopackageBuffer);
    }
  }),
);

/**
 * Endpoint for getting answer attachments for given survey
 */
router.get(
  '/:id/file-export/attachments',
  ensureAuthenticated(),
  ensureSurveyGroupAccess(),
  validateRequest([
    param('id').isNumeric().toInt().withMessage('ID must be a number'),
  ]),
  asyncHandler(async (req, res) => {
    const surveyId = Number(req.params.id);
    const permissionsOk = await userCanViewSurvey(req.user, surveyId);
    if (!permissionsOk) {
      throw new ForbiddenError(
        'User not author, editor nor viewer of the survey',
      );
    }

    const attachments = await getAttachments(surveyId);

    if (!attachments) {
      throw new BadRequestError('No attachments available');
    } else {
      res.status(200).json(attachments);
    }
  }),
);

/**
 * Get submissions for the map questions as vector layers
 */
router.get(
  '/:id/map',
  ensureAuthenticated(),
  ensureSurveyGroupAccess(),
  validateRequest([
    param('id').isNumeric().toInt().withMessage('ID must be a number'),
    query('question').toArray()
  ]),
  asyncHandler(async (req, res) => {
    const surveyId = Number(req.params.id);
    const isEditor = await userCanViewSurvey(req.user, surveyId);
    if (!isEditor) {
      throw new ForbiddenError(
        'User not author, editor nor viewer of the survey',
      );
    }

    const layers = await getGeometryDBEntriesAsGeoJSON(surveyId) ?? {};
    const layerArr = Object.entries(layers)

    // Filter layers by question number(s), possibly received as query parameters
    const questionsToReturn = (req.query.question as string[])
    .map(q => parseInt(q))
    .filter(q => !isNaN(q) && q > 0 && q <= layerArr.length);

    // To do: Use Object.fromEntries instead of reduce. Currently it gives a Typescript error
    res.json(
      !questionsToReturn.length ? layers : questionsToReturn.reduce((filtered, i) => {
        const layer = layerArr[i-1];
        filtered[layer[0]] = layer[1];
        return filtered
      }, {})
    );
  }),
);

export default router;
