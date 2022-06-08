import { LanguageCode, Survey } from '@interfaces/survey';
import logger from '@src/logger';
import MarkdownIt from 'markdown-it';
import { sendMail } from './email';

// Markdown renderer
const md = new MarkdownIt({ breaks: true });

/**
 * Send submission report to given address
 */
export async function sendSubmissionReport({
  to,
  pdfFile,
  language,
  survey,
  submissionId,
}: {
  to: string;
  pdfFile: Buffer;
  language: LanguageCode;
  survey: Survey;
  submissionId: number;
}) {
  const subject = survey.email.subject ?? survey.title;
  const body = md.render(survey.email.body ?? '');
  try {
    await sendMail({
      message: {
        to,
        attachments: [
          { filename: `${survey.name}-${submissionId}.pdf`, content: pdfFile },
        ],
      },
      template: 'submission-report',
      locals: {
        body,
        subject,
      },
    });
  } catch (error) {
    // If sending the mail fails, ignore the error
    logger.error(`Error sending submission report mail: ${error}`);
  }
}
