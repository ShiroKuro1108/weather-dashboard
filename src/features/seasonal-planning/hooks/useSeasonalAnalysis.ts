import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type {
  SeasonalLocation,
  UAVCapacityConfig,
  LocationMonthlyReport,
  SeasonalStrategicPlan,
} from "../types/seasonalTypes";
import { fetchHistoricalWeatherData, getClimatologicalBaseline } from "../api/historicalWeatherApi";
import { processLocationMonthlyReport } from "../utils/seasonalEngine";
import { generateStrategicSchedule } from "../utils/schedulerEngine";
import { generateStrategicAIReport, type GeminiStrategicReportResponse } from "../api/geminiAdvisorApi";

const CACHED_REPORTS_KEY = "PROCESSED_SEASONAL_REPORTS_OPENMETEO_V1";

interface CachedStorageData {
  reports: LocationMonthlyReport[];
  lastUpdated: string;
  historyYears: number;
}

/**
 * Fast synchronous baseline report generator (0ms delay)
 */
function generateFastInitialReports(
  locations: SeasonalLocation[],
  config: UAVCapacityConfig
): LocationMonthlyReport[] {
  return locations.map((loc) => {
    const raw = getClimatologicalBaseline(loc);
    return processLocationMonthlyReport(loc, raw, config);
  });
}

export function useSeasonalAnalysis(
  selectedLocations: SeasonalLocation[],
  config: UAVCapacityConfig
) {
  // Initialize state immediately from localStorage or fast benchmark generation (0ms delay)
  const [reports, setReports] = useState<LocationMonthlyReport[]>(() => {
    try {
      const saved = localStorage.getItem(CACHED_REPORTS_KEY);
      if (saved) {
        const parsed: CachedStorageData = JSON.parse(saved);
        if (parsed.reports && parsed.reports.length >= selectedLocations.length) {
          return parsed.reports;
        }
      }
    } catch {
      // ignore
    }
    // Fallback: generate instantly from verified climate benchmarks
    const initial = generateFastInitialReports(selectedLocations, config);
    try {
      localStorage.setItem(
        CACHED_REPORTS_KEY,
        JSON.stringify({
          reports: initial,
          lastUpdated: new Date().toLocaleString("vi-VN"),
          historyYears: config.historyYears,
        })
      );
    } catch {
      // ignore
    }
    return initial;
  });

  const [lastUpdated, setLastUpdated] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(CACHED_REPORTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lastUpdated) return parsed.lastUpdated;
      }
    } catch {
      // ignore
    }
    return new Date().toLocaleString("vi-VN");
  });

  const [aiReport, setAiReport] = useState<GeminiStrategicReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Manual re-fetch only when the user explicitly triggers it
  const fetchAllSeasonalData = useCallback(
    async (forceApi: boolean = false) => {
      if (selectedLocations.length === 0) {
        setReports([]);
        return;
      }

      setIsLoading(true);
      setProgress(0);
      setError(null);

      const results: LocationMonthlyReport[] = [];
      const total = selectedLocations.length;
      let completed = 0;

      for (let i = 0; i < total; i++) {
        const loc = selectedLocations[i];
        try {
          // If forceApi is true, we call the API; otherwise we use cached / baseline data
          const raw = await fetchHistoricalWeatherData(loc, config.historyYears);
          const report = processLocationMonthlyReport(loc, raw, config);
          results.push(report);
        } catch (err) {
          console.warn(`Lỗi tải dữ liệu lịch sử cho ${loc.name}:`, err);
          // Fallback to baseline
          const raw = getClimatologicalBaseline(loc);
          results.push(processLocationMonthlyReport(loc, raw, config));
        }
        completed++;
        setProgress(Math.round((completed / total) * 100));

        if (forceApi && i < total - 1) {
          await new Promise((r) => setTimeout(r, 60));
        }
      }

      const updateTime = new Date().toLocaleString("vi-VN");
      setReports(results);
      setLastUpdated(updateTime);
      setIsLoading(false);

      // Save to localStorage for instant loading next time
      try {
        localStorage.setItem(
          CACHED_REPORTS_KEY,
          JSON.stringify({
            reports: results,
            lastUpdated: updateTime,
            historyYears: config.historyYears,
          })
        );
      } catch {
        // ignore
      }
    },
    [selectedLocations, config.historyYears, config.dailyCapacityWU, config.uavTeams]
  );

  // Recalculate capacity / WU if config capacity changes without making API calls
  const prevCapacityRef = useRef(config.dailyCapacityWU * config.uavTeams);
  useEffect(() => {
    const currentCap = config.dailyCapacityWU * config.uavTeams;
    if (currentCap !== prevCapacityRef.current && reports.length > 0) {
      prevCapacityRef.current = currentCap;
      setReports((prev) =>
        prev.map((r) => ({
          ...r,
          monthlyStats: r.monthlyStats.map((s) => ({
            ...s,
            estimatedWU: Math.round(s.dryDaysCount * config.dailyCapacityWU * config.uavTeams),
          })),
        }))
      );
    }
  }, [config.dailyCapacityWU, config.uavTeams, reports.length]);

  const strategicPlan: SeasonalStrategicPlan = useMemo(() => {
    return generateStrategicSchedule(reports, config);
  }, [reports, config]);

  const generateReport = useCallback(async () => {
    if (reports.length === 0) return;
    setIsAiLoading(true);
    try {
      const report = await generateStrategicAIReport(reports, strategicPlan, config);
      setAiReport(report);
    } catch (err) {
      console.warn("Failed to generate strategic report:", err);
    } finally {
      setIsAiLoading(false);
    }
  }, [reports, strategicPlan, config]);

  useEffect(() => {
    if (reports.length > 0) {
      generateReport();
    }
  }, [reports, config.geminiEnabled, config.geminiModel, config.geminiApiKey, generateReport]);

  return {
    reports,
    lastUpdated,
    strategicPlan,
    aiReport,
    isLoading,
    isAiLoading,
    progress,
    error,
    refetch: () => fetchAllSeasonalData(true),
    regenerateReport: generateReport,
  };
}
