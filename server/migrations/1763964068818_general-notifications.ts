import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`CREATE TABLE data.general_notification (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	title JSONB NOT NULL,
	message JSONB,
    message_version TEXT NOT NULL DEFAULT '1', --initial message format version
	created_at TIMESTAMP DEFAULT now(),
	publisher TEXT REFERENCES application.user(id),
	start_date TIMESTAMP,
	end_date TIMESTAMP,
	published_internally BOOLEAN NOT NULL DEFAULT false,
	published_externally BOOLEAN NOT NULL DEFAULT false
);
`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`DROP TABLE data.general_notification`);
}
