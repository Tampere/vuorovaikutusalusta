import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
  ALTER TABLE application.USER ADD COLUMN GROUPS text[] NOT NULL DEFAULT '{}'::TEXT[];
  ALTER TABLE DATA.survey ADD COLUMN GROUPS text[] NOT NULL DEFAULT '{}'::TEXT[];
  ALTER TABLE DATA.files ADD COLUMN GROUPS text[] NOT NULL DEFAULT '{}'::text[];`);
}
