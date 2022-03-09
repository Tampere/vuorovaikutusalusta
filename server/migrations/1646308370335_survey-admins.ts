import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`ALTER TABLE data.survey
    ADD COLUMN author_id VARCHAR(255),
    ADD COLUMN admins VARCHAR(255)[] DEFAULT array[]::VARCHAR(255)[],
    ADD CONSTRAINT fk_user
      FOREIGN KEY (author_id) REFERENCES "user"(id)
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`ALTER TABLE data.survey
    DROP CONSTRAINT fk_user,
    DROP COLUMN admins,
    DROP COLUMN author_id
  `);
}
