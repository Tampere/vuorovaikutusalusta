import { RadioQuestionParams, SurveyParams } from '../pages/surveyEditPage';
import dayjs from 'dayjs';

export const testSurveyData: SurveyParams = {
  title: 'Testikysely',
  subtitle: 'Testikyselyn aliotsikko',
  urlName: 'testikysely',
  author: 'Testaaja',
  startDate: dayjs().add(1, 'day').format('DD.MM.YYYY HH:mm'),
  endDate: dayjs().add(1, 'year').format('DD.MM.YYYY HH:mm'),
};

export function getRadioQuestionData(pageName: string): RadioQuestionParams {
  return {
    pageName: pageName,
    title: 'Mikä on lempivärisi?',
    answerOptions: ['Punainen', 'Vihreä', 'Sininen'],
    isRequired: true,
    allowCustom: false,
    additionalInfo: 'Valitse vain yksi vaihtoehto',
  };
}
