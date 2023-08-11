import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`CREATE TABLE application.files 
    (
      name TEXT, 
      mime_type TEXT, 
      description TEXT UNIQUE, 
      data BYTEA, 
      PRIMARY KEY (name, description)
    )`);
}
