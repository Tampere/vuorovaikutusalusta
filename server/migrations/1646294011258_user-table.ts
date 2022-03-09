import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`CREATE TABLE "user" (
    id VARCHAR(255) PRIMARY KEY NOT NULL,
    full_name TEXT,
    email TEXT
  )`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql('DROP TABLE "user"');
}
