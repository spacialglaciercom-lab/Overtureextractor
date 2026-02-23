import { useMemo } from "react";
import { polygon, area, length, bbox } from "@turf/turf";
import type { Position, Metrics, PolygonSummary } from "../types";

export function useMeasurements(vertices: Position[], isClosed: boolean) {
  const metrics: Metrics | null = useMemo(() => {
    if (vertices.length < 3) return null;

    try {
      const closed = [...vertices, vertices[0]];
      const poly = polygon([closed]);
      const areaSqKm = area(poly) / 1_000_000;
      const perimeterKm = length(poly, { units: "kilometers" });

      return {
        area: areaSqKm.toFixed(3),
        perimeter: perimeterKm.toFixed(3),
      };
    } catch {
      return null;
    }
  }, [vertices]);

  const summary: PolygonSummary | null = useMemo(() => {
    if (!isClosed || vertices.length < 3 || !metrics) return null;

    try {
      const closed = [...vertices, vertices[0]];
      const poly = polygon([closed]);
      const bb = bbox(poly) as [number, number, number, number];

      return {
        vertexCount: vertices.length,
        bbox: bb,
        areaKm2: metrics.area,
        perimeterKm: metrics.perimeter,
      };
    } catch {
      return null;
    }
  }, [vertices, isClosed, metrics]);

  return { metrics, summary };
}
