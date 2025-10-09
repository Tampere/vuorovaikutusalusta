import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(
    `ALTER TABLE data.survey
    ADD COLUMN thanks_image_display_attributions boolean NOT NULL DEFAULT TRUE,
    ADD COLUMN background_image_display_attributions boolean NOT NULL DEFAULT TRUE;`,
  );
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    ALTER TABLE data.survey
    DROP COLUMN thanks_image_display_attributions,
    DROP COLUMN background_image_display_attributions;`);
}
