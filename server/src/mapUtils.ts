import { MapLayer } from '@interfaces/survey';
import { Geometry } from 'geojson';

export function geometryToGeoJSONFeatureCollection(
  geometry: Geometry,
  properties: Record<string, string>,
): GeoJSON.FeatureCollection & { crs: string } {
  return {
    type: 'FeatureCollection',
    crs: 'EPSG:3067',
    features: [{ type: 'Feature', geometry: geometry, properties }],
  };
}

/** Returns a new array sorted so that the base layers (if found) are listed first. */
export function sortedBaseLayersFirst(
  baseLayerIds: number[],
  layers?: MapLayer[],
) {
  return layers?.sort((first, second) => {
    const firstIsBase = baseLayerIds.includes(first.id);
    const secondIsBase = baseLayerIds.includes(second.id);
    if (firstIsBase && !secondIsBase) {
      return -1;
    } else if (!firstIsBase && secondIsBase) {
      return 1;
    }
    return 0;
  });
}
