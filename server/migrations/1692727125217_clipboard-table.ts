import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE application.clipboard (
      id SERIAL NOT NULL PRIMARY KEY,
      user_id VARCHAR(255) UNIQUE,
      page JSON,
      section JSON,
      CONSTRAINT fk_user
        FOREIGN KEY (user_id)
          REFERENCES application.user(id)
          ON DELETE CASCADE
    );
  `);
}
