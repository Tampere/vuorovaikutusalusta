import {
  getAdminInstructions,
  storeAdminInstructions,
} from '@src/application/admin';
import {
  getFile,
  getImages,
  removeFile,
  storeFile,
} from '@src/application/survey';
import {
  ensureAuthenticated,
  ensureFileGroupAccess,
  ensureSuperUserAccess,
} from '@src/auth';

import { parseMimeType, validateRequest } from '@src/utils';
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { param } from 'express-validator';
import multer from 'multer';

const router = Router();
const upload = multer({ limits: { fileSize: 10 * 1000 * 1000 } });

/** Normalizes header content to prevent issues with special characters. */
function normalizeHeaderContent(content: string) {
  return content.normalize('NFC');
}

/**
 * Endpoint for getting admin instructions
 */
router.get(
  '/instructions',
  ensureAuthenticated(),
  asyncHandler(async (_req, res) => {
    const row = await getAdminInstructions();

    res.set('Content-type', row.mimeType);
    res.set(
      'File-details',
      normalizeHeaderContent(JSON.stringify({ name: row.name })),
    );
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
  ensureSuperUserAccess(),
  asyncHandler(async (req, res) => {
    const { buffer, originalname, mimetype } = req.file;
    const { name } = await storeAdminInstructions(
      originalname,
      parseMimeType(mimetype),
      buffer,
    );

    res.status(200).json({ message: `File ${name} succesfully stored` });
  }),
);

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
  ensureFileGroupAccess(),
  asyncHandler(async (req, res) => {
    const { buffer, originalname, mimetype } = req.file;
    const path = req.params.filePath?.split('/') ?? [];

    // Pick the survey ID from the request - the rest will be the remaining details/metadata
    const { surveyId, ...details } = req.body;
    const organizations = res.locals.fileOrganizations;
    if (surveyId == null && organizations == null) {
      res
        .status(400)
        .json({ message: 'Survey ID and organizations must be provided' });
      return;
    }

    const id = await storeFile({
      buffer,
      path,
      name: originalname,
      mimetype,
      details,
      surveyId: surveyId == null ? null : Number(surveyId),
      organizationId: organizations[0], // For now, use the first organization
    });
    res.status(200).json({ id });
  }),
);

/**
 * Endpoint for fetching all available survey images with certain type specified by filepath
 */
router.get(
  '/:filePath?',
  ensureAuthenticated(),
  ensureFileGroupAccess(),
  asyncHandler(async (req, res) => {
    const { filePath } = req.params;
    const filePathArray = filePath?.split('/') ?? [];
    // For now, use the first organization
    const row = await getImages(filePathArray, res.locals.fileOrganizations[0]);

    res.status(200).json(row);
  }),
);

/**
 * Endpoint for fetching a single local file
 */
router.get(
  '/*',
  asyncHandler(async (req, res) => {
    const fileUrl = req.params[0];
    const row = await getFile(fileUrl);
    res.set('Content-type', row.mimeType);
    res.set(
      'File-details',
      normalizeHeaderContent(JSON.stringify(row.details)),
    );
    res.status(200).send(row.data);
  }),
);

/**
 * Endpoint for copying existing files by filepath
 */

router.post(
  '/copy/*',
  ensureAuthenticated(),
  ensureFileGroupAccess(),
  asyncHandler(async (req, res) => {
    const filePath = req.params[0];
    const { organizationId, surveyId } = req.body;

    const [_org, _surveyid, fullFileName] = filePath?.split('/') ?? [];
    // For now, use the first organization
    const row = await getFile(filePath);

    const id = await storeFile({
      buffer: row.data,
      path: [surveyId],
      name: fullFileName,
      mimetype: row.mimeType,
      details: row.details,
      surveyId: Number(surveyId),
      organizationId, // For now, use the first organization
    });

    res.status(200).json(id);
  }),
);

/**
 * Endpoint for deleting a single file
 */
router.delete(
  '/*',
  ensureAuthenticated(),
  ensureFileGroupAccess(),
  asyncHandler(async (req, res) => {
    const fileUrl = req.params[0];
    await removeFile(fileUrl);
    res.status(200).send();
  }),
);

export default router;
