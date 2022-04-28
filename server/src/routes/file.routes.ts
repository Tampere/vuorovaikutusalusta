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
import { body, param } from 'express-validator';
import multer from 'multer';

const router = Router();
const upload = multer();

/**
 * Endpoint for inserting a single file
 */
router.post(
  '/',
  upload.single('file'),
  validateRequest([
    body('attributions')
      .isString()
      .optional({ nullable: true })
      .withMessage('Image attributions must be a string'),
  ]),
  ensureAuthenticated(),
  asyncHandler(async (req, res) => {
    const { buffer, originalname, mimetype } = req.file;
    const { attributions } = req.body;

    const id = await storeFile(buffer, originalname, mimetype, {
      attributions: attributions,
    });
    res.status(200).json({ id: id });
  })
);

/**
 * Endpoint for fetching a single local file
 */
router.get(
  '/:filePath/:fileName',
  validateRequest([
    param('fileName').isString().withMessage('fileName must be a string'),
    param('filePath').isString().withMessage('filePath must be a string'),
  ]),
  asyncHandler(async (req, res) => {
    const { fileName, filePath } = req.params;
    const filePathArray = filePath.split('/');
    const row = await getFile(fileName, filePathArray);
    res.set('Content-type', row.mimeType);
    res.status(200).send(row.data);
  })
);

/**
 * Endpoint for fetching a single global file
 */
router.get(
  '/:fileName',
  validateRequest([
    param('fileName').isString().withMessage('fileName must be a string'),
  ]),
  asyncHandler(async (req, res) => {
    const { fileName } = req.params;
    const row = await getFile(fileName, []);
    res.set('Content-type', row.mimeType);
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
  '/:filePath/:fileName',
  validateRequest([
    param('fileName').isString().withMessage('fileName must be a string'),
    param('filePath')
      .isArray()
      .optional({ nullable: true })
      .withMessage('filePath must be a string array'),
  ]),
  ensureAuthenticated(),
  asyncHandler(async (req, res) => {
    const { fileName, filePath } = req.params;
    const filePathArray = filePath.split('/');

    await removeFile(fileName, filePathArray);
    res.status(200).send();
  })
);

/**
 * Endpoint for deleting a single global file
 */
router.delete(
  '/:fileName',
  validateRequest([
    param('fileName').isString().withMessage('fileName must be a string'),
  ]),
  ensureAuthenticated(),
  asyncHandler(async (req, res) => {
    const { fileName } = req.params;

    await removeFile(fileName, []);
    res.status(200).send();
  })
);

export default router;
