import { useState, useCallback, useMemo } from "react";
import { point, distance } from "@turf/turf";
import { SNAP_RADIUS_KM } from "../constants/mapStyles";
import type { Position, FeatureCollection } from "../types";

interface MapPressEvent {
  geometry: {
    coordinates: number[];
  };
}

export function usePolygonDraw() {
  const [vertices, setVertices] = useState<Position[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  const startDrawing = useCallback(() => {
    setVertices([]);
    setIsClosed(false);
    setIsDrawing(true);
  }, []);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const clearPolygon = useCallback(() => {
    setVertices([]);
    setIsClosed(false);
    setIsDrawing(false);
  }, []);

  const closePolygon = useCallback(() => {
    setIsClosed(true);
    setIsDrawing(false);
  }, []);

  const handleMapPress = useCallback(
    (e: MapPressEvent) => {
      if (!isDrawing || isClosed) return;
      const coord = e.geometry.coordinates as Position;

      if (vertices.length > 2) {
        const first = point(vertices[0]);
        const tapped = point(coord);
        const dist = distance(first, tapped, { units: "kilometers" });
        if (dist < SNAP_RADIUS_KM) {
          closePolygon();
          return;
        }
      }
      setVertices((prev) => [...prev, coord]);
    },
    [isDrawing, isClosed, vertices, closePolygon]
  );

  const lineGeoJSON: FeatureCollection = useMemo(() => {
    if (vertices.length < 2) {
      return { type: "FeatureCollection", features: [] };
    }

    const coords = isClosed ? [...vertices, vertices[0]] : vertices;

    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: coords,
          },
        },
      ],
    };
  }, [vertices, isClosed]);

  const fillGeoJSON: FeatureCollection = useMemo(() => {
    if (!isClosed || vertices.length < 3) {
      return { type: "FeatureCollection", features: [] };
    }

    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Polygon",
            coordinates: [[...vertices, vertices[0]]],
          },
        },
      ],
    };
  }, [vertices, isClosed]);

  const verticesGeoJSON: FeatureCollection = useMemo(() => {
    return {
      type: "FeatureCollection",
      features: vertices.map((coord, index) => ({
        type: "Feature" as const,
        properties: { index, isFirst: index === 0 },
        geometry: {
          type: "Point" as const,
          coordinates: coord,
        },
      })),
    };
  }, [vertices]);

  const polygonGeoJSON = useMemo(() => {
    if (!isClosed || vertices.length < 3) return null;
    return {
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "Polygon" as const,
        coordinates: [[...vertices, vertices[0]]],
      },
    };
  }, [vertices, isClosed]);

  return {
    vertices,
    isDrawing,
    isClosed,
    lineGeoJSON,
    fillGeoJSON,
    verticesGeoJSON,
    polygonGeoJSON,
    startDrawing,
    stopDrawing,
    clearPolygon,
    handleMapPress,
  };
}
