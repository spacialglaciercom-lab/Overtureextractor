import React, { useRef, useCallback, useEffect } from "react";
import { StyleSheet, View, Platform } from "react-native";
import MapboxGL from "@rnmapbox/maps";
import * as Location from "expo-location";
import {
  MAP_STYLE_URL,
  MAPBOX_TOKEN,
  LINE_STYLE,
  CLOSED_LINE_STYLE,
  FILL_STYLE,
  CIRCLE_STYLE,
  FIRST_VERTEX_CIRCLE_STYLE,
  ROADS_STYLE,
} from "../constants/mapStyles";
import type { FeatureCollection } from "../types";

MapboxGL.setAccessToken(MAPBOX_TOKEN);

interface MapViewProps {
  lineGeoJSON: FeatureCollection;
  fillGeoJSON: FeatureCollection;
  verticesGeoJSON: FeatureCollection;
  roadsGeoJSON: FeatureCollection | null;
  isClosed: boolean;
  isDrawing: boolean;
  onMapPress: (e: { geometry: { coordinates: number[] } }) => void;
}

export default function MapScreen({
  lineGeoJSON,
  fillGeoJSON,
  verticesGeoJSON,
  roadsGeoJSON,
  isClosed,
  isDrawing,
  onMapPress,
}: MapViewProps) {
  const mapRef = useRef<MapboxGL.MapView>(null);
  const cameraRef = useRef<MapboxGL.Camera>(null);

  useEffect(() => {
    if (Platform.OS === "ios") {
      MapboxGL.setTelemetryEnabled(false);
    }
  }, []);

  const flyToUser = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      cameraRef.current?.setCamera({
        centerCoordinate: [location.coords.longitude, location.coords.latitude],
        zoomLevel: 14,
        animationDuration: 1000,
      });
    } catch (err) {
      console.error("Location error:", err);
    }
  }, []);

  const resetBearing = useCallback(() => {
    cameraRef.current?.setCamera({
      heading: 0,
      animationDuration: 500,
    });
  }, []);

  const handlePress = useCallback(
    (feature: GeoJSON.Feature) => {
      if (!isDrawing) return;
      const coords = (feature.geometry as GeoJSON.Point).coordinates;
      onMapPress({ geometry: { coordinates: coords } });
    },
    [isDrawing, onMapPress]
  );

  return (
    <View style={styles.container}>
      <MapboxGL.MapView
        ref={mapRef}
        style={styles.map}
        styleURL={MAP_STYLE_URL}
        logoEnabled={false}
        attributionEnabled={false}
        compassEnabled={false}
        scaleBarEnabled={false}
        onPress={handlePress}
      >
        <MapboxGL.Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: [-73.5674, 45.5019],
            zoomLevel: 11,
          }}
        />

        <MapboxGL.UserLocation visible={true} />

        {/* Polygon fill layer */}
        {fillGeoJSON.features.length > 0 && (
          <MapboxGL.ShapeSource id="polygon-fill" shape={fillGeoJSON}>
            <MapboxGL.FillLayer
              id="polygon-fill-layer"
              style={{
                fillColor: FILL_STYLE.fillColor,
                fillOpacity: FILL_STYLE.fillOpacity,
              }}
            />
          </MapboxGL.ShapeSource>
        )}

        {/* Polygon outline / drawing line */}
        {lineGeoJSON.features.length > 0 && (
          <MapboxGL.ShapeSource id="polygon-line" shape={lineGeoJSON}>
            <MapboxGL.LineLayer
              id="polygon-line-layer"
              style={
                isClosed
                  ? {
                      lineColor: CLOSED_LINE_STYLE.lineColor,
                      lineWidth: CLOSED_LINE_STYLE.lineWidth,
                      lineOpacity: CLOSED_LINE_STYLE.lineOpacity,
                    }
                  : {
                      lineColor: LINE_STYLE.lineColor,
                      lineWidth: LINE_STYLE.lineWidth,
                      lineOpacity: LINE_STYLE.lineOpacity,
                      lineDasharray: [2, 1],
                    }
              }
            />
          </MapboxGL.ShapeSource>
        )}

        {/* Vertex dots */}
        {verticesGeoJSON.features.length > 0 && (
          <MapboxGL.ShapeSource id="vertices" shape={verticesGeoJSON}>
            <MapboxGL.CircleLayer
              id="vertices-circle-layer"
              filter={["!=", ["get", "isFirst"], true]}
              style={{
                circleRadius: CIRCLE_STYLE.circleRadius,
                circleColor: CIRCLE_STYLE.circleColor,
                circleStrokeColor: CIRCLE_STYLE.circleStrokeColor,
                circleStrokeWidth: CIRCLE_STYLE.circleStrokeWidth,
              }}
            />
            <MapboxGL.CircleLayer
              id="first-vertex-circle-layer"
              filter={["==", ["get", "isFirst"], true]}
              style={{
                circleRadius: FIRST_VERTEX_CIRCLE_STYLE.circleRadius,
                circleColor: FIRST_VERTEX_CIRCLE_STYLE.circleColor,
                circleStrokeColor: FIRST_VERTEX_CIRCLE_STYLE.circleStrokeColor,
                circleStrokeWidth: FIRST_VERTEX_CIRCLE_STYLE.circleStrokeWidth,
                circleOpacity: FIRST_VERTEX_CIRCLE_STYLE.circleOpacity,
              }}
            />
          </MapboxGL.ShapeSource>
        )}

        {/* Extracted roads layer */}
        {roadsGeoJSON && roadsGeoJSON.features.length > 0 && (
          <MapboxGL.ShapeSource id="roads-preview" shape={roadsGeoJSON}>
            <MapboxGL.LineLayer
              id="roads-preview-layer"
              style={{
                lineColor: ROADS_STYLE.lineColor,
                lineWidth: ROADS_STYLE.lineWidth,
                lineOpacity: ROADS_STYLE.lineOpacity,
              }}
            />
          </MapboxGL.ShapeSource>
        )}
      </MapboxGL.MapView>
    </View>
  );
}

export { MapScreen };

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
