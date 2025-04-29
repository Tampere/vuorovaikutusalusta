import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`INSERT INTO application.theme (name, idx, data) VALUES (
    'Teema 7',
    6,
    '{
      "palette": {
        "primary": {
          "main": "#0050BB",
          "light": "#0050BB",
          "dark": "#0050BB"
        },
        "secondary": {
          "main": "#012169",
          "light": "#012169",
          "dark": "#012169"
        }
      }
    }'
  );`);
  pgm.sql(`INSERT INTO application.theme (name, idx, data) VALUES (
    'Teema 8',
    7,
    '{
      "palette": {
        "primary": {
          "main": "#0050BB",
          "light": "#0050BB",
          "dark": "#0050BB"
        },
        "secondary": {
          "main": "#24573C",
          "light": "#24573C",
          "dark": "#24573C"
        }
      }
    }'
  );`);
  pgm.sql(`INSERT INTO application.theme (name, idx, data) VALUES (
    'Teema 9',
    8,
    '{
      "palette": {
        "primary": {
          "main": "#012169",
          "light": "#012169",
          "dark": "#012169"
        },
        "secondary": {
          "main": "#24573C",
          "light": "#24573C",
          "dark": "#24573C"
        }
      }
    }'
  );`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(
    `DELETE FROM application.theme WHERE name IN ('Teema 7', 'Teema 8', 'Teema 9');`,
  );
}
