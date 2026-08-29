import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Typography,
} from "@mui/material";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import CloudIcon from "@mui/icons-material/Cloud";
import ThunderstormIcon from "@mui/icons-material/Thunderstorm";
import UmbrellaIcon from "@mui/icons-material/Umbrella";
import GrainIcon from "@mui/icons-material/Grain";
import FoggyIcon from "@mui/icons-material/Foggy";
import { HelpOutlined } from "@mui/icons-material";
import FlightConditionChip from "./FlightConditionChip";
import { getWeatherInfo } from "../../utils/weatherCodes";
import { formatTemperature, formatWindSpeed, formatPrecipitation, formatPercent, formatVisibility } from "../../utils/formatters";
import type { HourlyForecastData, FlightCondition } from "../../types/weather";

const iconMap: Record<string, React.ReactElement> = {
  WbSunny: <WbSunnyIcon fontSize="small" sx={{ color: "#ffd54f" }} />,
  Cloud: <CloudIcon fontSize="small" sx={{ color: "#90a4ae" }} />,
  Thunderstorm: <ThunderstormIcon fontSize="small" sx={{ color: "#ef5350" }} />,
  Umbrella: <UmbrellaIcon fontSize="small" sx={{ color: "#42a5f5" }} />,
  Grain: <GrainIcon fontSize="small" sx={{ color: "#78909c" }} />,
  Foggy: <FoggyIcon fontSize="small" sx={{ color: "#b0bec5" }} />,
  HelpOutline: <HelpOutlined fontSize="small" />,
};

const conditionBg: Record<FlightCondition, string> = {
  GO: "rgba(102,187,106,0.08)",
  CAUTION: "rgba(255,167,38,0.08)",
  NO_GO: "rgba(244,67,54,0.08)",
};

interface Props {
  data: HourlyForecastData[];
  selectedDate: string | null;
}

export default function WeatherTable({ data, selectedDate }: Props) {
  const filtered = selectedDate ? data.filter((h) => h.dateStr === selectedDate) : data;
  const now = new Date();
  const currentHourStr = `${String(now.getHours()).padStart(2, "0")}:00`;
  const todayStr = now.toISOString().substring(0, 10);

  return (
    <TableContainer
      component={Paper}
      sx={{ maxHeight: 600, borderRadius: 2, bgcolor: "background.paper" }}
    >
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell>Giờ</TableCell>
            <TableCell>Thời tiết</TableCell>
            <TableCell align="right">Nhiệt độ</TableCell>
            <TableCell align="right">Gió</TableCell>
            <TableCell align="right">Gió giật</TableCell>
            <TableCell align="right">Mưa</TableCell>
            <TableCell align="right">XS Mưa</TableCell>
            <TableCell align="right">Mây</TableCell>
            <TableCell align="right">Tầm nhìn</TableCell>
            <TableCell align="center">Đánh giá</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map((row) => {
            const info = getWeatherInfo(row.weatherCode);
            const isNow = row.dateStr === todayStr && row.hourStr === currentHourStr;

            return (
              <TableRow
                key={row.time}
                sx={{
                  bgcolor: conditionBg[row.condition],
                  ...(isNow && {
                    outline: "2px solid",
                    outlineColor: "primary.main",
                    outlineOffset: -2,
                  }),
                }}
              >
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: isNow ? 700 : 400 }}>
                    {row.hourStr}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {iconMap[info.icon] ?? iconMap.HelpOutline}
                    <Typography variant="caption">{info.label}</Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">{formatTemperature(row.temperature)}</TableCell>
                <TableCell align="right">{formatWindSpeed(row.windSpeed)}</TableCell>
                <TableCell align="right">{formatWindSpeed(row.windGusts)}</TableCell>
                <TableCell align="right">{formatPrecipitation(row.precipitation)}</TableCell>
                <TableCell align="right">{formatPercent(row.precipProbability)}</TableCell>
                <TableCell align="right">{formatPercent(row.cloudCover)}</TableCell>
                <TableCell align="right">{formatVisibility(row.visibility)}</TableCell>
                <TableCell align="center">
                  <FlightConditionChip condition={row.condition} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
