import { MapLayer } from '@interfaces/survey';
import { sortedBaseLayersFirst } from '@src/mapUtils';
import fetch, { Response } from 'node-fetch';
import { NotFoundError } from '../error';

const oskariLayerSelectionPluginId =
  'Oskari.mapframework.bundle.mapmodule.plugin.LayerSelectionPlugin' as const;
interface OskariLayerSelectionPlugin {
  id: typeof oskariLayerSelectionPluginId;
  config: {
    defaultBaseLayer: number;
    baseLayers: number[];
  };
}

type OskariPlugin = Record<string, any> & OskariLayerSelectionPlugin;

interface OskariAppSetup {
  configuration: {
    mapfull: {
      conf: {
        layers: MapLayer[];
        plugins: OskariPlugin[];
      };
    };
  };
}

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
    const responseJson = (await response.json()) as OskariAppSetup;

    const baseLayers =
      responseJson.configuration?.mapfull?.conf?.plugins?.find(
        (plugin) => plugin.id === oskariLayerSelectionPluginId,
      )?.config.baseLayers ?? [];
    const layers = sortedBaseLayersFirst(
      baseLayers,
      responseJson.configuration?.mapfull?.conf?.layers?.map(
        ({ id, name }) => ({
          id,
          name:
            typeof name === 'string'
              ? name
              : // For user-created datasets, the name might be a localized object instead of a string.
                // In this case, just pick the first one available
                Object.keys(name).length > 0
                ? name[Object.keys(name)[0]]
                : '<untitled layer>',
        }),
      ),
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
