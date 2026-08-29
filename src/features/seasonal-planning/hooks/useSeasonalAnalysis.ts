import { useState, useEffect, useCallback, useMemo } from "react";
import type {
  SeasonalLocation,
  UAVCapacityConfig,
  LocationMonthlyReport,
  SeasonalStrategicPlan,
} from "../types/seasonalTypes";
import { fetchHistoricalWeatherData } from "../api/historicalWeatherApi";
import { processLocationMonthlyReport } from "../utils/seasonalEngine";
import { generateStrategicSchedule } from "../utils/schedulerEngine";
import { generateStrategicAIReport, type GeminiStrategicReportResponse } from "../api/geminiAdvisorApi";

export function useSeasonalAnalysis(
  selectedLocations: SeasonalLocation[],
  config: UAVCapacityConfig
) {
  const [reports, setReports] = useState<LocationMonthlyReport[]>([]);
  const [aiReport, setAiReport] = useState<GeminiStrategicReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchAllSeasonalData = useCallback(async () => {
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
        const raw = await fetchHistoricalWeatherData(loc, config.historyYears);
        const report = processLocationMonthlyReport(loc, raw, config);
        results.push(report);
      } catch (err) {
        console.warn(`Lỗi tải dữ liệu lịch sử cho ${loc.name}:`, err);
      }
      completed++;
      setProgress(Math.round((completed / total) * 100));

      if (i < total - 1) {
        await new Promise((r) => setTimeout(r, 100));
      }
    }

    setReports(results);
    setIsLoading(false);
  }, [selectedLocations, config.historyYears, config.dailyCapacityWU, config.uavTeams]);

  useEffect(() => {
    fetchAllSeasonalData();
  }, [fetchAllSeasonalData]);

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
    strategicPlan,
    aiReport,
    isLoading,
    isAiLoading,
    progress,
    error,
    refetch: fetchAllSeasonalData,
    regenerateReport: generateReport,
  };
}
