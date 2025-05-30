import { LanguageCode, Survey } from '@interfaces/survey';
import logger from '@src/logger';
import useTranslations from '@src/translations/useTranslations';
import { sendMail } from './email';

/**
 * Send submission report to given address
 */
export async function sendUnfinishedSubmissionLink({
  to,
  token,
  survey,
  language,
  registrationId,
}: {
  to: string;
  token: string;
  survey: Survey;
  language: LanguageCode;
  registrationId?: string;
}) {
  const tr = useTranslations(language);
  const subject = `${survey.title[language]} - ${tr.unfinishedSubmission}`;
  const searchParams = new URLSearchParams({
    ...(token && { token }),
    ...(registrationId && { registration: registrationId }),
  }).toString();

  const url = `${process.env.EMAIL_APP_URL}/${survey.name}${
    searchParams ? `?${searchParams}` : ''
  }`;
  try {
    await sendMail({
      message: {
        to,
      },
      template: 'unfinished-submission',
      locals: {
        url,
        subject,
        noReply: tr.noReply,
        unfinishedSurveyInfo: tr.unfinishedSurveyInfo.replace(
          '{surveyTitle}',
          survey.title[language],
        ),
        continueWithLink: tr.continueWithLink,
      },
    });
  } catch (error) {
    // If sending the mail fails, ignore the error
    logger.error(`Error sending unfinished submission mail: ${error}`);
  }
}
