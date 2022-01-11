import { Router } from 'express';
import surveyRouter from './survey.routes';
import publishedSurveyRouter from './published-survey.routes';
import mapRouter from './map.routes';
import imageRouter from './image.routes';

const router = Router();

router.use('/surveys', surveyRouter);
router.use('/published-surveys', publishedSurveyRouter);
router.use('/map', mapRouter);
router.use('/image', imageRouter);

export default router;
