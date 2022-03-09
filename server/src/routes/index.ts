import { Router } from 'express';
import imageRouter from './image.routes';
import mapRouter from './map.routes';
import publishedSurveyRouter from './published-survey.routes';
import surveyRouter from './survey.routes';
import userRouter from './user.routes';

const router = Router();

router.use('/surveys', surveyRouter);
router.use('/published-surveys', publishedSurveyRouter);
router.use('/map', mapRouter);
router.use('/image', imageRouter);
router.use('/users', userRouter);

export default router;
