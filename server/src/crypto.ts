import * as crypto from 'crypto';
import { base64Decode, base64Encode } from './utils';

const algorithm = 'aes-256-ctr';
// When loading the module, randomize key and initialization vector.
// This won't work if there are multiple server instances running - in that case the key should be stored in envs.
const secretKey = crypto.randomBytes(16).toString('hex');
const iv = crypto.randomBytes(16);

/**
 * Encrypts given text.
 * Returns an object containing "iv" (initialization vector) and "content" (encrypted content).
 * The object is stringified and returned as base64 encoded.
 * @param text Text to be encrypted
 * @returns Encrypted data
 */
export function encrypt(text: string) {
  if (!text) {
    return null;
  }
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return base64Encode(
    JSON.stringify({
      iv: iv.toString('hex'),
      content: encrypted.toString('hex'),
    }),
  );
}

/**
 * Decrypts given base64 decoded JSON object (containing encrypted data) into plain text.
 * @param encrypted Encrypted data
 * @returns Decrypted text
 */
export function decrypt(encrypted: string) {
  if (!encrypted) {
    return null;
  }
  const hash = JSON.parse(base64Decode(encrypted));
  const decipher = crypto.createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(hash.iv, 'hex'),
  );
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(hash.content, 'hex')),
    decipher.final(),
  ]);

  return decrypted.toString();
}
