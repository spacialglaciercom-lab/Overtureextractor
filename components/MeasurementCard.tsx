import React from "react";
import { StyleSheet, View, Text, Platform } from "react-native";
import { COLORS } from "../constants/mapStyles";
import type { Metrics } from "../types";

interface MeasurementCardProps {
  metrics: Metrics | null;
  vertexCount: number;
  isDrawing: boolean;
}

export default function MeasurementCard({
  metrics,
  vertexCount,
  isDrawing,
}: MeasurementCardProps) {
  if (!metrics && !isDrawing) return null;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {metrics ? (
          <>
            <View style={styles.row}>
              <Text style={styles.label}>Area</Text>
              <Text style={styles.value}>{metrics.area} km²</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Perimeter</Text>
              <Text style={styles.value}>{metrics.perimeter} km</Text>
            </View>
          </>
        ) : (
          <View style={styles.row}>
            <Text style={styles.hintText}>
              {vertexCount === 0
                ? "Tap map to add vertices"
                : `${vertexCount} point${vertexCount !== 1 ? "s" : ""} — need ${Math.max(0, 3 - vertexCount)} more`}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 100,
    left: 76,
    right: 16,
  },
  card: {
    backgroundColor: "rgba(28, 28, 30, 0.92)",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.textTertiary,
    ...(Platform.OS === "ios" && { fontFamily: "SF Pro Text" }),
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    ...(Platform.OS === "ios" && { fontFamily: "SF Pro Display" }),
    fontVariant: ["tabular-nums"],
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  hintText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    ...(Platform.OS === "ios" && { fontFamily: "SF Pro Text" }),
    flex: 1,
    textAlign: "center",
  },
});
