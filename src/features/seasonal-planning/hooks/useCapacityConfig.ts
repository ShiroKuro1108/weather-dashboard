import { useState, useCallback } from "react";
import { type UAVCapacityConfig, DEFAULT_UAV_CONFIG } from "../types/seasonalTypes";

const STORAGE_KEY = "uav_capacity_config_v1";

export function useCapacityConfig() {
  const [config, setConfig] = useState<UAVCapacityConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_UAV_CONFIG, ...JSON.parse(saved) };
      }
    } catch {
      // fallback
    }
    return DEFAULT_UAV_CONFIG;
  });

  const updateConfig = useCallback((newConfig: Partial<UAVCapacityConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_UAV_CONFIG);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_UAV_CONFIG));
    } catch {
      // ignore
    }
  }, []);

  return {
    config,
    updateConfig,
    resetConfig,
  };
}
