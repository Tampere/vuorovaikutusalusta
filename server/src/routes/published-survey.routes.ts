import { AnswerEntry, SubmissionInfo } from '@interfaces/survey';
import { generatePdf } from '@src/application/pdf-generator';
import {
  createSurveySubmission,
  getSurveyAnswerLanguage,
  getUnfinishedAnswerEntries,
} from '@src/application/submission';
import {
  getPublishedSurvey,
  getSurvey,
  getSurveyRegistration,
  registerSubmitterToSurvey,
  validateRegistrationForSubmission,
} from '@src/application/survey';
import { sendSubmissionReport } from '@src/email/submission-report';
import { sendSurveyRegistrationEmail } from '@src/email/survey-registration';
import { sendUnfinishedSubmissionLink } from '@src/email/unfinished-submission';
import { BadRequestError, ForbiddenError, NotFoundError } from '@src/error';
import { validateRequest } from '@src/utils';
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { body, query } from 'express-validator';

const router = Router();

/**
 * Endpoint for getting a published survey
 */
router.get(
  '/:name',
  validateRequest([query('test').optional().isString()]),
  asyncHandler(async (req, res) => {
    const test = req.query.test === 'true';
    const survey = await getPublishedSurvey({ name: req.params.name });
    if ((!test && !survey.isPublished) || (test && !survey.allowTestSurvey)) {
      // In case the survey shouldn't be published (or test survey not allowed if requested), throw the same not found error
      throw new ForbiddenError(`Survey with name ${req.params.name} not found`);
    }
    res.json(survey);
  }),
);

/** Endpoint for getting a published survey registration */
router.get(
  '/:name/registration/:id',
  validateRequest([query('test').optional().isString()]),
  asyncHandler(async (req, res) => {
    const { surveyId, id, hasSubmission } = await getSurveyRegistration(
      req.params.id,
    );
    res.json({ surveyId, id, hasSubmission });
  }),
);

/**
 * Endpoint for registering a submitter to a survey
 */

router.post(
  '/:name/register',
  validateRequest([
    body('email').isEmail().withMessage('Email must be valid'),
    body('language').isString().withMessage('Language must be a string'),
  ]),
  asyncHandler(async (req, res) => {
    const survey = await getPublishedSurvey({ name: req.params.name });
    const test = req.query.test === 'true';
    if (!survey.emailRegistrationRequired) {
      throw new ForbiddenError(
        'Email registration is not allowed for this survey',
      );
    }
    if ((!test && !survey.isPublished) || test) {
      throw new ForbiddenError(`Survey with name ${req.params.name} not found`);
    }

    const registration = await registerSubmitterToSurvey(
      survey.id,
      req.body.email,
    );

    await sendSurveyRegistrationEmail(
      registration.email,
      req.body.language,
      survey.title[req.body.language],
      `${process.env.EMAIL_APP_URL}/${survey.name}?registration=${registration.id}`,
    );

    res.status(201).send();
  }),
);

/**
 * Endpoint for creating a submission under the survey
 */
router.post(
  '/:name/submission',
  validateRequest([
    body('entries').isArray().withMessage('Entries must be an array'),
    body('entries.*.sectionId')
      .isNumeric()
      .withMessage('Section id must be an integer'),
    body('entries.*.type')
      .isString()
      .withMessage('Section type must be a string'),
    body('entries.*.value')
      .exists()
      .withMessage('Entry values must be provided'),
    body('info.email')
      .optional({ nullable: true })
      .isEmail()
      .withMessage('Email must be valid'),
    body('language').isString().withMessage('Language must be a string'),
    query('token').optional().isString().withMessage('Token must be a string'),
    query('registration')
      .optional()
      .isString()
      .withMessage('Registration must be a string'),
  ]),
  asyncHandler(async (req, res) => {
    const survey = await getSurvey({ name: req.params.name });
    if (!survey.isPublished) {
      // In case the survey shouldn't be published, throw the same not found error
      throw new NotFoundError(`Survey with name ${req.params.name} not found`);
    }
    const registrationId = req.query.registration
      ? String(req.query.registration)
      : null;
    if (survey.emailRegistrationRequired) {
      if (!registrationId) {
        throw new BadRequestError(
          'Registration ID is required in order to submit',
        );
      }
      await validateRegistrationForSubmission(survey.id, registrationId);
    }

    const answerEntries: AnswerEntry[] = req.body.entries;
    const answerLanguage = req.body.language;
    const unfinishedToken = req.query.token ? String(req.query.token) : null;
    const { id: submissionId, timestamp } = await createSurveySubmission(
      survey.id,
      answerEntries,
      unfinishedToken,
      registrationId,
      false,
      answerLanguage,
    );
    // We are done with this request - start sending the emails in the background
    res.status(201).send();

    // Return if email is not enabled for this survey
    if (!survey.email.enabled) {
      return;
    }

    // Generate the PDF
    const pdfFile = await generatePdf(
      survey,
      { id: submissionId, timestamp },
      survey.email.includePersonalInfo
        ? answerEntries
        : answerEntries.filter(
            (entry: AnswerEntry) => entry.type !== 'personal-info',
          ),
      answerLanguage,
    );

    // Send the report to the submitter, if they provided their email address
    const submissionInfo: SubmissionInfo = req.body.info;
    if (submissionInfo?.email) {
      sendSubmissionReport({
        to: submissionInfo.email,
        language: answerLanguage,
        survey,
        pdfFile,
        submissionId,
        answerEntries,
        includeAttachments: false,
      });
    }

    // Send the report to all auto send recipients
    (survey.email?.autoSendTo ?? []).map((email) => {
      sendSubmissionReport({
        to: email,
        language: answerLanguage,
        survey,
        pdfFile,
        submissionId,
        answerEntries,
        includeAttachments: true,
      });
    });
  }),
);

/**
 * Endpoint for saving an unfinished submission
 */
router.post(
  '/:name/unfinished-submission',
  validateRequest([
    body('entries').isArray().withMessage('Entries must be an array'),
    body('entries.*.sectionId')
      .isNumeric()
      .withMessage('Section id must be an integer'),
    body('entries.*.type')
      .isString()
      .withMessage('Section type must be a string'),
    body('entries.*.value')
      .exists()
      .withMessage('Entry values must be provided'),
    body('email').isEmail().withMessage('Email must be valid'),
    body('language').isString().withMessage('Language must be a string'),
    query('token').optional().isString().withMessage('Token must be a string'),
    query('registration')
      .optional()
      .isString()
      .withMessage('Registration must be a string'),
  ]),
  asyncHandler(async (req, res) => {
    const survey = await getSurvey({ name: req.params.name });
    if (!survey.isPublished) {
      // In case the survey shouldn't be published, throw the same not found error
      throw new NotFoundError(`Survey with name ${req.params.name} not found`);
    }
    const registrationId = req.query.registration
      ? String(req.query.registration)
      : null;
    if (survey.emailRegistrationRequired) {
      if (!registrationId) {
        throw new BadRequestError(
          'Registration ID is required in order to submit',
        );
      }
      await validateRegistrationForSubmission(survey.id, registrationId);
    }
    const answerEntries: AnswerEntry[] = req.body.entries;
    const language = req.body.language;
    const unfinishedToken = req.query.token ? String(req.query.token) : null;
    const { unfinishedToken: newToken } = await createSurveySubmission(
      survey.id,
      answerEntries,
      unfinishedToken,
      registrationId,
      true,
      language,
    );
    res.json({ token: newToken });

    // Send the email in the background
    sendUnfinishedSubmissionLink({
      to: req.body.email,
      token: newToken,
      survey,
      language,
      registrationId,
    });
  }),
);

/**
 * Endpoint for getting an unfinished submission by token
 */
router.get(
  '/:name/unfinished-submission',
  validateRequest([
    query('token').isString().withMessage('Token must be a string'),
  ]),
  asyncHandler(async (req, res) => {
    const survey = await getSurvey({ name: req.params.name });
    if (!survey.isPublished) {
      // In case the survey shouldn't be published, throw the same not found error
      throw new NotFoundError(`Survey with name ${req.params.name} not found`);
    }
    const answers = await getUnfinishedAnswerEntries(String(req.query.token));
    const language = await getSurveyAnswerLanguage(String(req.query.token));
    res.json({ answers, language });
  }),
);

export default router;
