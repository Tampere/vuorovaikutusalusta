import {
  getFile,
  getImages,
  removeFile,
  storeFile,
} from '@src/application/survey';
import { ensureAuthenticated } from '@src/auth';
import { validateRequest } from '@src/utils';
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { param } from 'express-validator';
import multer from 'multer';

const router = Router();
const upload = multer();

/**
 * Endpoint for inserting a single file
 */
router.post(
  '/:filePath?',
  validateRequest([
    param('filePath')
      .optional()
      .isString()
      .withMessage('filePath must be a string'),
  ]),
  upload.single('file'),
  ensureAuthenticated(),
  asyncHandler(async (req, res) => {
    const { buffer, originalname, mimetype } = req.file;
    const path = req.params.filePath?.split('/') ?? [];

    // Pick the survey ID from the request - the rest will be the remaining details/metadata
    const { surveyId, ...details } = req.body;

    const id = await storeFile({
      buffer,
      path,
      name: originalname,
      mimetype,
      details,
      surveyId: surveyId == null ? null : Number(surveyId),
    });
    res.status(200).json({ id });
  })
);

/**
 * Endpoint for fetching a single local file
 */
router.get(
  '/:filePath?/:fileName',
  validateRequest([
    param('fileName').isString().withMessage('fileName must be a string'),
    param('filePath')
      .optional()
      .isString()
      .withMessage('filePath must be a string'),
  ]),
  asyncHandler(async (req, res) => {
    const { fileName, filePath } = req.params;
    const filePathArray = filePath?.split('/') ?? [];
    const row = await getFile(fileName, filePathArray);
    res.set('Content-type', row.mimeType);
    res.set('File-details', JSON.stringify(row.details));
    res.status(200).send(row.data);
  })
);

/**
 * Endpoint for fetching all available survey background images
 */
router.get(
  '/',
  ensureAuthenticated(),
  asyncHandler(async (req, res) => {
    const row = await getImages();
    res.status(200).json(row);
  })
);

/**
 * Endpoint for deleting a single file
 */
router.delete(
  '/:filePath?/:fileName',
  validateRequest([
    param('fileName').isString().withMessage('fileName must be a string'),
    param('filePath')
      .optional()
      .isString()
      .withMessage('filePath must be a string'),
  ]),
  ensureAuthenticated(),
  asyncHandler(async (req, res) => {
    const { fileName, filePath } = req.params;
    const filePathArray = filePath?.split('/') ?? [];

    await removeFile(fileName, filePathArray);
    res.status(200).send();
  })
);

export default router;
