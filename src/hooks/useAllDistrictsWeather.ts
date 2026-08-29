import { useState, useEffect, useCallback, useRef } from "react";
import type { District, FlightThresholds, DistrictWeatherData } from "../types/weather";
import { fetchWeatherForecast, transformForecastData } from "../api/openMeteoApi";
import { computeDistrictDaySummaries } from "../utils/flightCondition";

const AUTO_REFRESH_MS = 30 * 60 * 1000; // 30 minutes

interface UseAllDistrictsReturn {
  data: Map<string, DistrictWeatherData>;
  isLoading: boolean;
  error: string | null;
  progress: number; // 0-100
  lastUpdated: Date | null;
  refetch: () => void;
  nextRefreshIn: number;
}

export function useAllDistrictsWeather(
  districts: District[],
  thresholds: FlightThresholds
): UseAllDistrictsReturn {
  const [data, setData] = useState<Map<string, DistrictWeatherData>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [nextRefreshIn, setNextRefreshIn] = useState(AUTO_REFRESH_MS / 1000);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef(false);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setProgress(0);
    abortRef.current = false;

    const result = new Map<string, DistrictWeatherData>();
    let completed = 0;
    const total = districts.length;

    // Fetch in batches of 5 to avoid rate limiting
    const batchSize = 5;
    for (let i = 0; i < total; i += batchSize) {
      if (abortRef.current) break;

      const batch = districts.slice(i, i + batchSize);
      const promises = batch.map(async (district) => {
        try {
          const raw = await fetchWeatherForecast(district.centerLat, district.centerLon, 7);
          const hourlyData = transformForecastData(raw, thresholds);
          const daySummaries = computeDistrictDaySummaries(district.id, district.name, hourlyData);

          return {
            district,
            hourlyData,
            daySummaries,
            lastUpdated: new Date(),
          } as DistrictWeatherData;
        } catch (err) {
          console.warn(`Failed to fetch ${district.name}:`, err);
          return null;
        }
      });

      const results = await Promise.allSettled(promises);
      for (const r of results) {
        if (r.status === "fulfilled" && r.value) {
          result.set(r.value.district.id, r.value);
        }
        completed++;
        setProgress(Math.round((completed / total) * 100));
      }

      // Small delay between batches to be nice to the API
      if (i + batchSize < total) {
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    setData(result);
    setLastUpdated(new Date());
    setIsLoading(false);
    setNextRefreshIn(AUTO_REFRESH_MS / 1000);

    if (result.size < total) {
      setError(`${total - result.size}/${total} huyện tải thất bại`);
    }
  }, [districts, thresholds]);

  // Initial fetch + auto-refresh
  useEffect(() => {
    fetchAll();
    timerRef.current = setInterval(fetchAll, AUTO_REFRESH_MS);
    return () => {
      abortRef.current = true;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchAll]);

  // Countdown
  useEffect(() => {
    countdownRef.current = setInterval(() => {
      setNextRefreshIn((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, []);

  useEffect(() => {
    setNextRefreshIn(AUTO_REFRESH_MS / 1000);
  }, [lastUpdated]);

  return { data, isLoading, error, progress, lastUpdated, refetch: fetchAll, nextRefreshIn };
}
