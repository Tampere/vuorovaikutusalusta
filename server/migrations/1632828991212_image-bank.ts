import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`CREATE TABLE data.images (
    id SERIAL NOT NULL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    attributions VARCHAR(255),
    image bytea,
    image_name VARCHAR(255)
  )`);

  pgm.sql(`
    ALTER TABLE data.survey ADD COLUMN background_image_id INT
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`DROP TABLE data.images`);
  pgm.sql(`ALTER TABLE data.survey DROP COLUMN background_image_id`);
}
