type MimeType = 'application/pdf';

export interface AdminFile {
  name: string;
  mimeType: MimeType;
  data: Buffer;
}
