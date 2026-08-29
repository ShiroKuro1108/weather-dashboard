import type { OpenMeteoResponse, HourlyForecastData, FlightThresholds } from "../types/weather";
import { evaluateFlightCondition } from "../utils/flightCondition";
import { formatHour } from "../utils/formatters";

const BASE_URL = "https://api.open-meteo.com/v1/forecast";

const HOURLY_PARAMS = [
  "temperature_2m",
  "relative_humidity_2m",
  "precipitation",
  "precipitation_probability",
  "cloud_cover",
  "wind_speed_10m",
  "wind_gusts_10m",
  "visibility",
  "weather_code",
].join(",");

export async function fetchWeatherForecast(
  lat: number,
  lon: number,
  days: number = 7
): Promise<OpenMeteoResponse> {
  const url = `${BASE_URL}?latitude=${lat}&longitude=${lon}&hourly=${HOURLY_PARAMS}&timezone=Asia/Ho_Chi_Minh&forecast_days=${days}&wind_speed_unit=kmh`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Open-Meteo API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

/**
 * Transform raw API response into typed HourlyForecastData[], evaluating flight conditions.
 */
export function transformForecastData(
  raw: OpenMeteoResponse,
  thresholds: FlightThresholds
): HourlyForecastData[] {
  const { hourly } = raw;
  const result: HourlyForecastData[] = [];

  for (let i = 0; i < hourly.time.length; i++) {
    const time = hourly.time[i];
    const dateStr = time.substring(0, 10);
    const hourStr = formatHour(time);
    const hour = parseInt(time.substring(11, 13), 10);

    const entry: Omit<HourlyForecastData, "condition"> = {
      time,
      dateStr,
      hourStr,
      hour,
      temperature: hourly.temperature_2m[i],
      humidity: hourly.relative_humidity_2m[i],
      precipitation: hourly.precipitation[i],
      precipProbability: hourly.precipitation_probability[i],
      cloudCover: hourly.cloud_cover[i],
      windSpeed: hourly.wind_speed_10m[i],
      windGusts: hourly.wind_gusts_10m?.[i] ?? 0,
      visibility: hourly.visibility?.[i] ?? 10000,
      weatherCode: hourly.weather_code?.[i] ?? 0,
    };

    const condition = evaluateFlightCondition(entry, thresholds);

    result.push({ ...entry, condition });
  }

  return result;
}
