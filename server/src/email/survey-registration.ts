import useTranslations from '@src/translations/useTranslations';
import { sendMail } from './email';
import { LanguageCode } from '@interfaces/survey';

export async function sendSurveyRegistrationEmail(
  email: string,
  language: LanguageCode,
  surveyTitle: string,
  url: string,
) {
  const tr = useTranslations(language);
  try {
    await sendMail({
      message: {
        to: email,
      },
      template: 'survey-registration',
      locals: {
        subject: surveyTitle,
        surveyRegistrationInfo: tr.surveyRegistrationInfo.replace(
          '{surveyTitle}',
          surveyTitle,
        ),
        continuewithLink: tr.surveyRegistrationLink,
        url,
        noReply: tr.noReply,
      },
    });
  } catch (error) {
    // If sending the mail fails, ignore the error
    throw new Error(`Error sending submission report mail: ${error}`);
  }
}
