import {
  getAdminInstructions,
  storeAdminInstructions,
} from '@src/application/admin';
import {
  getFile,
  getImages,
  removeFile,
  storeFile,
  updateDetails,
} from '@src/application/survey';
import { ensureAuthenticated } from '@src/auth';
import { parsePdfMimeType, validateRequest } from '@src/utils';
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { body, param } from 'express-validator';
import multer from 'multer';

const router = Router();
const upload = multer({ limits: { fileSize: 10 * 1000 * 1000 } });

/**
 * Endpoint for getting admin instructions
 */
router.get(
  '/instructions',

  ensureAuthenticated(),
  asyncHandler(async (_req, res) => {
    const row = await getAdminInstructions();

    res.set('Content-type', row.mimeType);
    res.set('File-details', JSON.stringify({ name: row.name }));
    res.status(200).send(row.data);
  }),
);

/**
 * Endpoint for posting new admin instructions
 */
router.post(
  '/instructions',
  upload.single('file'),
  ensureAuthenticated(),
  asyncHandler(async (req, res) => {
    const { buffer, originalname, mimetype } = req.file;
    const { name } = await storeAdminInstructions(
      originalname,
      parsePdfMimeType(mimetype),
      buffer,
    );

    res.status(200).json({ message: `File ${name} succesfully stored` });
  }),
);

/**
 * Endpoint for inserting a single file
 */
router.post(
  '/{:filePath}',
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
  }),
);

/**
 * Endpoint for fetching all available survey images with certain type specified by filepath
 */
router.get(
  '/{:filePath}',
  ensureAuthenticated(),
  asyncHandler(async (req, res) => {
    const { filePath } = req.params;
    const { compressed } = req.query;

    const filePathArray = filePath?.split('/') ?? [];
    const row = await getImages(filePathArray, compressed === 'true');

    res.status(200).json(row);
  }),
);

/**
 * Endpoint to update file details
 */
router.post(
  '/{:id}/details',
  ensureAuthenticated(),
  validateRequest([
    param('id').isInt(),
    body('attributions')
      .isString()
      .optional({ nullable: true })
      .withMessage('attributions must be a string'),
    body('imageAltText')
      .isString()
      .optional({ nullable: true })
      .withMessage('altText must be a string'),
  ]),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { ...details } = req.body;
    console.log(details);

    const result_code = (await updateDetails(Number(id), details)) ? 200 : 404;
    res.status(result_code).send();
  }),
);

/**
 * Endpoint for fetching a single local file
 */
router.get(
  '/{:filePath}/:fileName',
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
    res.set('File-details', JSON.stringify(row.details).normalize('NFC')); // Normalize to NFC to avoid issues with special characters
    res.status(200).send(row.data);
  }),
);

/**
 * Endpoint for copying existing files by filepath
 */

router.post(
  '/copy/*splat',
  ensureAuthenticated(),

  asyncHandler(async (req, res) => {
    const filePath = req.params[0];
    const newPath: string = req.body.surveyId;
    const [surveyid, fullFileName] = filePath?.split('/') ?? [];
    const row = await getFile(fullFileName, [surveyid]);

    const id = await storeFile({
      buffer: row.data,
      path: [newPath],
      name: fullFileName,
      mimetype: row.mimeType,
      details: row.details,
      surveyId: Number(newPath),
    });

    res.status(200).json(id);
  }),
);

/**
 * Endpoint for deleting a single file
 */
router.delete(
  '/{:filePath}/:fileName',
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
  }),
);

export default router;
