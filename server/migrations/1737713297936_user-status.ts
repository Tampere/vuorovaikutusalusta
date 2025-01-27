import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`CREATE TABLE application.pending_user_requests (
    id SERIAL NOT NULL PRIMARY KEY,
    full_name bytea NOT NULL,
    email bytea NOT NULL,
    organizations text[] NOT NULL,
    roles text[] NOT NULL,
    created_at timestamp NOT NULL DEFAULT NOW()
  );`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`DROP TABLE application.pending_user_requests;`);
}
