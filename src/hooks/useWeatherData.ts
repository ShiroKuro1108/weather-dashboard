import { useState, useEffect, useCallback, useRef } from "react";
import type { FlightLocation, FlightThresholds, HourlyForecastData } from "../types/weather";
import { fetchWeatherForecast, transformForecastData } from "../api/openMeteoApi";

const AUTO_REFRESH_MS = 30 * 60 * 1000; // 30 minutes

interface UseWeatherDataReturn {
  data: HourlyForecastData[] | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refetch: () => void;
  nextRefreshIn: number; // seconds
}

export function useWeatherData(
  location: FlightLocation,
  thresholds: FlightThresholds,
  forecastDays: number = 7
): UseWeatherDataReturn {
  const [data, setData] = useState<HourlyForecastData[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [nextRefreshIn, setNextRefreshIn] = useState(AUTO_REFRESH_MS / 1000);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const raw = await fetchWeatherForecast(location.lat, location.lon, forecastDays);
      const transformed = transformForecastData(raw, thresholds);
      setData(transformed);
      setLastUpdated(new Date());
      setNextRefreshIn(AUTO_REFRESH_MS / 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi kết nối API");
    } finally {
      setIsLoading(false);
    }
  }, [location.lat, location.lon, forecastDays, thresholds]);

  // Initial fetch + auto-refresh
  useEffect(() => {
    fetchData();

    timerRef.current = setInterval(fetchData, AUTO_REFRESH_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchData]);

  // Countdown timer
  useEffect(() => {
    countdownRef.current = setInterval(() => {
      setNextRefreshIn((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // Reset countdown when data updates
  useEffect(() => {
    setNextRefreshIn(AUTO_REFRESH_MS / 1000);
  }, [lastUpdated]);

  // Re-evaluate conditions when thresholds change
  useEffect(() => {
    if (data) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thresholds]);

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchData,
    nextRefreshIn,
  };
}
