import { Feature, Geometry, Point } from 'geojson';

/**
 * Does the given feature have a point geometry?
 * @param feature Feature
 * @returns Is the feature a point?
 */
export function isPointFeature(
  feature: Feature<Geometry>,
): feature is Feature<Point> {
  return feature.geometry.type === 'Point';
}
