import { FileDetails } from '@interfaces/survey';
import { decodeFileDetailValues } from '@src/utils/request';

export async function getFileDetails(filePath: string): Promise<FileDetails> {
  const response = await fetch(`/api/file/${filePath}`, { method: 'HEAD' });
  const details = JSON.parse(response.headers.get('File-details') ?? '{}');

  return decodeFileDetailValues(details);
}
