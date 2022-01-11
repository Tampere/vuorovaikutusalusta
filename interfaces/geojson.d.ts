export type GeoJSONWithCRS<Base = GeoJSON.GeoJSON> = Base & {
  crs?: { type: 'name'; properties: { name: string } };
};
