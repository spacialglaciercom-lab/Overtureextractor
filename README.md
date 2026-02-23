# Overture OSM Extractor Mobile

A React Native iOS app for drawing polygon boundaries on a map, previewing Overture road data, and triggering backend extraction — all with a native iOS UX.

## Tech Stack

- **React Native + Expo** (SDK 54) with Expo Router
- **@rnmapbox/maps** for vector tile rendering (Carto/Stadia dark tiles)
- **@turf/turf** for real-time area and perimeter calculations
- **@gorhom/bottom-sheet** for iOS-style bottom sheet modal
- **react-native-reanimated** + **react-native-gesture-handler** for smooth animations
- **expo-file-system** + **expo-sharing** for graph file download/export
- **expo-location** for geolocation

## Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- A [Mapbox](https://www.mapbox.com/) account and access token
- Xcode 15+ (for iOS simulator builds)

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd overture-extractor-mobile
npm install
```

### 2. Configure environment

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```
EXPO_PUBLIC_MAPBOX_TOKEN=pk.your_mapbox_public_token
EXPO_PUBLIC_API_BASE_URL=https://your-railway-backend.up.railway.app
EXPO_PUBLIC_MAP_STYLE=https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json
```

### 3. Mapbox token

You need a Mapbox access token. Sign up at [mapbox.com](https://www.mapbox.com/) and create a token with `Downloads:Read` scope for native SDK access.

For iOS native builds, you also need to configure the Mapbox download token in `app.json` under the `@rnmapbox/maps` plugin config:

```json
["@rnmapbox/maps", {
  "RNMapboxMapsImpl": "mapbox",
  "RNMapboxMapsDownloadToken": "sk.your_secret_download_token"
}]
```

### 4. Backend URL

Point `EXPO_PUBLIC_API_BASE_URL` to your Railway (or other) backend that exposes:

- `POST /preview` — accepts `{ polygon: GeoJSON }`, returns road GeoJSON
- `WebSocket /ws/extract` — accepts polygon, streams extraction progress

## Running

### Development (Expo Go)

```bash
npx expo start
```

> Note: `@rnmapbox/maps` requires a development build — it does not work with Expo Go.

### Development build (iOS Simulator)

```bash
eas build --profile development --platform ios
npx expo start --dev-client
```

### Preview build (Device / TestFlight)

```bash
eas build --profile preview --platform ios
```

### Production build

```bash
eas build --profile production --platform ios
eas submit --platform ios
```

## Project Structure

```
├── app/
│   ├── _layout.tsx            # Root layout with GestureHandler
│   └── index.tsx              # Main map screen
├── components/
│   ├── MapView.tsx            # Mapbox map + drawing layers
│   ├── DrawingToolbar.tsx     # Polygon + trash + compass + locate buttons
│   ├── MeasurementCard.tsx    # Live area/perimeter overlay
│   ├── ExtractionSheet.tsx    # Gorhom bottom sheet with extraction controls
│   └── ProgressBar.tsx        # Animated WebSocket progress indicator
├── hooks/
│   ├── usePolygonDraw.ts      # All drawing state and GeoJSON generation
│   ├── useMeasurements.ts     # Turf.js area/perimeter/bbox calculations
│   └── useExtraction.ts       # WebSocket extraction + file download logic
├── constants/
│   └── mapStyles.ts           # Tile URLs, colors, and Mapbox layer styles
├── types/
│   └── index.ts               # TypeScript type definitions
├── app.json                   # Expo configuration
├── eas.json                   # EAS Build profiles
└── .env.example               # Environment variable template
```

## Features

- **Polygon drawing** — tap map to add vertices, tap first vertex to close (50m snap radius)
- **Live measurements** — area (km²) and perimeter (km) update in real-time via Turf.js
- **Road preview** — fetch and display Overture road data within the drawn polygon
- **Backend extraction** — WebSocket-based extraction with animated progress stages
- **Graph download** — save extracted graph files and share via iOS share sheet
- **iOS-native UX** — dark theme, SF system fonts, `#007AFF` accent, smooth bottom sheet

## Map Layer Styles

| Layer | Color | Description |
|-------|-------|-------------|
| Drawing line | `#007AFF` (dashed) | In-progress polygon outline |
| Closed polygon | `#007AFF` (solid, 15% fill) | Completed polygon |
| Vertices | White with `#007AFF` stroke | Draggable vertex dots |
| First vertex | `#007AFF` with white stroke | Snap target indicator |
| Extracted roads | `#FF6B35` | Overture road preview overlay |

## License

MIT
