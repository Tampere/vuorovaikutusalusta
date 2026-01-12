import {
  sortedBaseLayersFirst,
  geometryToGeoJSONFeatureCollection,
} from './mapUtils';
import { MapLayer } from '@interfaces/survey';

// Helper function to create test layers
const createLayer = (id: number): MapLayer => ({ id, name: `Layer ${id}` });

describe('mapUtils', () => {
  describe('sortedBaseLayersFirst', () => {
    let layers: Record<number, MapLayer>;

    beforeAll(() => {
      layers = {
        1: createLayer(1),
        2: createLayer(2),
        3: createLayer(3),
        4: createLayer(4),
        10: createLayer(10),
        20: createLayer(20),
      };
    });

    it('should sort base layers to the front', () => {
      const baseLayerIds = [1, 2];
      const testLayers: MapLayer[] = [
        layers[3],
        layers[1],
        layers[4],
        layers[2],
      ];

      const result = sortedBaseLayersFirst(baseLayerIds, testLayers);

      expect(result).toEqual([layers[1], layers[2], layers[3], layers[4]]);
    });

    it('should handle all base layers', () => {
      const baseLayerIds = [1, 2, 3];
      const testLayers: MapLayer[] = [layers[3], layers[1], layers[2]];

      const result = sortedBaseLayersFirst(baseLayerIds, testLayers);

      expect(result).toHaveLength(3);
      expect(result?.map((l) => l.id)).toEqual([3, 1, 2]);
    });

    it('should handle no base layers', () => {
      const baseLayerIds: number[] = [];
      const testLayers: MapLayer[] = [layers[1], layers[2]];

      const result = sortedBaseLayersFirst(baseLayerIds, testLayers);

      expect(result).toEqual(testLayers);
    });

    it('should handle empty layers array', () => {
      const baseLayerIds = [1, 2];
      const testLayers: MapLayer[] = [];

      const result = sortedBaseLayersFirst(baseLayerIds, testLayers);

      expect(result).toEqual([]);
    });

    it('should handle undefined layers', () => {
      const baseLayerIds = [1, 2];

      const result = sortedBaseLayersFirst(baseLayerIds, undefined);

      expect(result).toBeUndefined();
    });

    it('should preserve original order within base and non-base groups', () => {
      const baseLayerIds = [10, 20];
      const testLayers: MapLayer[] = [
        layers[1],
        layers[20],
        layers[2],
        layers[10],
        layers[3],
      ];

      const result = sortedBaseLayersFirst(baseLayerIds, testLayers);

      // Base layers should be first (20, then 10)
      expect(result?.[0].id).toBe(20);
      expect(result?.[1].id).toBe(10);
      // Regular layers should follow in their original order (1, 2, 3)
      expect(result?.[2].id).toBe(1);
      expect(result?.[3].id).toBe(2);
      expect(result?.[4].id).toBe(3);
    });

    it('should handle single base layer', () => {
      const baseLayerIds = [2];
      const testLayers: MapLayer[] = [layers[1], layers[2], layers[3]];

      const result = sortedBaseLayersFirst(baseLayerIds, testLayers);

      expect(result?.[0].id).toBe(2);
      expect(result?.[1].id).toBe(1);
      expect(result?.[2].id).toBe(3);
    });

    it('should handle base layer ids that do not exist in layers', () => {
      const baseLayerIds = [99, 100];
      const testLayers: MapLayer[] = [layers[1], layers[2]];

      const result = sortedBaseLayersFirst(baseLayerIds, testLayers);

      expect(result).toEqual(testLayers);
    });
  });

  describe('geometryToGeoJSONFeatureCollection', () => {
    it('should convert geometry to GeoJSON FeatureCollection with EPSG:3067 CRS', () => {
      const geometry: GeoJSON.Geometry = {
        type: 'Point',
        coordinates: [25.0, 60.0],
      };
      const properties = { name: 'Test Point', category: 'marker' };

      const result = geometryToGeoJSONFeatureCollection(geometry, properties);

      expect(result.type).toBe('FeatureCollection');
      expect(result.crs).toBe('EPSG:3067');
      expect(result.features).toHaveLength(1);
      expect(result.features[0].type).toBe('Feature');
      expect(result.features[0].geometry).toEqual(geometry);
      expect(result.features[0].properties).toEqual(properties);
    });

    it('should handle empty properties', () => {
      const geometry: GeoJSON.Geometry = {
        type: 'Point',
        coordinates: [0, 0],
      };
      const properties = {};

      const result = geometryToGeoJSONFeatureCollection(geometry, properties);

      expect(result.features[0].properties).toEqual({});
    });

    it('should handle LineString geometry', () => {
      const geometry: GeoJSON.Geometry = {
        type: 'LineString',
        coordinates: [
          [25.0, 60.0],
          [26.0, 61.0],
        ],
      };
      const properties = { route: 'A' };

      const result = geometryToGeoJSONFeatureCollection(geometry, properties);

      expect(result.features[0].geometry.type).toBe('LineString');
      expect(result.features[0].geometry).toEqual(geometry);
    });

    it('should handle Polygon geometry', () => {
      const geometry: GeoJSON.Geometry = {
        type: 'Polygon',
        coordinates: [
          [
            [25.0, 60.0],
            [26.0, 60.0],
            [26.0, 61.0],
            [25.0, 61.0],
            [25.0, 60.0],
          ],
        ],
      };
      const properties = { area: 'test area' };

      const result = geometryToGeoJSONFeatureCollection(geometry, properties);

      expect(result.features[0].geometry.type).toBe('Polygon');
      expect(result.features[0].geometry).toEqual(geometry);
    });
  });
});
