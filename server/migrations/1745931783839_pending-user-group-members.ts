import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
        CREATE TABLE application.pending_user_group_member (
            id SERIAL PRIMARY KEY,
            pending_user_id INT REFERENCES application.pending_user_requests(id) ON DELETE CASCADE,
            group_id INTEGER REFERENCES application.user_group(id) ON DELETE CASCADE);`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
            DROP TABLE application.pending_user_group_member;`);
}
