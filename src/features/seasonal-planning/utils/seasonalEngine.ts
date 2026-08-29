import type {
  MonthlyWeatherStat,
  LocationMonthlyReport,
  SeasonalLocation,
  FlightPaceType,
  UAVCapacityConfig,
} from "../types/seasonalTypes";
import type { OpenMeteoArchiveResponse } from "../api/historicalWeatherApi";

const MONTH_NAMES = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
  "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8",
  "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

interface DayData {
  date: string;
  year: number;
  month: number;
  rain: number;
  windSpeed: number;
  windGust: number;
  sunshine: number;
  tMax: number;
  tMin: number;
}

export function processLocationMonthlyReport(
  location: SeasonalLocation,
  raw: OpenMeteoArchiveResponse,
  config: UAVCapacityConfig
): LocationMonthlyReport {
  const daily = raw.daily;
  const days: DayData[] = [];
  const yearsSet = new Set<number>();

  for (let i = 0; i < daily.time.length; i++) {
    const dStr = daily.time[i];
    const year = parseInt(dStr.substring(0, 4), 10);
    const month = parseInt(dStr.substring(5, 7), 10);
    yearsSet.add(year);

    const rain = daily.precipitation_sum[i] ?? 0;
    const windSpeed = daily.wind_speed_10m_max[i] ?? 0;
    const windGust = daily.wind_gusts_10m_max?.[i] ?? windSpeed * 1.25;
    const sunshine = (daily.sunshine_duration?.[i] ?? 0) / 3600;
    const tMax = daily.temperature_2m_max?.[i] ?? 28;
    const tMin = daily.temperature_2m_min?.[i] ?? 18;

    days.push({
      date: dStr,
      year,
      month,
      rain,
      windSpeed,
      windGust,
      sunshine,
      tMax,
      tMin,
    });
  }

  const yearsAnalyzed = Array.from(yearsSet).sort();
  const yearCount = Math.max(1, yearsAnalyzed.length);

  const monthlyStats: MonthlyWeatherStat[] = [];

  for (let m = 1; m <= 12; m++) {
    const monthDays = days.filter((d) => d.month === m);
    if (monthDays.length === 0) continue;

    const totalRain = monthDays.reduce((s, d) => s + d.rain, 0);
    const avgRain = Math.round((totalRain / yearCount) * 10) / 10;

    const rainyDaysRaw = monthDays.filter((d) => d.rain >= 1.0).length;
    const rainyDaysCount = Math.round((rainyDaysRaw / yearCount) * 10) / 10;

    const totalDaysInMonth = new Date(2025, m, 0).getDate();
    const dryDaysCount = Math.max(0, Math.round((totalDaysInMonth - rainyDaysCount) * 10) / 10);

    const avgWind = Math.round((monthDays.reduce((s, d) => s + d.windSpeed, 0) / monthDays.length) * 10) / 10;
    const maxGust = Math.round(Math.max(...monthDays.map((d) => d.windGust)) * 10) / 10;
    const avgSun = Math.round((monthDays.reduce((s, d) => s + d.sunshine, 0) / monthDays.length) * 10) / 10;

    const avgTMax = Math.round((monthDays.reduce((s, d) => s + d.tMax, 0) / monthDays.length) * 10) / 10;
    const avgTMin = Math.round((monthDays.reduce((s, d) => s + d.tMin, 0) / monthDays.length) * 10) / 10;
    const avgTemp = Math.round(((avgTMax + avgTMin) / 2) * 10) / 10;

    // =========================================================================
    // 100% DYNAMIC QUANTITATIVE CLASSIFICATION BASED ON MEASURED METEOROLOGY
    // NO HARDCODED MONTH ASSUMPTIONS!
    // =========================================================================
    let seasonName: string;
    let flightPace: FlightPaceType;
    let weatherSummary: string;
    let flightAssessment: string;

    const isSevereStorm = (avgRain >= 200 && (rainyDaysCount >= 12 || maxGust >= 32)) || avgRain >= 280;
    const isHeavyRain = avgRain >= 90 || rainyDaysCount >= 10;
    const isModerateTransition = avgRain >= 45 && avgRain < 90 && rainyDaysCount < 10;

    if (isSevereStorm) {
      seasonName = "Mùa mưa bão (Cảnh báo)";
      flightPace = "RESTRICTED";
      weatherSummary = `Mưa bão dồn dập (${avgRain} mm, ~${rainyDaysCount} ngày mưa), gió giật mạnh ${maxGust} km/h, nắng yếu (${avgSun} h/ngày).`;
      flightAssessment = `Thời tiết mưa bão nguy hiểm, gió giật vượt ngưỡng an toàn. Cấm bay / dừng hoạt động bay ngoài trời.`;
    } else if (isHeavyRain) {
      const isPersistent = rainyDaysCount >= 15;
      seasonName = isPersistent ? "Mùa mưa (Mưa dầm)" : "Mùa mưa (Mưa rào)";
      flightPace = "SLOW";
      weatherSummary = `Mưa nhiều (${avgRain} mm, ~${rainyDaysCount} ngày mưa), thường mưa sau 13h trưa, gió ${avgWind} km/h.`;
      flightAssessment = `Mưa dầm nhiều ngày. Bay ít, bay chậm, tranh thủ ca sáng sớm (06h-10h), tập trung xử lý dữ liệu và đo RTK.`;
    } else if (isModerateTransition) {
      seasonName = "Giao mùa / Mát mẻ";
      flightPace = "NORMAL";
      weatherSummary = `Thời tiết giao mùa (${avgRain} mm, ~${rainyDaysCount} ngày mưa), trời mát (${avgTemp}°C), nắng ${avgSun} h/ngày.`;
      flightAssessment = `Điều kiện bay tương đối thuận lợi. Tiến độ bay đều đặn, hoàn tất bay trước các cơn dông chiều.`;
    } else {
      seasonName = "Mùa khô (Nắng ráo)";
      flightPace = "RAPID";
      weatherSummary = `Trời nắng ráo (${avgSun} h nắng/ngày), khô ráo (${avgRain} mm, chỉ ~${rainyDaysCount} ngày mưa), gió êm (${avgWind} km/h).`;
      flightAssessment = `Thời tiết lý tưởng. Bay nhiều, tốc độ nhanh, đẩy tối đa sản lượng khảo sát 3D 50m và 2D 50m.`;
    }

    const estimatedWU = Math.round(dryDaysCount * config.dailyCapacityWU * config.uavTeams);

    monthlyStats.push({
      month: m,
      monthName: MONTH_NAMES[m - 1],
      seasonName,
      avgTempMax: avgTMax,
      avgTempMin: avgTMin,
      avgTemp,
      precipitationSum: avgRain,
      rainyDaysCount,
      dryDaysCount,
      avgWindSpeed: avgWind,
      maxWindGust: maxGust,
      avgSunshineHours: avgSun,
      weatherSummary,
      flightAssessment,
      flightPace,
      estimatedWU,
    });
  }

  const annualRainfall = Math.round(monthlyStats.reduce((s, m) => s + m.precipitationSum, 0));
  const annualRainyDays = Math.round(monthlyStats.reduce((s, m) => s + m.rainyDaysCount, 0));

  return {
    location,
    yearsAnalyzed,
    monthlyStats,
    annualRainfall,
    annualRainyDays,
    lastUpdated: new Date(),
  };
}
