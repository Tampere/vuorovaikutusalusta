import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';
import { compressImage } from '../src/utils';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  // First, add the column
  await pgm.db.query(
    `ALTER TABLE data.files ADD COLUMN compressed_file bytea;`,
  );

  const { rows } = await pgm.db.query(`
            SELECT id, mime_type, file
            FROM data.files
            WHERE mime_type LIKE 'image/%';
        `);

  for (const row of rows) {
    const fileBuffer = Buffer.from(row.file, 'base64');
    const compressedFile = await compressImage(fileBuffer, 20);
    await pgm.db.query(
      `
        UPDATE data.files
        SET compressed_file = $1
        WHERE id = $2;
      `,
      [compressedFile, row.id],
    );
  }
}
