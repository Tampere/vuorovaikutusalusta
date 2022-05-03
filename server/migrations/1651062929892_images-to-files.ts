import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    UPDATE data.files SET file_name = file_name || '.' || file_format;
    ALTER TABLE data.files DROP COLUMN file_format;
    UPDATE data.files SET details = ('{"attributions":"' || attributions || '"}')::json;
    ALTER TABLE data.files DROP COLUMN attributions;
    ALTER TABLE data.survey ADD COLUMN background_image_name VARCHAR(255);
    ALTER TABLE data.survey ADD COLUMN background_image_path text[];
    ALTER TABLE data.survey ADD CONSTRAINT fk_background_image FOREIGN KEY (background_image_path, background_image_name) REFERENCES data.files (file_path, file_name) ON DELETE SET NULL;
    UPDATE data.survey ds SET background_image_name = (SELECT file_name FROM data.files WHERE id = ds.background_image_id);
    ALTER TABLE data.survey DROP COLUMN background_image_id;
    UPDATE data.survey SET background_image_path = '{}' WHERE background_image_name IS NOT NULL;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    ALTER TABLE data.survey ADD COLUMN background_image_id INT;
    ALTER TABLE data.survey DROP CONSTRAINT fk_background_image;
    ALTER TABLE data.survey DROP COLUMN background_image_path;
    ALTER TABLE data.survey DROP COLUMN background_image_name;
    ALTER TABLE data.files ADD COLUMN attributions VARCHAR(255);
    ALTER TABLE data.files ADD COLUMN file_format VARCHAR(20);
  `);
}
