import { NextFunction, Request, Response } from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import { BadRequestError } from './error';
import { ImageType } from '@interfaces/survey';
import { MimeType } from '@interfaces/admin';
import { Geometry } from 'geojson';

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

export function assertNever(value: never): never {
  throw new Error(
    `Unhandled discriminated union member: ${JSON.stringify(value)}`,
  );
}

export function geometryToGeoJSONFeatureCollection(
  geometry: Geometry,
  properties: Record<string, string>,
): GeoJSON.FeatureCollection & { crs: string } {
  return {
    type: 'FeatureCollection',
    crs: 'EPSG:3067',
    features: [{ type: 'Feature', geometry: geometry, properties }],
  };
}
