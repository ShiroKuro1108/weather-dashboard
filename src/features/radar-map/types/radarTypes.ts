/**
 * Types for Interactive Weather Radar Map feature
 */

import type { FlightCondition } from "../../../types/weather";

export interface RadarFrame {
  time: number; // Unix timestamp
  path: string; // Relative path on RainViewer host
  type: "past" | "nowcast";
}

export interface RainViewerApiResponse {
  version: string;
  generated: number;
  host: string;
  radar: {
    past: { time: number; path: string }[];
    nowcast: { time: number; path: string }[];
  };
  satellite: {
    infrared: { time: number; path: string }[];
  };
}

export type RadarLayerMode = "radar" | "satellite";

export type BaseMapStyle = "dark" | "streets" | "satellite";

export interface DistrictMarkerWeather {
  id: string;
  name: string;
  region: "gia_lai" | "binh_dinh";
  province: string;
  lat: number;
  lon: number;
  temperature?: number;
  windSpeed?: number;
  windGusts?: number;
  precipitation?: number;
  humidity?: number;
  cloudCover?: number;
  condition: FlightCondition;
  goHoursToday: number;
  summaryText: string;
}

export interface RadarMapState {
  currentFrameIndex: number;
  isPlaying: boolean;
  playbackSpeedMs: number;
  layerMode: RadarLayerMode;
  baseMapStyle: BaseMapStyle;
  radarOpacity: number;
  showMarkers: boolean;
  showRainLegend: boolean;
  selectedDistrictId: string | null;
}
