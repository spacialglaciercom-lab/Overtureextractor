export const MAP_STYLE_URL =
  process.env.EXPO_PUBLIC_MAP_STYLE ||
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "https://your-app.up.railway.app";

export const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN || "";

export const COLORS = {
  primary: "#007AFF",
  accent: "#FF6B35",
  background: "#1C1C1E",
  surface: "#2C2C2E",
  surfaceElevated: "#3A3A3C",
  text: "#FFFFFF",
  textSecondary: "#EBEBF5",
  textTertiary: "#8E8E93",
  success: "#34C759",
  warning: "#FF9500",
  error: "#FF3B30",
  border: "#38383A",
} as const;

export const SNAP_RADIUS_KM = 0.05;

export const LINE_STYLE = {
  lineColor: COLORS.primary,
  lineWidth: 2.5,
  lineOpacity: 0.9,
  lineDasharray: [2, 1],
} as const;

export const CLOSED_LINE_STYLE = {
  lineColor: COLORS.primary,
  lineWidth: 2.5,
  lineOpacity: 1,
} as const;

export const FILL_STYLE = {
  fillColor: COLORS.primary,
  fillOpacity: 0.15,
  fillOutlineColor: COLORS.primary,
} as const;

export const CIRCLE_STYLE = {
  circleRadius: 6,
  circleColor: "#FFFFFF",
  circleStrokeColor: COLORS.primary,
  circleStrokeWidth: 2,
} as const;

export const FIRST_VERTEX_CIRCLE_STYLE = {
  circleRadius: 10,
  circleColor: COLORS.primary,
  circleStrokeColor: "#FFFFFF",
  circleStrokeWidth: 3,
  circleOpacity: 0.9,
} as const;

export const ROADS_STYLE = {
  lineColor: COLORS.accent,
  lineWidth: 1.5,
  lineOpacity: 0.8,
} as const;
