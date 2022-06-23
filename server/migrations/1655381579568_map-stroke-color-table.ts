import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE map_stroke_color (
      id SERIAL PRIMARY KEY,
      idx INTEGER,
      name VARCHAR(255),
      value VARCHAR(20) NOT NULL
    );
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`DROP TABLE map_stroke_color;`);
}
