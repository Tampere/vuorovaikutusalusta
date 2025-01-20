import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    ALTER TABLE DATA.answer_entry
        DROP CONSTRAINT fk_option,
        DROP CONSTRAINT fk_parent_entry,
        DROP CONSTRAINT fk_section,
        DROP CONSTRAINT fk_submission;

    ALTER TABLE DATA.answer_entry
        ADD CONSTRAINT fk_option FOREIGN KEY (value_option_id) REFERENCES "data"."option"(id) ON DELETE RESTRICT,
        ADD CONSTRAINT fk_parent_entry FOREIGN KEY (parent_entry_id) REFERENCES "data".answer_entry(id) ON DELETE RESTRICT,
        ADD CONSTRAINT fk_section FOREIGN KEY (section_id) REFERENCES "data".page_section(id) ON DELETE RESTRICT,
        ADD CONSTRAINT fk_submission FOREIGN KEY (submission_id) REFERENCES "data".submission(id) ON DELETE RESTRICT;`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
        ALTER TABLE DATA.answer_entry
            DROP CONSTRAINT fk_option,
            DROP CONSTRAINT fk_parent_entry,
            DROP CONSTRAINT fk_section,
            DROP CONSTRAINT fk_submission;

        ALTER TABLE DATA.answer_entry
            ADD CONSTRAINT fk_option FOREIGN KEY (value_option_id) REFERENCES "data"."option"(id) ON DELETE CASCADE,
            ADD CONSTRAINT fk_parent_entry FOREIGN KEY (parent_entry_id) REFERENCES "data".answer_entry(id) ON DELETE CASCADE,
            ADD CONSTRAINT fk_section FOREIGN KEY (section_id) REFERENCES "data".page_section(id) ON DELETE CASCADE,
            ADD CONSTRAINT fk_submission FOREIGN KEY (submission_id) REFERENCES "data".submission(id) ON DELETE CASCADE;`);
}
