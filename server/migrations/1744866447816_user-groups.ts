import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
        CREATE TABLE application.user_group (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                organization TEXT NOT NULL,
                CONSTRAINT unique_group_in_organization UNIQUE (name, organization));
        CREATE TABLE application.user_group_member (
                id SERIAL PRIMARY KEY,
                user_id TEXT REFERENCES application.user(id) ON DELETE CASCADE,
                group_id INTEGER REFERENCES application.user_group(id) ON DELETE CASCADE);
        CREATE TABLE data.survey_user_group (
                id SERIAL PRIMARY KEY,
                survey_id INTEGER REFERENCES data.survey(id) ON DELETE CASCADE,
                group_id INTEGER REFERENCES application.user_group(id) ON DELETE CASCADE);
        `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
        DROP TABLE application.user_group; 
        DROP TABLE application.user_group_member;
        DROP TABLE data.survey_user_group;
        `);
}
