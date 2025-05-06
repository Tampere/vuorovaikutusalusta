type PdfMimeType = 'application/pdf';

export interface AdminFile {
  name: string;
  mimeType: PdfMimeType;
  data: Buffer;
}
