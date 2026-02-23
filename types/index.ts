import type {
  Position,
  Feature,
  FeatureCollection,
  Polygon,
  LineString,
  Point,
} from "geojson";

export type { Position, Feature, FeatureCollection, Polygon, LineString, Point };

export interface Metrics {
  area: string;
  perimeter: string;
}

export type ExtractionStage =
  | "idle"
  | "connecting"
  | "downloading"
  | "clipping"
  | "building_graph"
  | "complete"
  | "error";

export interface ExtractionProgress {
  stage: ExtractionStage;
  progress: number;
  message?: string;
}

export interface ExtractionResult {
  downloadUrl: string | null;
  fileName?: string;
}

export interface PolygonSummary {
  vertexCount: number;
  bbox: [number, number, number, number];
  areaKm2: string;
  perimeterKm: string;
}
