import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
  ALTER TABLE DATA.survey 
	  ADD COLUMN top_margin_image_name text,
	  ADD COLUMN top_margin_image_path text[],
	  ADD COLUMN bottom_margin_image_name text,
	  ADD COLUMN bottom_margin_image_path text[],
	  ADD CONSTRAINT fk_thanks_page_image FOREIGN KEY (thanks_page_image_path, thanks_page_image_name) REFERENCES DATA.files(file_path, file_name) ON DELETE SET NULL,
	  ADD CONSTRAINT fk_top_margin_image FOREIGN KEY (top_margin_image_path, top_margin_image_name) REFERENCES DATA.files(file_path, file_name) ON DELETE SET NULL,
	  ADD CONSTRAINT fk_bottom_margin_image FOREIGN KEY (bottom_margin_image_path, bottom_margin_image_name) REFERENCES DATA.files(file_path, file_name) ON DELETE SET NULL;`);
}
