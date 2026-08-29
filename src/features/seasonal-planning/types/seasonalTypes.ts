// ===== UAV CAPACITY & CONFIGURATION =====

export interface UAVCapacityConfig {
  uavTeams: number;          // Default: 3
  pilotCount: number;        // Default: 3
  rtkTeams: number;          // Default: 4
  productivity3D50m: number;  // 50.0 ha/day
  productivity2D50m: number;  // 120.0 ha/day
  productivity2D200m: number; // 1850.0 ha/day
  productivityHHTotal: number;// 100.0 ha/day
  productivityHH3D50m: number;// 20.0 ha/day
  productivityHH2D50m: number;// 80.0 ha/day
  dailyCapacityWU: number;   // 50.0 WU/day
  geminiApiKey: string;
  geminiModel: string;       // "gemini-3.6-flash"
  geminiEnabled: boolean;    // false
  historyYears: number;      // 3
}

export const DEFAULT_UAV_CONFIG: UAVCapacityConfig = {
  uavTeams: 3,
  pilotCount: 3,
  rtkTeams: 4,
  productivity3D50m: 50.0,
  productivity2D50m: 120.0,
  productivity2D200m: 1850.0,
  productivityHHTotal: 100.0,
  productivityHH3D50m: 20.0,
  productivityHH2D50m: 80.0,
  dailyCapacityWU: 50.0,
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || "",
  geminiModel: "gemini-3.6-flash",
  geminiEnabled: false,
  historyYears: 3,
};

// ===== GEOGRAPHIC REGIONS & LOCATIONS =====

export type ClimateRegionZone = "tay_nguyen" | "duyen_hai_mientrung" | "nam_trung_bo";

export interface SeasonalLocation {
  id: string;
  name: string;
  province: string;
  zone: ClimateRegionZone;
  zoneLabel: string;
  lat: number;
  lon: number;
  description: string;
}

// ===== MONTHLY WEATHER STATISTICS (SỐ LIỆU THỜI TIẾT TỪNG THÁNG ĐỂ BÁO CÁO) =====

export type FlightPaceType = "RAPID" | "NORMAL" | "SLOW" | "RESTRICTED";

export interface MonthlyWeatherStat {
  month: number;               // 1..12
  monthName: string;           // "Tháng 1" ... "Tháng 12"
  seasonName: string;          // "Mùa khô", "Mùa mưa", "Mùa mưa bão"
  avgTempMax: number;          // Nhiệt độ cao nhất TB (°C)
  avgTempMin: number;          // Nhiệt độ thấp nhất TB (°C)
  avgTemp: number;             // Nhiệt độ TB (°C)
  precipitationSum: number;    // Tổng lượng mưa TB (mm/tháng)
  rainyDaysCount: number;      // Số ngày mưa trong tháng (ngày)
  dryDaysCount: number;        // Số ngày không mưa / khô ráo (ngày)
  avgWindSpeed: number;        // Tốc độ gió TB (km/h)
  maxWindGust: number;         // Gió giật cực đại TB (km/h)
  avgSunshineHours: number;    // Số giờ nắng TB (giờ/ngày)
  weatherSummary: string;      // Tóm tắt đặc thù thời tiết tháng
  flightAssessment: string;    // Nhận định khả năng bay (Bay nhiều/nắng, Bay ít/mưa dầm, Cấm bay/bão)
  flightPace: FlightPaceType;  // Tốc độ bay đề xuất
  estimatedWU: number;         // Sản lượng công việc ước tính tháng (WU) với 3 đội
}

export interface LocationMonthlyReport {
  location: SeasonalLocation;
  yearsAnalyzed: number[];
  monthlyStats: MonthlyWeatherStat[];
  annualRainfall: number;      // Tổng lượng mưa năm (mm)
  annualRainyDays: number;     // Tổng số ngày mưa năm
  lastUpdated: Date;
}

// ===== MONTHLY SCHEDULE PLAN (LỊCH TRÌNH BAY 12 THÁNG) =====

export interface MonthlyScheduleItem {
  month: number;
  monthName: string;
  primaryLocationId: string;
  primaryLocationName: string;
  secondaryLocationId?: string;
  secondaryLocationName?: string;
  allocatedUavTeams: number;
  allocatedRtkTeams: number;
  dryDays: number;
  rainyDays: number;
  pace: FlightPaceType;
  paceLabel: string;
  targetWU: number;
  target2D50mHa: number;
  target3D50mHa: number;
  target2D200mHa: number;
  targetHHHa: number;
  weatherConditionNote: string;
  scheduleRecommendation: string;
}

export interface SeasonalStrategicPlan {
  year: number;
  config: UAVCapacityConfig;
  schedules: MonthlyScheduleItem[];
  totalAnnualWU: number;
  executiveSummary: string;
  keyInsights: string[];
}
