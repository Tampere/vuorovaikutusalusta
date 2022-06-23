import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE application.map_marker_icon (
      id SERIAL PRIMARY KEY,
      idx INTEGER,
      name VARCHAR(255),
      svg TEXT NOT NULL
    );
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`DROP TABLE application.map_marker_icon;`);
}
