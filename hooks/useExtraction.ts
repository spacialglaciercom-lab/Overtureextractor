import { useState, useCallback, useRef } from "react";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import axios from "axios";
import { API_BASE_URL } from "../constants/mapStyles";
import type {
  ExtractionProgress,
  ExtractionStage,
  FeatureCollection,
} from "../types";

export function useExtraction() {
  const [extractionProgress, setExtractionProgress] =
    useState<ExtractionProgress>({
      stage: "idle",
      progress: 0,
    });
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [roadsGeoJSON, setRoadsGeoJSON] = useState<FeatureCollection | null>(
    null
  );
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const previewRoads = useCallback(async (polygonGeoJSON: object) => {
    setIsLoadingPreview(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/preview`, {
        polygon: polygonGeoJSON,
      });
      setRoadsGeoJSON(response.data as FeatureCollection);
    } catch (error) {
      console.error("Preview roads error:", error);
      setRoadsGeoJSON(null);
    } finally {
      setIsLoadingPreview(false);
    }
  }, []);

  const startExtraction = useCallback((polygonGeoJSON: object) => {
    setExtractionProgress({ stage: "connecting", progress: 0 });
    setDownloadUrl(null);

    const wsUrl = API_BASE_URL.replace(/^http/, "ws");
    const ws = new WebSocket(`${wsUrl}/ws/extract`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ polygon: polygonGeoJSON }));
      setExtractionProgress({
        stage: "downloading",
        progress: 0,
        message: "Downloading Overture data...",
      });
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data as string);
        const stage = data.stage as ExtractionStage;
        const progress = (data.progress as number) || 0;
        const message = data.message as string | undefined;

        setExtractionProgress({ stage, progress, message });

        if (stage === "complete" && data.download_url) {
          setDownloadUrl(data.download_url as string);
          ws.close();
        }
      } catch (err) {
        console.error("WS parse error:", err);
      }
    };

    ws.onerror = () => {
      setExtractionProgress({
        stage: "error",
        progress: 0,
        message: "Connection error",
      });
    };

    ws.onclose = () => {
      wsRef.current = null;
    };
  }, []);

  const cancelExtraction = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setExtractionProgress({ stage: "idle", progress: 0 });
  }, []);

  const downloadGraph = useCallback(async () => {
    if (!downloadUrl) return;

    try {
      const downloadedFile = await File.downloadFileAsync(
        downloadUrl,
        Paths.cache
      );

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(downloadedFile.uri, {
          mimeType: "application/octet-stream",
          dialogTitle: "Save Graph File",
        });
      }
    } catch (error) {
      console.error("Download error:", error);
    }
  }, [downloadUrl]);

  const clearRoads = useCallback(() => {
    setRoadsGeoJSON(null);
  }, []);

  const resetExtraction = useCallback(() => {
    cancelExtraction();
    setDownloadUrl(null);
    setRoadsGeoJSON(null);
  }, [cancelExtraction]);

  return {
    extractionProgress,
    downloadUrl,
    roadsGeoJSON,
    isLoadingPreview,
    previewRoads,
    startExtraction,
    cancelExtraction,
    downloadGraph,
    clearRoads,
    resetExtraction,
  };
}
