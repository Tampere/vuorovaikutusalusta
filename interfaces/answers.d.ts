import { GeoJSONWithCRS } from './geojson';
import { LocalizedText } from './survey';

export interface DBAnswerEntry {
  details: {
    subjects?: LocalizedText[];
    classes?: LocalizedText[];
  };
  section_id: number;
  submission_id: number;
  title: LocalizedText;
  type: string;
  value_geometry: GeoJSONWithCRS<
    GeoJSON.Feature<GeoJSON.Point | GeoJSON.LineString | GeoJSON.Polygon>
  >;
  value_text: string;
  value_json: JSON[];
  value_option_id: number;
  value_numeric: number;
}

export interface DBOptionTextRow {
  section_id: number;
  text: LocalizedText;
}
