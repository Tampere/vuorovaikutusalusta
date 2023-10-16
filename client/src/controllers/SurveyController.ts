import { Survey } from '@interfaces/survey';
import { request } from '@src/utils/request';
import { parseISO } from 'date-fns';

const apiURL = '/api/surveys';

type SerializedSurvey = Omit<Survey, 'startDate' | 'endDate'> & {
  startDate: string;
  endDate: string;
};

function deserializeSurvey(survey: SerializedSurvey): Survey {
  return {
    ...survey,
    startDate: survey.startDate ? parseISO(survey.startDate) : null,
    endDate: survey.endDate ? parseISO(survey.endDate) : null,
  };
}

/**
 * Create new survey
 */
export async function creteSurveyFromPrevious(baseSurveyId: number) {
  return await request<number>(`${apiURL}/${baseSurveyId}/copy`, {
    method: 'POST',
  });
}

/**
 * Update a survey
 */

export async function updateSurvey(id: number, activeSurvey: Survey) {
  const survey = await request<SerializedSurvey>(`/api/surveys/${id}`, {
    method: 'PUT',
    body: activeSurvey,
  });
  return deserializeSurvey(survey);
}

/**
 * Get one survey
 */

export async function getSurvey(id: number) {
  const survey = await request<SerializedSurvey>(`/api/surveys/${id}`, {
    method: 'GET',
  });

  return deserializeSurvey(survey);
}

/**
 * Get all premade surveys
 */
export async function getSurveys(
  abortController?: AbortController,
  showAuthoredOnly?: boolean,
  showPublishedOnly?: boolean
) {
  const surveys = await request<SerializedSurvey[]>(
    `${apiURL}?filterByAuthored=${showAuthoredOnly}&filterByPublished=${showPublishedOnly}`,
    {
      signal: abortController?.signal,
    }
  );
  return surveys ? surveys.map(deserializeSurvey) : [];
}

/**
 * Create a new survey
 */
export async function createNewSurvey() {
  return await request<Survey>(apiURL, { method: 'POST' });
}

/**
 * Publishes a survey
 * @param survey Survey
 */
export async function publishSurvey(survey: Survey) {
  const response = await request<SerializedSurvey>(
    `${apiURL}/${survey.id}/publish`,
    { method: 'POST' }
  );
  return deserializeSurvey(response);
}

/**
 * Unpublishes a survey
 * @param survey Survey
 */
export async function unpublishSurvey(survey: Survey) {
  const response = await request<SerializedSurvey>(
    `${apiURL}/${survey.id}/unpublish`,
    { method: 'POST' }
  );
  return deserializeSurvey(response);
}
