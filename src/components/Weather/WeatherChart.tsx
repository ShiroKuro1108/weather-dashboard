import { useMemo, useState } from "react";
import { Box, Tabs, Tab, useTheme } from "@mui/material";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid,
} from "recharts";
import type { HourlyForecastData } from "../../types/weather";

interface Props {
  data: HourlyForecastData[];
  selectedDate: string | null;
}

export default function WeatherChart({ data, selectedDate }: Props) {
  const [tab, setTab] = useState(0);
  const theme = useTheme();

  const isDark = theme.palette.mode === "dark";
  const axisColor = isDark ? "#8899aa" : "#64748b";
  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const tooltipBg = isDark ? "#132f4c" : "#ffffff";
  const tooltipBorder = isDark ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(0,0,0,0.1)";
  const tooltipTextColor = isDark ? "#ffffff" : "#0f172a";

  const filtered = useMemo(
    () => (selectedDate ? data.filter((h) => h.dateStr === selectedDate) : data.slice(0, 48)),
    [data, selectedDate]
  );

  const chartData = useMemo(
    () =>
      filtered.map((h) => ({
        time: h.hourStr,
        windSpeed: h.windSpeed,
        windGusts: h.windGusts,
        precipitation: h.precipitation,
        cloudCover: h.cloudCover,
      })),
    [filtered]
  );

  return (
    <Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 1 }}>
        <Tab label="Gió (km/h)" sx={{ textTransform: "none", fontWeight: 600 }} />
        <Tab label="Mưa (mm)" sx={{ textTransform: "none", fontWeight: 600 }} />
        <Tab label="Mây (%)" sx={{ textTransform: "none", fontWeight: 600 }} />
      </Tabs>

      <Box sx={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          {tab === 0 ? (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="windGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#42a5f5" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#42a5f5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: axisColor }} interval="preserveStartEnd" stroke={axisColor} />
              <YAxis tick={{ fontSize: 10, fill: axisColor }} stroke={axisColor} />
              <Tooltip
                contentStyle={{ backgroundColor: tooltipBg, border: tooltipBorder, color: tooltipTextColor, borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
                itemStyle={{ color: tooltipTextColor }}
                labelStyle={{ color: tooltipTextColor, fontWeight: 700 }}
              />
              <ReferenceLine y={15} stroke="#66bb6a" strokeDasharray="4 4" label={{ value: "GO ≤15", fill: "#66bb6a", fontSize: 10 }} />
              <ReferenceLine y={25} stroke="#ffa726" strokeDasharray="4 4" label={{ value: "CAUTION ≤25", fill: "#ffa726", fontSize: 10 }} />
              <Area type="monotone" dataKey="windSpeed" stroke="#42a5f5" fill="url(#windGrad)" strokeWidth={2} name="Gió" />
              <Area type="monotone" dataKey="windGusts" stroke="#ef5350" fill="none" strokeWidth={1} strokeDasharray="4 2" name="Gió giật" />
            </AreaChart>
          ) : tab === 1 ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: axisColor }} interval="preserveStartEnd" stroke={axisColor} />
              <YAxis tick={{ fontSize: 10, fill: axisColor }} stroke={axisColor} />
              <Tooltip
                contentStyle={{ backgroundColor: tooltipBg, border: tooltipBorder, color: tooltipTextColor, borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
                itemStyle={{ color: tooltipTextColor }}
                labelStyle={{ color: tooltipTextColor, fontWeight: 700 }}
              />
              <ReferenceLine y={0.5} stroke="#66bb6a" strokeDasharray="4 4" />
              <ReferenceLine y={2.0} stroke="#f44336" strokeDasharray="4 4" />
              <Bar dataKey="precipitation" fill="#42a5f5" radius={[2, 2, 0, 0]} name="Mưa (mm)" />
            </BarChart>
          ) : (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#90a4ae" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#90a4ae" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: axisColor }} interval="preserveStartEnd" stroke={axisColor} />
              <YAxis tick={{ fontSize: 10, fill: axisColor }} domain={[0, 100]} stroke={axisColor} />
              <Tooltip
                contentStyle={{ backgroundColor: tooltipBg, border: tooltipBorder, color: tooltipTextColor, borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
                itemStyle={{ color: tooltipTextColor }}
                labelStyle={{ color: tooltipTextColor, fontWeight: 700 }}
              />
              <ReferenceLine y={50} stroke="#66bb6a" strokeDasharray="4 4" />
              <ReferenceLine y={85} stroke="#f44336" strokeDasharray="4 4" />
              <Area type="monotone" dataKey="cloudCover" stroke="#90a4ae" fill="url(#cloudGrad)" strokeWidth={2} name="Mây (%)" />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
