import { NextFunction, Request, Response } from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import { BadRequestError } from './error';

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
