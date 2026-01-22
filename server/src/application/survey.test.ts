import { Survey } from '@interfaces/survey';
import {
  createMockPersonalInfoQuestion,
  createMockSurvey,
} from '@tests/data/survey';
import { BadRequestError } from '../error';

// Mock the database module before importing survey
jest.mock('@src/database');
jest.mock('@src/logger');

// Import after mocking
import { getDb } from '@src/database';
import { updateSurvey } from './survey';

describe('Survey', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const mockDb = getDb() as jest.Mocked<ReturnType<typeof getDb>>;

    // Mock the transaction to execute the callback
    mockDb.tx.mockImplementation(async (callback: any) => {
      return callback(mockDb);
    });
  });

  describe('updateSurvey', () => {
    it('should throw BadRequestError when trying to add two personal info questions', async () => {
      const survey = createMockSurvey(1, 100);

      const surveyWithTwoPersonalInfoQuestions: Survey = {
        ...survey,
        pages: [
          {
            ...survey.pages![0],
            sections: [
              createMockPersonalInfoQuestion(-1),
              createMockPersonalInfoQuestion(-2),
            ],
            conditions: {},
          },
        ],
      };

      await expect(
        updateSurvey(surveyWithTwoPersonalInfoQuestions),
      ).rejects.toThrow(BadRequestError);
      await expect(
        updateSurvey(surveyWithTwoPersonalInfoQuestions),
      ).rejects.toThrow('Section count limits not respected.');
    });
  });
});
