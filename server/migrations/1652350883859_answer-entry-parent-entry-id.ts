import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    ALTER TABLE data.answer_entry ADD COLUMN parent_entry_id INTEGER;
    ALTER TABLE data.answer_entry ADD CONSTRAINT fk_parent_entry FOREIGN KEY (parent_entry_id) REFERENCES data.answer_entry (id) ON DELETE CASCADE;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    ALTER TABLE data.answer_entry DROP CONSTRAINT fk_parent_entry;
    ALTER TABLE data.answer_entry DROP COLUMN parent_entry_id;
  `);
}
