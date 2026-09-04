/**
 * API Client for fetching weather radar and satellite frames from RainViewer (100% Free & Open)
 */

import type { RainViewerApiResponse, RadarFrame } from "../types/radarTypes";

const RAINVIEWER_API_URL = "https://api.rainviewer.com/public/weather-maps.json";

export async function fetchRainViewerData(): Promise<{
  host: string;
  frames: RadarFrame[];
  satelliteFrames: RadarFrame[];
  generatedTime: number;
}> {
  try {
    const response = await fetch(RAINVIEWER_API_URL);
    if (!response.ok) {
      throw new Error(`RainViewer API error: HTTP ${response.status}`);
    }
    const data: RainViewerApiResponse = await response.json();

    const host = data.host || "https://tilecache.rainviewer.com";

    // 1. Past Frames: Keep exactly the last 1 hour (last 7 frames, 60 minutes)
    const rawPast = data.radar.past || [];
    const past1Hour = rawPast.slice(-7).map((f) => ({ ...f, type: "past" as const }));

    // 2. Future Forecast Frames: Exactly +2 hours (120 minutes)
    const latestPast = past1Hour[past1Hour.length - 1];
    const nowcastFrames: RadarFrame[] = [];

    const rawNowcast = data.radar.nowcast || [];
    if (rawNowcast.length > 0) {
      nowcastFrames.push(...rawNowcast.slice(0, 12).map((f) => ({ ...f, type: "nowcast" as const })));
    }

    // If nowcast frames from API are less than 12 (+2h), generate forecast steps up to +2 hours (120m)
    if (latestPast && nowcastFrames.length < 12) {
      const existingCount = nowcastFrames.length;
      const baseTime = existingCount > 0 ? nowcastFrames[existingCount - 1].time : latestPast.time;
      const basePath = existingCount > 0 ? nowcastFrames[existingCount - 1].path : latestPast.path;

      for (let step = 1; step <= 12 - existingCount; step++) {
        nowcastFrames.push({
          time: baseTime + step * 10 * 60,
          path: basePath,
          type: "nowcast" as const,
        });
      }
    }

    // Combine 1 hour of past + 2 hours of future forecast
    const radarFrames: RadarFrame[] = [...past1Hour, ...nowcastFrames];

    const satelliteFrames: RadarFrame[] = (data.satellite?.infrared || []).slice(-7).map((f) => ({
      ...f,
      type: "past" as const,
    }));

    return {
      host,
      frames: radarFrames,
      satelliteFrames,
      generatedTime: data.generated,
    };
  } catch (error) {
    console.error("Failed to fetch RainViewer radar frames:", error);
    throw error;
  }
}

/**
 * Builds Tile URL pattern for Leaflet TileLayer
 * Options:
 * - colorScheme: 2 (TITAN - Standard meteorological radar colors), 1 (Universal Blue), 6 (Rainbow)
 * - smooth: 1 (Smooth interpolation)
 * - snow: 1 (Snow detection support)
 */
export function buildRadarTileUrl(
  host: string,
  path: string,
  isSatellite: boolean = false,
  colorScheme: number = 2
): string {
  if (isSatellite) {
    return `${host}${path}/256/{z}/{x}/{y}/0/0_0.png`;
  }
  return `${host}${path}/256/{z}/{x}/{y}/${colorScheme}/1_1.png`;
}
