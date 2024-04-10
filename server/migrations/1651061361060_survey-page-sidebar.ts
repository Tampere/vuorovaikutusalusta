import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(
    `ALTER TABLE data.survey_page RENAME COLUMN map_layers TO sidebar_map_layers`,
  );
  pgm.sql(`ALTER TABLE data.survey_page
    ADD COLUMN sidebar_type VARCHAR(20) DEFAULT 'map' NOT NULL,
    ADD COLUMN sidebar_image_url VARCHAR(255)
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`ALTER TABLE data.survey_page
    DROP COLUMN sidebar_type,
    DROP COLUMN sidebar_image_url
  `);
  pgm.sql(
    `ALTER TABLE data.survey_page RENAME COLUMN sidebar_map_layers TO map_layers`,
  );
}
