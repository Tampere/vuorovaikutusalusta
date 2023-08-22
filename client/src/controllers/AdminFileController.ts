import { decodeFileDetailValues } from '@src/utils/request';

const apiURL = '/api/file/instructions';

export async function getInstructionFilename() {
  const response = await fetch(apiURL, { method: 'HEAD' });
  const details = JSON.parse(response.headers.get('File-details'));
  return decodeFileDetailValues(details)?.name;
}

export async function storeAdminInstructions(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  await fetch(apiURL, { method: 'POST', body: formData });
}
