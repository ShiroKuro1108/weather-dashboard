/**
 * Hook to manage fetching and caching RainViewer radar/satellite frames
 */

import { useState, useEffect, useCallback } from "react";
import { fetchRainViewerData } from "../api/rainViewerApi";
import type { RadarFrame } from "../types/radarTypes";

interface UseRadarFramesReturn {
  host: string;
  radarFrames: RadarFrame[];
  satelliteFrames: RadarFrame[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // Auto refresh every 5 minutes

export function useRadarFrames(): UseRadarFramesReturn {
  const [host, setHost] = useState<string>("https://tilecache.rainviewer.com");
  const [radarFrames, setRadarFrames] = useState<RadarFrame[]>([]);
  const [satelliteFrames, setSatelliteFrames] = useState<RadarFrame[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetchRainViewerData();
      setHost(res.host);
      setRadarFrames(res.frames);
      setSatelliteFrames(res.satelliteFrames);
      setLastUpdated(new Date());
    } catch (err) {
      setError("Không thể nạp dữ liệu ảnh Radar từ RainViewer API. Đang thử kết nối lại...");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loadData]);

  return {
    host,
    radarFrames,
    satelliteFrames,
    isLoading,
    error,
    lastUpdated,
    refetch: loadData,
  };
}
