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
import { BadRequestError, InternalServerError } from '@src/error';
import logger from '@src/logger';

import { parsePdfMimeType, validateRequest } from '@src/utils';
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { param } from 'express-validator';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';

const router = Router();

const fileTypeRegex = {
  pdf: /pdf/,
  media: /svg|png|jpg|jpeg|mp4|mkv|webm|avi|wmv|m4p|m4v|mpg|mpeg|m4v|mov/,
  all: /svg|png|jpg|jpeg|pdf|vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet|xlsx|vnd\.openxmlformats-officedocument\.wordprocessingml\.document|docx|mp4|mkv|webm|avi|wmv|m4p|m4v|mpg|mpeg|m4v|mov/,
};

function validateBinaryFile(fileType: keyof typeof fileTypeRegex) {
  return asyncHandler(async (req, _res, next) => {
    if (!req.file) {
      return next();
    }
    logger.info(JSON.stringify(req.file));
    const { buffer } = req.file;

    try {
      const { fileTypeFromBuffer } = await import('file-type');

      const uint8 = new Uint8Array(buffer);
      const type = await fileTypeFromBuffer(uint8);
      if (!type) {
        return next();
      }
      if (!type || !fileTypeRegex[fileType].test(type.mime)) {
        throw new BadRequestError('Invalid file type');
      }
      return next();
    } catch (err) {
      throw new InternalServerError('Error validating file type');
    }
  });
}

async function validateTextFile(
  fileType: keyof typeof fileTypeRegex,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) {
  try {
    const validExtname = fileTypeRegex[fileType].test(
      path.extname(file.originalname).toLowerCase(),
    );
    const validMimetype = fileTypeRegex[fileType].test(file.mimetype);
    logger.info(`validateTextFile: ${validExtname} ${validMimetype}`);
    if (validExtname && validMimetype) {
      return cb(null, true);
    }
    return cb(new BadRequestError('Invalid file type'));
  } catch (err) {
    return cb(new InternalServerError('Error validating file type'));
  }
}

function upload(fileType: keyof typeof fileTypeRegex) {
  const multerUpload = multer({
    limits: { fileSize: 10 * 1000 * 1000 },
    fileFilter: (_req, file, cb) => validateTextFile(fileType, file, cb),
  });
  logger.info(`upload: ${fileType}`);
  return {
    single: (fieldName: string) => [
      multerUpload.single(fieldName),
      validateBinaryFile(fileType),
    ],
  };
}

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
  upload('pdf').single('file'),
  ensureAuthenticated(),
  ensureSuperUserAccess(),
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
 * Endpoint for inserting a single media file
 */
router.post(
  '/media/:filePath?',
  validateRequest([
    param('filePath')
      .optional()
      .isString()
      .withMessage('filePath must be a string'),
  ]),
  upload('media').single('file'),
  ensureAuthenticated(),
  ensureFileGroupAccess(),
  asyncHandler(async (req, res) => {
    logger.info(`req.file: ${JSON.stringify(req.file)}`);
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
 * Endpoint for inserting a single file (of any accepted type)
 */
router.post(
  '/:filePath?',
  validateRequest([
    param('filePath')
      .optional()
      .isString()
      .withMessage('filePath must be a string'),
  ]),
  upload('all').single('file'),
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
