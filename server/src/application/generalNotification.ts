import { GeneralNotification } from '@interfaces/generalNotification';
import { LocalizedText } from '@interfaces/survey';
import { getDb } from '@src/database';

interface DBGeneralNotification {
  id: string;
  title: LocalizedText;
  message: LocalizedText;
  created_at: string;
  publisher?: string;
  start_date: Date | null;
  end_date: Date | null;
  published_internally: boolean;
  published_externally: boolean;
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
    startDate: dbGeneralNotification.start_date,
    endDate: dbGeneralNotification.end_date,
    publishedInternally: dbGeneralNotification.published_internally,
    publishedExternally: dbGeneralNotification.published_externally,
  };
}

export const GENERAL_NOTIFICATION_TIMEOUT_DAYS = process.env
  .GENERAL_NOTIFICATION_TIMEOUT_DAYS
  ? Number(process.env.GENERAL_NOTIFICATION_TIMEOUT_DAYS)
  : 3;

export async function getRecentGeneralNotificationCount() {
  return getDb().one<{ count: number }>(
    `
    SELECT COUNT(id)::int
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
      created_at,
      start_date,
      end_date,
      published_internally,
      published_externally,
      publisher
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
        created_at,
        start_date,
        end_date,
        published_internally,
        published_externally,
        publisher
    FROM data.general_notification gn
    WHERE id = $1
    `,
    [id],
  );

  return result ? DBGeneralNotificationToGeneralNotification(result) : null;
}

export async function addGeneralNotification(
  data: Omit<GeneralNotification, 'id' | 'createdAt'>,
) {
  const {
    title,
    message,
    publisher,
    startDate = null,
    endDate = null,
    publishedInternally = false,
    publishedExternally = false,
  } = data;

  return getDb().one<{ id: string }>(
    `
    INSERT INTO data.general_notification (title, message, publisher, start_date, end_date, published_internally, published_externally)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id
    `,
    [
      title,
      message,
      publisher,
      startDate,
      endDate,
      publishedInternally,
      publishedExternally,
    ],
  );
}

export async function updateGeneralNotification(
  id: string,
  data: Omit<GeneralNotification, 'id' | 'createdAt'>,
) {
  const {
    title,
    message,
    publisher,
    startDate = null,
    endDate = null,
    publishedInternally = false,
    publishedExternally = false,
  } = data;

  return getDb().one<{ id: string }>(
    `
    UPDATE data.general_notification
    SET title = $1,
            message = $2,
            publisher = $3,
            start_date = $4,
            end_date = $5,
            published_internally = $6,
            published_externally = $7,
            created_at = now()
    WHERE id = $8
    RETURNING id
    `,
    [
      title,
      message,
      publisher,
      startDate,
      endDate,
      publishedInternally,
      publishedExternally,
      id,
    ],
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

export async function getPublishedNotifications(
  variant: 'internal' | 'external',
) {
  const publishedColumn =
    variant === 'internal' ? 'published_internally' : 'published_externally';

  const result = await getDb().manyOrNone<DBGeneralNotification>(
    `
    SELECT
      gn.id,
      title,
      message,
      created_at,
      start_date,
      end_date,
      published_internally,
      published_externally,
      publisher
    FROM data.general_notification gn
    WHERE ${publishedColumn} = true
      AND (start_date IS NULL OR start_date <= now())
      AND (end_date IS NULL OR end_date >= now())
    ORDER BY created_at DESC
    `,
    [],
  );

  return result.map(DBGeneralNotificationToGeneralNotification);
}
