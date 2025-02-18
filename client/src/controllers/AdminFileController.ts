import { Survey } from '@interfaces/survey';
import { request } from '@src/utils/request';

const apiURL = '/api/file';

export async function getInstructionFilename() {
  const response = await fetch(`${apiURL}/instructions`, { method: 'HEAD' });
  return JSON.parse(response.headers.get('File-details')).name;
}

export async function storeAdminInstructions(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  await fetch(`${apiURL}/instructions`, { method: 'POST', body: formData });
}

export async function duplicateFileOnDb(
  originalPath: string,
  targetSurveyId: number,
  sourceSurveyId: String,
) {
  const response = await request<{ path: string[]; name: string }>(
    `${apiURL}/copy/${sourceSurveyId}/${originalPath}`,
    {
      method: 'POST',
      body: { surveyId: String(targetSurveyId) },
    },
  );
  return response;
}

export async function duplicateFiles<T extends object>(
  object: T,
  activeSurvey: Survey,
) {
  if (typeof object !== 'object' || object == null) return object;

  // check for files in attachment/media sections
  await processFileUrl(object, 'fileName', activeSurvey);
  // Check for image on sidepanel
  await processFileUrl(object, 'imageName', activeSurvey);

  Object.keys(object).map((key) => {
    const child = object[key as keyof typeof object];
    if (Array.isArray(child)) {
      child
        .filter((item) => typeof item === 'object')
        .map((item) => {
          duplicateFiles(item, activeSurvey);
        });
    } else if (typeof child === 'object') {
      duplicateFiles(child, activeSurvey);
    }
  });
  return object;
}

async function processFileUrl(
  object: { [key in 'fileName' | 'imageName']?: string } & {
    [key in 'filePath' | 'imagePath']?: string[];
  },
  key: 'fileName' | 'imageName',
  activeSurvey: Survey,
) {
  if (key in object && object[key] != null && typeof object[key] === 'string') {
    const { path, name } = await duplicateFileOnDb(
      object[key],
      activeSurvey.id,
      key === 'fileName' ? object.filePath[0] : object.imagePath[0],
    );
    object[key] = name;
    if (key === 'imageName') {
      object.imagePath = path;
    } else if (key === 'fileName') {
      object.filePath = path;
    }
  }
}
