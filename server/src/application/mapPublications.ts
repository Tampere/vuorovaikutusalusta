import { MapPublication } from '@interfaces/mapPublications';
import { getDb } from '@src/database';

interface DBMapPublication {
  id: string;
  name: string;
  url: string;
}

function DBMapPublicationToMapPublication(
  dbMapPublication: DBMapPublication,
): MapPublication {
  return {
    id: dbMapPublication.id,
    name: dbMapPublication.name,
    url: dbMapPublication.url,
  };
}

export async function getMapPublications() {
  const result = await getDb().manyOrNone<DBMapPublication>(
    `
    SELECT
      id,
      name,
      url
    FROM data.map_publications
    ORDER BY name
    `,
    [],
  );

  return result.map(DBMapPublicationToMapPublication);
}

export async function addMapPublication(data: Omit<MapPublication, 'id'>) {
  return getDb().one<{ id: string }>(
    `
    INSERT INTO data.map_publications (name, url)
    VALUES ($1, $2)
    RETURNING id
    `,
    [data.name, data.url.trim()],
  );
}

export async function deleteMapPublication(id: string) {
  return getDb().oneOrNone(
    `
    DELETE FROM data.map_publications
    WHERE id = $1
    RETURNING id
    `,
    [id],
  );
}
