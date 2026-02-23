import React, { useCallback, useRef } from "react";
import { StyleSheet, View } from "react-native";
import * as Location from "expo-location";
import MapboxGL from "@rnmapbox/maps";
import MapScreen from "../components/MapView";
import DrawingToolbar from "../components/DrawingToolbar";
import MeasurementCard from "../components/MeasurementCard";
import ExtractionSheet from "../components/ExtractionSheet";
import { usePolygonDraw } from "../hooks/usePolygonDraw";
import { useMeasurements } from "../hooks/useMeasurements";
import { useExtraction } from "../hooks/useExtraction";

export default function MainScreen() {
  const cameraRef = useRef<MapboxGL.Camera>(null);

  const {
    vertices,
    isDrawing,
    isClosed,
    lineGeoJSON,
    fillGeoJSON,
    verticesGeoJSON,
    polygonGeoJSON,
    startDrawing,
    clearPolygon,
    handleMapPress,
  } = usePolygonDraw();

  const { metrics, summary } = useMeasurements(vertices, isClosed);

  const {
    extractionProgress,
    downloadUrl,
    roadsGeoJSON,
    isLoadingPreview,
    previewRoads,
    startExtraction,
    downloadGraph,
    resetExtraction,
  } = useExtraction();

  const handlePreviewRoads = useCallback(() => {
    if (polygonGeoJSON) {
      previewRoads(polygonGeoJSON);
    }
  }, [polygonGeoJSON, previewRoads]);

  const handleStartExtraction = useCallback(() => {
    if (polygonGeoJSON) {
      startExtraction(polygonGeoJSON);
    }
  }, [polygonGeoJSON, startExtraction]);

  const handleClear = useCallback(() => {
    clearPolygon();
    resetExtraction();
  }, [clearPolygon, resetExtraction]);

  const handleCloseSheet = useCallback(() => {
    // Sheet closed — keep polygon visible but collapse sheet
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

  return (
    <View style={styles.container}>
      <MapScreen
        lineGeoJSON={lineGeoJSON}
        fillGeoJSON={fillGeoJSON}
        verticesGeoJSON={verticesGeoJSON}
        roadsGeoJSON={roadsGeoJSON}
        isClosed={isClosed}
        isDrawing={isDrawing}
        onMapPress={handleMapPress}
      />

      <DrawingToolbar
        isDrawing={isDrawing}
        isClosed={isClosed}
        hasVertices={vertices.length > 0}
        onStartDrawing={startDrawing}
        onClear={handleClear}
        onFlyToUser={flyToUser}
        onResetBearing={resetBearing}
      />

      <MeasurementCard
        metrics={metrics}
        vertexCount={vertices.length}
        isDrawing={isDrawing}
      />

      <ExtractionSheet
        isVisible={isClosed && summary !== null}
        summary={summary}
        extractionProgress={extractionProgress}
        downloadUrl={downloadUrl}
        isLoadingPreview={isLoadingPreview}
        onPreviewRoads={handlePreviewRoads}
        onStartExtraction={handleStartExtraction}
        onDownloadGraph={downloadGraph}
        onClose={handleCloseSheet}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
});
