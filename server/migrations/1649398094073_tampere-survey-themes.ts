import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`INSERT INTO application.theme (name, idx, data) VALUES (
    'Teema 1',
    0,
    '{
      "palette": {
        "primary": {
          "main": "#135b9a"
        },
        "secondary": {
          "main": "#abc872"
        }
      }
    }'
  );`);
  pgm.sql(`INSERT INTO application.theme (name, idx, data) VALUES (
    'Teema 2',
    1,
    '{
      "palette": {
        "primary": {
          "main": "#933457"
        },
        "secondary": {
          "main": "#f8de79"
        }
      }
    }'
  );`);
  pgm.sql(`INSERT INTO application.theme (name, idx, data) VALUES (
    'Teema 3',
    2,
    '{
      "palette": {
        "primary": {
          "main": "#346058"
        },
        "secondary": {
          "main": "#bedcd4"
        }
      }
    }'
  );`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(
    `DELETE FROM application.theme WHERE name IN ('Teema 1', 'Teema 2', 'Teema 3');`,
  );
}
