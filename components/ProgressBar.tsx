import React, { useEffect } from "react";
import { StyleSheet, View, Text, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/mapStyles";
import type { ExtractionProgress, ExtractionStage } from "../types";

const STAGE_CONFIG: Record<
  ExtractionStage,
  { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  idle: { label: "Ready", icon: "ellipse-outline", color: COLORS.textTertiary },
  connecting: {
    label: "Connecting...",
    icon: "wifi-outline",
    color: COLORS.warning,
  },
  downloading: {
    label: "Downloading",
    icon: "cloud-download-outline",
    color: COLORS.primary,
  },
  clipping: {
    label: "Clipping",
    icon: "cut-outline",
    color: COLORS.primary,
  },
  building_graph: {
    label: "Building Graph",
    icon: "git-network-outline",
    color: COLORS.primary,
  },
  complete: {
    label: "Complete",
    icon: "checkmark-circle",
    color: COLORS.success,
  },
  error: {
    label: "Error",
    icon: "alert-circle",
    color: COLORS.error,
  },
};

interface ProgressBarProps {
  progress: ExtractionProgress;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    animatedWidth.value = withTiming(progress.progress / 100, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress.progress, animatedWidth]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value * 100}%`,
  }));

  const config = STAGE_CONFIG[progress.stage];
  if (progress.stage === "idle") return null;

  return (
    <View style={styles.container}>
      <View style={styles.stageRow}>
        <Ionicons name={config.icon} size={18} color={config.color} />
        <Text style={[styles.stageLabel, { color: config.color }]}>
          {config.label}
        </Text>
        <Text style={styles.percentText}>
          {Math.round(progress.progress)}%
        </Text>
      </View>

      <View style={styles.track}>
        <Animated.View
          style={[
            styles.bar,
            barStyle,
            { backgroundColor: config.color },
          ]}
        />
      </View>

      {progress.message && (
        <Text style={styles.messageText}>{progress.message}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  stageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stageLabel: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
    ...(Platform.OS === "ios" && { fontFamily: "SF Pro Text" }),
  },
  percentText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.textTertiary,
    fontVariant: ["tabular-nums"],
    ...(Platform.OS === "ios" && { fontFamily: "SF Pro Text" }),
  },
  track: {
    height: 6,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 3,
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    borderRadius: 3,
  },
  messageText: {
    fontSize: 12,
    color: COLORS.textTertiary,
    ...(Platform.OS === "ios" && { fontFamily: "SF Pro Text" }),
  },
});
