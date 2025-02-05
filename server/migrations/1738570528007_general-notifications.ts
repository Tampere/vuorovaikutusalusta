import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
        CREATE TABLE data.general_notification (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            message TEXT,
            message_version TEXT NOT NULL DEFAULT '1', -- initial message format version
            created_at TIMESTAMP DEFAULT now(),
            publisher TEXT REFERENCES application.user(id)
        );
    `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`DROP TABLE data.general_notification`);
}
