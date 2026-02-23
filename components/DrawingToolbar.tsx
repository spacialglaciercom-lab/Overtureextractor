import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { COLORS } from "../constants/mapStyles";

interface DrawingToolbarProps {
  isDrawing: boolean;
  isClosed: boolean;
  hasVertices: boolean;
  onStartDrawing: () => void;
  onClear: () => void;
  onFlyToUser: () => void;
  onResetBearing: () => void;
}

export default function DrawingToolbar({
  isDrawing,
  isClosed,
  hasVertices,
  onStartDrawing,
  onClear,
  onFlyToUser,
  onResetBearing,
}: DrawingToolbarProps) {
  const handleDraw = () => {
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onStartDrawing();
  };

  const handleClear = () => {
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onClear();
  };

  return (
    <>
      {/* Top-right map controls */}
      <View style={styles.topRightControls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={onResetBearing}
          activeOpacity={0.7}
        >
          <Ionicons name="compass-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={onFlyToUser}
          activeOpacity={0.7}
        >
          <Ionicons name="locate" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Bottom-left drawing toolbar */}
      <View style={styles.drawingToolbar}>
        <TouchableOpacity
          style={[
            styles.toolButton,
            isDrawing && styles.toolButtonActive,
          ]}
          onPress={handleDraw}
          activeOpacity={0.7}
          disabled={isClosed}
        >
          <Ionicons
            name="pencil"
            size={22}
            color={isDrawing ? COLORS.text : COLORS.textSecondary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toolButton, !hasVertices && styles.toolButtonDisabled]}
          onPress={handleClear}
          activeOpacity={0.7}
          disabled={!hasVertices}
        >
          <Ionicons
            name="trash-outline"
            size={22}
            color={hasVertices ? COLORS.error : COLORS.textTertiary}
          />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  topRightControls: {
    position: "absolute",
    top: 60,
    right: 16,
    gap: 10,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(44, 44, 46, 0.92)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  drawingToolbar: {
    position: "absolute",
    bottom: 40,
    left: 16,
    gap: 10,
  },
  toolButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(44, 44, 46, 0.92)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  toolButtonActive: {
    backgroundColor: COLORS.primary,
  },
  toolButtonDisabled: {
    opacity: 0.4,
  },
});
