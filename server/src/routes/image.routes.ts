import {
  getImage,
  getImages,
  removeImage,
  storeImage,
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
 * Endpoint for inserting a single survey background image
 */
router.post(
  '/',
  upload.single('surveyImage'),
  validateRequest([
    body('attributions')
      .isString()
      .optional({ nullable: true })
      .withMessage('Image attributions must be a string'),
  ]),
  ensureAuthenticated(),
  asyncHandler(async (req: any, res) => {
    const { buffer, originalname } = req.file;
    const { attributions } = req.body;

    const fileName = originalname?.split('.')[0] ?? null;
    const fileFormat = originalname?.split('.')[1] ?? null;
    const id = await storeImage(buffer, fileName, attributions, fileFormat);
    res.status(200).json({ id: id });
  })
);

/**
 * Endpoint for fetching a single survey background image
 */
router.get(
  '/:id',
  validateRequest([
    param('id').isNumeric().toInt().withMessage('ID must be a number'),
  ]),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const image = await getImage(Number(id));
    res.status(200).json(image);
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
 * Endpoint for deleting a single survey background image
 */
router.delete(
  '/:id',
  validateRequest([
    param('id').isNumeric().toInt().withMessage('ID must be a number'),
  ]),
  ensureAuthenticated(),
  asyncHandler(async (req, res) => {
    await removeImage(Number(req.params.id));
    res.status(200).send();
  })
);

export default router;
