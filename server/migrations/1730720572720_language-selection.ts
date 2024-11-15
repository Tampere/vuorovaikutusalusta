import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(
    `ALTER TABLE DATA.survey ADD COLUMN languages text[] NOT NULL DEFAULT '{}'::TEXT[];`,
  );
  pgm.sql(
    `
    UPDATE DATA.survey
    SET languages =
      CASE
        WHEN localisation_enabled = true THEN ARRAY['fi', 'en', 'se']
        ELSE ARRAY['fi']
      END;
    `,
  );
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`ALTER TABLE data.survey DROP COLUMN languages;`);
}
