const apiURL = '/api/file/instructions';

export async function getInstructionFilename() {
  const response = await fetch(apiURL, { method: 'HEAD' });
  return JSON.parse(response.headers.get('File-details')).name;
}

export async function storeAdminInstructions(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  await fetch(apiURL, { method: 'POST', body: formData });
}
