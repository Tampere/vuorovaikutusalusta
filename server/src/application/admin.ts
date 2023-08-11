import { AdminFile, MimeType } from '@interfaces/admin';
import { parseMimeType } from '@src/utils';
import { getDb } from '@src/database';
import { InternalServerError, NotFoundError } from '@src/error';

interface DbAdminFile {
  name: string;
  mime_type: string;
  data: Buffer;
}

function dbAdminFileToAdminFile(dbFile: DbAdminFile): AdminFile {
  return {
    name: dbFile.name,
    mimeType: parseMimeType(dbFile.mime_type),
    data: dbFile.data,
  };
}

export async function getAdminInstructions() {
  const row = await getDb().oneOrNone<DbAdminFile>(
    `SELECT name, mime_type, data FROM application.files WHERE description='admin_instructions'`
  );
  if (!row) {
    throw new NotFoundError(`Admin instructions not found`);
  }
  return dbAdminFileToAdminFile(row);
}

export async function storeAdminInstructions(
  name: string,
  mimeType: MimeType,
  data: Buffer
) {
  const row = await getDb().oneOrNone(
    `INSERT INTO application.files AS af (name, mime_type, description, data) 
        VALUES ($(name), $(mimeType), 'admin_instructions', $(data)) 
        ON CONFLICT (description) DO 
        UPDATE
          SET name = $(name), mime_type = $(mimeType), data = $(data) 
          WHERE af.description = 'admin_instructions' 
          RETURNING name`,
    { name, mimeType, data }
  );

  if (!row) {
    throw new InternalServerError(`Error while inserting file to db`);
  }

  return row;
}
