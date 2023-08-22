import { NextFunction, Request, Response } from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import { BadRequestError } from './error';
import { FileDetails, ImageType } from '@interfaces/survey';
import { MimeType } from '@interfaces/admin';

/**
 * Middleware function for validating a request against provided validation rules.
 * @param chains Validation chains (express-validator)
 */
export function validateRequest(chains: ValidationChain[]) {
  return [
    ...chains,
    (req: Request, res: Response, next: NextFunction) => {
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

/**
 * Encode ASCII strings to UTF-8 from response headers
 */

export function encodeFileDetailValues(obj: FileDetails): FileDetails {
  return Object.keys(obj).reduce((object, key: keyof FileDetails) => {
    return {
      ...object,
      [key]: encodeURIComponent(obj[key]),
    };
  }, {});
}

function isString(text: unknown): text is string {
  return typeof text === 'string' || text instanceof String;
}

function isImageType(val: string): val is ImageType {
  return val === 'backgroundImage' || val === 'thanksPageImage';
}

export function parseImageType(val: unknown): ImageType | null {
  if (!isString(val) || !isImageType(val)) {
    throw new Error('Invalid value for imagetype');
  }
  return val;
}

function isMimeType(val: string): val is MimeType {
  return val === 'application/pdf';
}

export function parseMimeType(val: unknown): MimeType {
  if (!isString(val) || !isMimeType(val)) {
    throw new Error('Invalid value for mimeType');
  }
  return val;
}
