import { MapLayer } from '@interfaces/survey';
import fetch, { Response } from 'node-fetch';
import { NotFoundError } from '../error';

export async function getAvailableMapLayers(
  mapUrl: string,
): Promise<MapLayer[]> {
  if (!mapUrl) {
    return [];
  }
  // Separate query parameters and possible trailing slash
  const [baseUrl, queryParams] = mapUrl.split(/\/?\?/);
  try {
    const response: Response = await fetch(
      `${baseUrl}/action?action_route=GetAppSetup&${queryParams}`,
    );
    const responseJson = (await response.json()) as {
      configuration: {
        mapfull: {
          conf: {
            layers: {
              id: number;
              name?: string;
              locale?: Record<
                'fi' | 'en' | 'sv',
                {
                  name?: string;
                }
              >;
            }[];
          };
        };
      };
    };
    const layers = responseJson.configuration?.mapfull?.conf?.layers?.map(
      ({ id, name, locale }) => ({
        id,
        // For user-created datasets, the name is inside the locale object
        name: locale?.fi?.name ?? name ?? '<untitled layer>',
      }),
    );
    // For non-existent UUIDs the full layer path won't exist in the response object
    if (!layers) {
      throw new NotFoundError('Map not found');
    }
    return layers;
  } catch (error) {
    if (error.code === 'ENOTFOUND') {
      throw new NotFoundError('Map not found');
    }
    throw error;
  }
}
