import { GeneralNotification } from '@interfaces/generalNotification';
import { getDb } from '@src/database';

interface DBGeneralNotification {
  id: string;
  title: string;
  message: string;
  message_version: string;
  created_at: string;
  publisher?: string;
}

function DBGeneralNotificationToGeneralNotification(
  dbGeneralNotification: DBGeneralNotification,
): GeneralNotification {
  return {
    id: dbGeneralNotification.id,
    title: dbGeneralNotification.title,
    message: dbGeneralNotification.message,
    createdAt: dbGeneralNotification.created_at,
    publisher: dbGeneralNotification?.publisher,
  };
}

export const GENERAL_NOTIFICATION_TIMEOUT_DAYS = process.env
  .GENERAL_NOTIFICATION_TIMEOUT_DAYS
  ? Number(process.env.GENERAL_NOTIFICATION_TIMEOUT_DAYS)
  : 3;

export async function getRecentGeneralNotificationCount() {
  return getDb().one<{ count: number }>(
    `
    SELECT COUNT(id)
    FROM data.general_notification
    WHERE created_at > now() - interval '${GENERAL_NOTIFICATION_TIMEOUT_DAYS} day'
    `,
  );
}

export async function getGeneralNotifications() {
  const result = await getDb().manyOrNone<DBGeneralNotification>(
    `
    SELECT  
      gn.id,
      title,
      message,
      message_version,
      created_at
    FROM data.general_notification gn
    ORDER BY created_at DESC
    `,
    [],
  );

  return result.map(DBGeneralNotificationToGeneralNotification);
}

export async function getGeneralNotification(id: string) {
  const result = await getDb().oneOrNone<DBGeneralNotification>(
    `
    SELECT  
        gn.id,
        title,
        message,
        message_version,
        created_at
    FROM data.general_notification gn
    WHERE id = $1
    `,
    [id],
  );

  return result ? DBGeneralNotificationToGeneralNotification(result) : null;
}

export async function addGeneralNotification(
  data: Omit<GeneralNotification, 'id'>,
) {
  const { title, message, publisher } = data;

  return getDb().one<{ id: string }>(
    `
    INSERT INTO data.general_notification (title, message, publisher)
    VALUES ($1, $2, $3)
    RETURNING id
    `,
    [title, message, publisher],
  );
}

export async function updateGeneralNotification(
  id: string,
  data: Omit<GeneralNotification, 'id'>,
) {
  const { title, message, publisher } = data;

  return getDb().one<{ id: string }>(
    `
    UPDATE data.general_notification
    SET title = $1,
            message = $2,
            publisher = $3,
            created_at = now()
    WHERE id = $4
    RETURNING id
    `,
    [title, message, publisher, id],
  );
}

export async function deleteGeneralNotification(id: string) {
  return getDb().oneOrNone(
    `
    DELETE FROM data.general_notification
    WHERE id = $1
    RETURNING id
    `,
    [id],
  );
}
