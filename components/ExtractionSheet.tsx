import React, { useCallback, useMemo, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/mapStyles";
import ProgressBar from "./ProgressBar";
import type { PolygonSummary, ExtractionProgress } from "../types";

interface ExtractionSheetProps {
  isVisible: boolean;
  summary: PolygonSummary | null;
  extractionProgress: ExtractionProgress;
  downloadUrl: string | null;
  isLoadingPreview: boolean;
  onPreviewRoads: () => void;
  onStartExtraction: () => void;
  onDownloadGraph: () => void;
  onClose: () => void;
}

export default function ExtractionSheet({
  isVisible,
  summary,
  extractionProgress,
  downloadUrl,
  isLoadingPreview,
  onPreviewRoads,
  onStartExtraction,
  onDownloadGraph,
  onClose,
}: ExtractionSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["40%", "75%"], []);

  useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isVisible]);

  const handleClose = useCallback(() => {
    bottomSheetRef.current?.close();
    onClose();
  }, [onClose]);

  if (!isVisible || !summary) return null;

  const isExtracting =
    extractionProgress.stage !== "idle" &&
    extractionProgress.stage !== "complete" &&
    extractionProgress.stage !== "error";

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>OSM Extractor</Text>
            <TouchableOpacity onPress={handleClose} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color={COLORS.textTertiary} />
            </TouchableOpacity>
          </View>

          <View style={styles.separator} />

          {/* Polygon summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Polygon Summary</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Vertices</Text>
                <Text style={styles.summaryValue}>
                  {summary.vertexCount}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Area</Text>
                <Text style={styles.summaryValue}>
                  {summary.areaKm2} km²
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Perimeter</Text>
                <Text style={styles.summaryValue}>
                  {summary.perimeterKm} km
                </Text>
              </View>
            </View>

            <View style={styles.bboxContainer}>
              <Text style={styles.bboxLabel}>Bounding Box</Text>
              <Text style={styles.bboxValue}>
                SW: {summary.bbox[0].toFixed(4)}, {summary.bbox[1].toFixed(4)}
              </Text>
              <Text style={styles.bboxValue}>
                NE: {summary.bbox[2].toFixed(4)}, {summary.bbox[3].toFixed(4)}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          {/* Preview Roads */}
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.button, styles.previewButton]}
              onPress={onPreviewRoads}
              disabled={isLoadingPreview || isExtracting}
              activeOpacity={0.7}
            >
              {isLoadingPreview ? (
                <ActivityIndicator size="small" color={COLORS.text} />
              ) : (
                <Ionicons
                  name="eye-outline"
                  size={18}
                  color={COLORS.text}
                />
              )}
              <Text style={styles.buttonText}>
                {isLoadingPreview ? "Loading Preview..." : "Preview Roads"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Extraction */}
          <View style={styles.section}>
            {extractionProgress.stage !== "idle" && (
              <View style={styles.progressContainer}>
                <ProgressBar progress={extractionProgress} />
              </View>
            )}

            {extractionProgress.stage === "complete" && downloadUrl ? (
              <TouchableOpacity
                style={[styles.button, styles.downloadButton]}
                onPress={onDownloadGraph}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="download-outline"
                  size={18}
                  color={COLORS.text}
                />
                <Text style={styles.buttonText}>Download Graph</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.extractButton,
                  isExtracting && styles.buttonDisabled,
                ]}
                onPress={onStartExtraction}
                disabled={isExtracting}
                activeOpacity={0.7}
              >
                {isExtracting ? (
                  <ActivityIndicator size="small" color={COLORS.text} />
                ) : (
                  <Ionicons
                    name="cog-outline"
                    size={18}
                    color={COLORS.text}
                  />
                )}
                <Text style={styles.buttonText}>
                  {isExtracting ? "Extracting..." : "Extract & Process"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleIndicator: {
    backgroundColor: COLORS.surfaceElevated,
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    ...(Platform.OS === "ios" && { fontFamily: "SF Pro Display" }),
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    ...(Platform.OS === "ios" && { fontFamily: "SF Pro Text" }),
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: COLORS.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    ...(Platform.OS === "ios" && { fontFamily: "SF Pro Text" }),
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    fontVariant: ["tabular-nums"],
    ...(Platform.OS === "ios" && { fontFamily: "SF Pro Display" }),
  },
  bboxContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  bboxLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: COLORS.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
    ...(Platform.OS === "ios" && { fontFamily: "SF Pro Text" }),
  },
  bboxValue: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontVariant: ["tabular-nums"],
    ...(Platform.OS === "ios" && { fontFamily: "SF Mono" }),
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  previewButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  extractButton: {
    backgroundColor: COLORS.primary,
  },
  downloadButton: {
    backgroundColor: COLORS.success,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    ...(Platform.OS === "ios" && { fontFamily: "SF Pro Text" }),
  },
  progressContainer: {
    marginBottom: 8,
  },
});
