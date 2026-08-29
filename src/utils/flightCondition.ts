import type {
  FlightThresholds, FlightCondition, FlightSession,
  HourlyForecastData, DaySummary, SessionSummary, DistrictDaySummary,
} from "../types/weather";

// ===== NGƯỠNG MẶC ĐỊNH — Phù hợp khí hậu Tây Nguyên/Gia Lai =====
export const DEFAULT_THRESHOLDS: FlightThresholds = {
  windSpeedGo: 15,         // km/h — GO ≤ 15
  windSpeedCaution: 25,    // km/h — NO_GO > 25
  windGustMax: 35,         // km/h — NO_GO > 35
  precipitationGo: 1.0,    // mm — GO ≤ 1.0 (nới từ 0.5)
  precipitationMax: 3.0,   // mm — NO_GO > 3.0 (nới từ 2.0)
  precipProbGo: 50,        // % — GO ≤ 50 (nới từ 30)
  precipProbMax: 85,       // % — NO_GO > 85 (nới từ 70)
  cloudCoverGo: 75,        // % — GO ≤ 75 (nới từ 50)
  cloudCoverMax: 95,       // % — NO_GO > 95 (nới từ 85)
  visibilityMin: 3000,     // m — NO_GO < 3000
  humidityMax: 95,         // % — CAUTION > 95
};

// ===== ĐÁNH GIÁ TỪNG GIỜ =====
export function evaluateFlightCondition(
  hourData: Pick<HourlyForecastData, "windSpeed" | "windGusts" | "precipitation" | "precipProbability" | "cloudCover" | "visibility" | "humidity">,
  thresholds: FlightThresholds = DEFAULT_THRESHOLDS
): FlightCondition {
  // NO_GO — hard limits (CHỈ XÉT GIÓ + MƯA)
  if (hourData.windGusts > thresholds.windGustMax) return "NO_GO";
  if (hourData.windSpeed > thresholds.windSpeedCaution) return "NO_GO";
  if (hourData.precipitation > thresholds.precipitationMax) return "NO_GO";
  if (hourData.precipProbability > thresholds.precipProbMax) return "NO_GO";

  // CAUTION — soft limits (CHỈ XÉT GIÓ + MƯA)
  if (hourData.windSpeed > thresholds.windSpeedGo) return "CAUTION";
  if (hourData.precipitation > thresholds.precipitationGo) return "CAUTION";
  if (hourData.precipProbability > thresholds.precipProbGo) return "CAUTION";

  return "GO";
}

// ===== ĐÁNH GIÁ CA BAY (SÁNG / CHIỀU) =====
const SESSION_RANGES: Record<FlightSession, [number, number]> = {
  morning: [6, 12],    // 06:00 → 11:59
  afternoon: [12, 18], // 12:00 → 17:59
};

function generateReason(hours: HourlyForecastData[]): string {
  if (hours.length === 0) return "Không có dữ liệu";
  const avgWind = hours.reduce((s, h) => s + h.windSpeed, 0) / hours.length;
  const totalRain = hours.reduce((s, h) => s + h.precipitation, 0);
  const avgCloud = hours.reduce((s, h) => s + h.cloudCover, 0) / hours.length;
  const maxPrecipProb = Math.max(...hours.map((h) => h.precipProbability));

  const parts: string[] = [];
  parts.push(`Gió ${Math.round(avgWind)} km/h`);
  if (totalRain > 0.1) parts.push(`Mưa ${totalRain.toFixed(1)}mm`);
  else parts.push("Không mưa");
  if (maxPrecipProb > 30) parts.push(`XS mưa ${Math.round(maxPrecipProb)}%`);
  parts.push(`Mây ${Math.round(avgCloud)}%`);
  return parts.join(", ");
}

function generateAdvisory(condition: FlightCondition, hours: HourlyForecastData[], session: FlightSession): string {
  if (condition === "GO") return "Điều kiện tốt, an toàn để bay";

  const reasons: string[] = [];
  const maxWind = Math.max(...hours.map((h) => h.windSpeed));
  const maxGusts = Math.max(...hours.map((h) => h.windGusts));
  const maxPrecipProb = Math.max(...hours.map((h) => h.precipProbability));
  const totalRain = hours.reduce((s, h) => s + h.precipitation, 0);
  const avgCloud = hours.reduce((s, h) => s + h.cloudCover, 0) / hours.length;

  if (maxGusts > 30) reasons.push("Gió giật mạnh");
  else if (maxWind > 15) reasons.push("Gió khá mạnh");
  if (totalRain > 1) reasons.push("Có mưa");
  if (maxPrecipProb > 60) reasons.push("XS mưa cao");
  if (avgCloud > 80) reasons.push("Mây nhiều");

  if (condition === "NO_GO") {
    return `Không nên bay: ${reasons.join(", ")}`;
  }

  // CAUTION
  const tips: string[] = [];
  if (session === "afternoon" && maxPrecipProb > 40) {
    tips.push("Mưa rào chiều có thể xảy ra, bay sớm trước 14h");
  }
  if (maxWind > 15) {
    tips.push("Theo dõi hướng gió, tránh bay cao");
  }
  if (tips.length === 0) tips.push("Bay cẩn thận, theo dõi thời tiết liên tục");

  return `${reasons.join(", ")} → ${tips.join(". ")}`;
}

export function evaluateSession(
  hours: HourlyForecastData[],
  session: FlightSession
): SessionSummary {
  const [startH, endH] = SESSION_RANGES[session];
  const sessionHours = hours.filter((h) => h.hour >= startH && h.hour < endH);

  if (sessionHours.length === 0) {
    return {
      session,
      condition: "NO_GO",
      goHours: 0,
      bestSlot: "—",
      reason: "Không có dữ liệu",
      advisory: "Không có dữ liệu dự báo",
      avgWindSpeed: 0,
      maxWindGusts: 0,
      totalPrecipitation: 0,
      avgCloudCover: 0,
      maxPrecipProb: 0,
    };
  }

  const goCount = sessionHours.filter((h) => h.condition === "GO").length;
  let condition: FlightCondition;
  if (goCount >= 4) condition = "GO";
  else if (goCount >= 1) condition = "CAUTION";
  else condition = "NO_GO";

  return {
    session,
    condition,
    goHours: goCount,
    bestSlot: findBestTimeSlot(sessionHours),
    reason: generateReason(sessionHours),
    advisory: generateAdvisory(condition, sessionHours, session),
    avgWindSpeed: sessionHours.reduce((s, h) => s + h.windSpeed, 0) / sessionHours.length,
    maxWindGusts: Math.max(...sessionHours.map((h) => h.windGusts)),
    totalPrecipitation: sessionHours.reduce((s, h) => s + h.precipitation, 0),
    avgCloudCover: sessionHours.reduce((s, h) => s + h.cloudCover, 0) / sessionHours.length,
    maxPrecipProb: Math.max(...sessionHours.map((h) => h.precipProbability)),
  };
}

// ===== TÌM KHUNG GIỜ TỐT NHẤT =====
export function findBestTimeSlot(hours: HourlyForecastData[]): string {
  let bestStart = -1;
  let bestLen = 0;
  let curStart = -1;
  let curLen = 0;

  for (let i = 0; i < hours.length; i++) {
    if (hours[i].condition === "GO" || hours[i].condition === "CAUTION") {
      if (curStart === -1) curStart = i;
      curLen++;
    } else {
      if (curLen > bestLen) { bestStart = curStart; bestLen = curLen; }
      curStart = -1; curLen = 0;
    }
  }
  if (curLen > bestLen) { bestStart = curStart; bestLen = curLen; }

  if (bestLen === 0) return "—";
  return `${hours[bestStart].hourStr}-${hours[bestStart + bestLen - 1].hourStr}`;
}

// ===== TÓM TẮT NGÀY THEO HUYỆN (Sáng + Chiều) =====
export function computeDistrictDaySummaries(
  districtId: string,
  districtName: string,
  hourlyData: HourlyForecastData[]
): DistrictDaySummary[] {
  const grouped = new Map<string, HourlyForecastData[]>();
  for (const h of hourlyData) {
    const arr = grouped.get(h.dateStr) ?? [];
    arr.push(h);
    grouped.set(h.dateStr, arr);
  }

  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const summaries: DistrictDaySummary[] = [];

  for (const [date, hours] of grouped) {
    const d = new Date(date + "T00:00:00");
    summaries.push({
      districtId,
      districtName,
      date,
      dayOfWeek: dayNames[d.getDay()],
      morning: evaluateSession(hours, "morning"),
      afternoon: evaluateSession(hours, "afternoon"),
    });
  }

  return summaries;
}

// ===== LEGACY: Tóm tắt ngày (cho tab Chi tiết) =====
export function computeDaySummaries(
  hourlyData: HourlyForecastData[]
): DaySummary[] {
  const grouped = new Map<string, HourlyForecastData[]>();
  for (const h of hourlyData) {
    const arr = grouped.get(h.dateStr) ?? [];
    arr.push(h);
    grouped.set(h.dateStr, arr);
  }

  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const summaries: DaySummary[] = [];

  for (const [date, hours] of grouped) {
    const d = new Date(date + "T00:00:00");
    const flyable = hours.filter((h) => h.condition === "GO").length;
    const caution = hours.filter((h) => h.condition === "CAUTION").length;
    const noGo = hours.filter((h) => h.condition === "NO_GO").length;

    let overall: FlightCondition = "GO";
    if (flyable === 0) overall = "NO_GO";
    else if (flyable < 4) overall = "CAUTION";

    summaries.push({
      date,
      dayOfWeek: dayNames[d.getDay()],
      flyableHours: flyable,
      cautionHours: caution,
      noGoHours: noGo,
      bestTimeSlot: findBestTimeSlot(hours),
      overallCondition: overall,
      avgWindSpeed: hours.reduce((s, h) => s + h.windSpeed, 0) / hours.length,
      totalPrecipitation: hours.reduce((s, h) => s + h.precipitation, 0),
      avgCloudCover: hours.reduce((s, h) => s + h.cloudCover, 0) / hours.length,
    });
  }

  return summaries;
}

// ===== PERSISTENCE =====
export const THRESHOLDS_STORAGE_KEY = "flight_thresholds";

export function loadThresholds(): FlightThresholds {
  try {
    const saved = localStorage.getItem(THRESHOLDS_STORAGE_KEY);
    if (saved) return { ...DEFAULT_THRESHOLDS, ...JSON.parse(saved) };
  } catch { /* ignore */ }
  return { ...DEFAULT_THRESHOLDS };
}

export function saveThresholds(t: FlightThresholds): void {
  localStorage.setItem(THRESHOLDS_STORAGE_KEY, JSON.stringify(t));
}
