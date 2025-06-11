import path from 'path';
import { BadRequestError } from './error';

export const fileTypeRegex = {
  pdf: /pdf/,
  media: /svg|xml|png|jpg|jpeg|mp4|mkv|webm|avi|wmv|m4p|m4v|mpg|mpeg|m4v|mov/,
  all: /svg|xml|png|jpg|jpeg|pdf|vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet|xlsx|vnd\.openxmlformats-officedocument\.wordprocessingml\.document|docx|mp4|mkv|webm|avi|wmv|m4p|m4v|mpg|mpeg|m4v|mov/,
  attachment:
    /png|jpg|jpeg|pdf|vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet|xlsx|vnd\.openxmlformats-officedocument\.wordprocessingml\.document|docx|mp4|mkv|webm|avi|wmv|m4p|m4v|mpg|mpeg|m4v|mov/,
};

export async function validateBinaryFile(
  buffer: Buffer,
  fileType: keyof typeof fileTypeRegex,
  cb?: () => void,
) {
  const { fileTypeFromBuffer } = await import('file-type');

  const uint8 = new Uint8Array(buffer);
  const type = await fileTypeFromBuffer(uint8);

  if (!type) {
    return cb?.();
  }
  if (!fileTypeRegex[fileType].test(type.mime)) {
    throw new BadRequestError('Invalid file type');
  }
  return cb?.();
}

export function validateTextFile(
  fileType: keyof typeof fileTypeRegex,
  file: { originalname: string; mimetype: string },
  invalidFileCb: () => void,
  successCb?: () => void,
) {
  const validExtname = fileTypeRegex[fileType].test(
    path.extname(file.originalname).toLowerCase(),
  );
  const validMimetype = fileTypeRegex[fileType].test(file.mimetype);

  if (validExtname && validMimetype) {
    return successCb?.();
  }
  return invalidFileCb();
}

export function validateDataUrl(
  fileType: keyof typeof fileTypeRegex,
  dataUrl: string,
  invalidFileCb: () => void,
  successCb?: () => void,
) {
  const regex = new RegExp(
    `^data:(image|application|video)/(${fileTypeRegex[fileType].source});base64,.+`,
  );

  if (regex.test(dataUrl)) {
    return successCb?.();
  }
  return invalidFileCb();
}

/**
 * Converts a Data URL to a Buffer.
 * @param dataUrl - A string in the format "data:[<mime type>];base64,<data>"
 * @returns Buffer created from the Base64 encoded data.
 */
export function bufferFromDataUrl(dataUrl: string): Buffer {
  const base64Data = dataUrl.split(',')[1];
  return Buffer.from(base64Data, 'base64');
}
