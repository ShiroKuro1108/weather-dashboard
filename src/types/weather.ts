export type FlightCondition = "GO" | "CAUTION" | "NO_GO";
export type FlightSession = "morning" | "afternoon";
export type DistrictType = "city" | "town" | "district";
export type RegionGroup = "gia_lai" | "binh_dinh";

export interface FlightLocation {
  id: string;
  name: string;
  lat: number;
  lon: number;
  district: string;
  isDistrictCenter: boolean;
}

export interface District {
  id: string;
  name: string;
  type: DistrictType;
  region: RegionGroup;
  centerLat: number;
  centerLon: number;
  communes: string[];
}

export interface HourlyForecastData {
  time: string;
  dateStr: string;
  hourStr: string;
  hour: number;
  temperature: number;
  humidity: number;
  precipitation: number;
  precipProbability: number;
  cloudCover: number;
  windSpeed: number;
  windGusts: number;
  visibility: number;
  weatherCode: number;
  condition: FlightCondition;
}

/** Đánh giá 1 ca bay (Sáng 06-12h hoặc Chiều 12-18h) tại 1 huyện */
export interface SessionSummary {
  session: FlightSession;
  condition: FlightCondition;
  goHours: number;
  bestSlot: string;
  reason: string;
  advisory: string;
  avgWindSpeed: number;
  maxWindGusts: number;
  totalPrecipitation: number;
  avgCloudCover: number;
  maxPrecipProb: number;
}

/** Tóm tắt 1 ngày tại 1 huyện */
export interface DistrictDaySummary {
  districtId: string;
  districtName: string;
  date: string;
  dayOfWeek: string;
  morning: SessionSummary;
  afternoon: SessionSummary;
}

/** Dữ liệu tổng hợp 1 huyện × 7 ngày */
export interface DistrictWeatherData {
  district: District;
  hourlyData: HourlyForecastData[];
  daySummaries: DistrictDaySummary[];
  lastUpdated: Date;
}

export interface DaySummary {
  date: string;
  dayOfWeek: string;
  flyableHours: number;
  cautionHours: number;
  noGoHours: number;
  bestTimeSlot: string;
  overallCondition: FlightCondition;
  avgWindSpeed: number;
  totalPrecipitation: number;
  avgCloudCover: number;
}

export interface FlightThresholds {
  windSpeedGo: number;
  windSpeedCaution: number;
  windGustMax: number;
  precipitationGo: number;
  precipitationMax: number;
  precipProbGo: number;
  precipProbMax: number;
  cloudCoverGo: number;
  cloudCoverMax: number;
  visibilityMin: number;
  humidityMax: number;
}

export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
  hourly_units: Record<string, string>;
  hourly: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    precipitation: number[];
    precipitation_probability: number[];
    cloud_cover: number[];
    wind_speed_10m: number[];
    wind_gusts_10m: number[];
    visibility: number[];
    weather_code: number[];
  };
}

export interface WeatherCodeInfo {
  label: string;
  icon: string;
}
