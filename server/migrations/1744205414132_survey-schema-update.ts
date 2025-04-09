import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(
    `ALTER TABLE data.survey ADD COLUMN email_include_margin_images boolean DEFAULT false`,
  );
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`ALTER TABLE data.survey DROP COLUMN email_include_margin_images`);
}
