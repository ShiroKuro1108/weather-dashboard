import type { WeatherCodeInfo } from "../types/weather";

export const WEATHER_CODES: Record<number, WeatherCodeInfo> = {
  0: { label: "Trời quang", icon: "WbSunny" },
  1: { label: "Ít mây", icon: "WbSunny" },
  2: { label: "Mây rải rác", icon: "Cloud" },
  3: { label: "U ám", icon: "Cloud" },
  45: { label: "Sương mù", icon: "Foggy" },
  48: { label: "Sương mù đóng băng", icon: "Foggy" },
  51: { label: "Mưa phùn nhẹ", icon: "Grain" },
  53: { label: "Mưa phùn", icon: "Grain" },
  55: { label: "Mưa phùn dày", icon: "Grain" },
  61: { label: "Mưa nhẹ", icon: "Umbrella" },
  63: { label: "Mưa vừa", icon: "Umbrella" },
  65: { label: "Mưa to", icon: "Thunderstorm" },
  80: { label: "Mưa rào nhẹ", icon: "Umbrella" },
  81: { label: "Mưa rào vừa", icon: "Umbrella" },
  82: { label: "Mưa rào to", icon: "Thunderstorm" },
  95: { label: "Giông", icon: "Thunderstorm" },
  96: { label: "Giông + mưa đá nhẹ", icon: "Thunderstorm" },
  99: { label: "Giông + mưa đá to", icon: "Thunderstorm" },
};

export function getWeatherInfo(code: number): WeatherCodeInfo {
  return WEATHER_CODES[code] ?? { label: `Mã ${code}`, icon: "HelpOutline" };
}
