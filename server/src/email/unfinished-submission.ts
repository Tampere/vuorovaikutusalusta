import { Survey } from '@interfaces/survey';
import logger from '@src/logger';
import { sendMail } from './email';

/**
 * Send submission report to given address
 */
export async function sendUnfinishedSubmissionLink({
  to,
  token,
  survey,
}: {
  to: string;
  token: string;
  survey: Survey;
}) {
  const subject = `${survey.title} - Keskeneräinen vastaus`;
  const url = `${process.env.EMAIL_APP_URL}/${survey.name}?token=${token}`;
  try {
    await sendMail({
      message: {
        to,
      },
      template: 'unfinished-submission',
      locals: {
        surveyTitle: survey.title,
        url,
        subject,
      },
    });
  } catch (error) {
    // If sending the mail fails, ignore the error
    logger.error(`Error sending unfinished submission mail: ${error}`);
  }
}
