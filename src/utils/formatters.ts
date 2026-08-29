import dayjs from "dayjs";

export function formatHour(isoString: string): string {
  return dayjs(isoString).format("HH:mm");
}

export function formatDate(isoString: string): string {
  return dayjs(isoString).format("DD/MM");
}

export function formatDateFull(dateStr: string): string {
  return dayjs(dateStr).format("DD/MM/YYYY");
}

export function formatDayOfWeek(dateStr: string): string {
  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  return dayNames[dayjs(dateStr).day()];
}

export function formatWindSpeed(speed: number): string {
  return `${Math.round(speed)} km/h`;
}

export function formatPrecipitation(mm: number): string {
  return `${mm.toFixed(1)} mm`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatTemperature(temp: number): string {
  return `${temp.toFixed(1)}°C`;
}

export function formatVisibility(m: number): string {
  if (m >= 10000) return `${(m / 1000).toFixed(0)} km`;
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
  return `${Math.round(m)} m`;
}
