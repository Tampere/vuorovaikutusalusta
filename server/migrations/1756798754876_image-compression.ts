import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';
import sharp from 'sharp';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query('BEGIN');

  try {
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
      const compressedFile = await sharp(fileBuffer)
        .rotate()
        .toFormat('jpeg', { quality: 20 })
        .toBuffer();
      await pgm.db.query(
        `
          UPDATE data.files
          SET compressed_file = $1
          WHERE id = $2;
        `,
        [compressedFile, row.id],
      );
    }

    await pgm.db.query('COMMIT');
  } catch (error) {
    await pgm.db.query('ROLLBACK');
    throw error;
  }
}
