import { MimeType as PdfMimeType } from '@interfaces/admin';
import { ImageType } from '@interfaces/survey';
import { NextFunction, Request, Response } from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import sharp from 'sharp';
import { BadRequestError } from './error';

/**
 * Middleware function for validating a request against provided validation rules.
 * @param chains Validation chains (express-validator)
 */
export function validateRequest(chains: ValidationChain[]) {
  return [
    ...chains,
    (req: Request, _res: Response, next: NextFunction) => {
      try {
        validationResult(req).throw();
        next();
      } catch (error) {
        throw new BadRequestError(`Validation error`, error);
      }
    },
  ];
}

/**
 * Encodes given text to base64.
 * @param str Text
 * @returns Base64 decoded text
 */
export function base64Encode(str: string) {
  return Buffer.from(str).toString('base64');
}

/**
 * Decodes base64 encoded text into ASCII.
 * @param str Base64 decoded text
 * @returns ASCII text
 */
export function base64Decode(str: string) {
  return Buffer.from(str, 'base64').toString('ascii');
}

function isString(text: unknown): text is string {
  return typeof text === 'string' || text instanceof String;
}

function isImageType(val: string): val is ImageType {
  return (
    val === 'backgroundImage' ||
    val === 'thanksPageImage' ||
    val === 'generalNotifications'
  );
}

export function parseImageType(val: unknown): ImageType | null {
  if (!isString(val) || !isImageType(val)) {
    throw new Error('Invalid value for imagetype');
  }
  return val;
}

function isPdfMimeType(val: string): val is PdfMimeType {
  return val === 'application/pdf';
}

export function parsePdfMimeType(val: unknown): PdfMimeType {
  if (!isString(val) || !isPdfMimeType(val)) {
    throw new Error('Invalid value for mimeType');
  }
  return val;
}

export function assertNever(value: never): never {
  throw new Error(
    `Unhandled discriminated union member: ${JSON.stringify(value)}`,
  );
}

/** Creates a compressed JPEG image buffer */
export function compressImage(image: Buffer, quality: number) {
  return sharp(image).rotate().toFormat('jpeg', { quality }).toBuffer();
}

/**
 * Function for getting alphabet characters with index
 * @param num
 * @returns
 */
export function indexToAlpha(num = 1) {
  // ASCII value of first character
  const a = 'a'.charCodeAt(0);
  const numberToCharacter = (number: number) => {
    return String.fromCharCode(a + number);
  };
  return numberToCharacter(num);
}
