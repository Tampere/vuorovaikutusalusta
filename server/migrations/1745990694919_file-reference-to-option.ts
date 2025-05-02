import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(
    `ALTER TABLE data.option 
    ADD COLUMN file_url TEXT REFERENCES data.files(url) ON DELETE SET NULL,
    ADD COLUMN details JSONB
      `,
  );
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`ALTER TABLE data.option DROP COLUMN file_url, DROP COLUMN details`);
}
