import { useState, useMemo } from "react";
import {
  Paper,
  Typography,
  Stack,
  Tabs,
  Tab,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Button,
  useTheme,
} from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Line,
  ComposedChart,
  Area,
} from "recharts";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import AirIcon from "@mui/icons-material/Air";
import DeviceThermostatIcon from "@mui/icons-material/DeviceThermostat";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import type { LocationMonthlyReport } from "../types/seasonalTypes";

interface Props {
  reports: LocationMonthlyReport[];
  selectedLocationId: string;
}

type MetricType = "precipitation" | "rainy_days" | "dry_days" | "wind" | "sunshine" | "temperature";

interface MetricConfig {
  label: string;
  unit: string;
  color: string;
  icon: React.ReactNode;
  desc: string;
}

const METRIC_CONFIGS: Record<MetricType, MetricConfig> = {
  precipitation: {
    label: "Lượng mưa",
    unit: "mm",
    color: "#29b6f6",
    icon: <WaterDropIcon fontSize="small" />,
    desc: "Tổng lượng mưa trung bình hàng tháng",
  },
  rainy_days: {
    label: "Số ngày mưa",
    unit: "ngày",
    color: "#ef5350",
    icon: <CalendarMonthIcon fontSize="small" />,
    desc: "Số ngày có mưa (>= 1.0mm) trong tháng",
  },
  dry_days: {
    label: "Số ngày khô ráo",
    unit: "ngày",
    color: "#66bb6a",
    icon: <WbSunnyIcon fontSize="small" />,
    desc: "Số ngày không mưa, khô ráo thuận lợi bay",
  },
  wind: {
    label: "Tốc độ gió",
    unit: "km/h",
    color: "#ffa726",
    icon: <AirIcon fontSize="small" />,
    desc: "Tốc độ gió trung bình và gió giật cực đại",
  },
  sunshine: {
    label: "Giờ nắng",
    unit: "h/ngày",
    color: "#ffca28",
    icon: <WbSunnyIcon fontSize="small" />,
    desc: "Số giờ nắng trung bình trong ngày",
  },
  temperature: {
    label: "Nhiệt độ",
    unit: "°C",
    color: "#ff7043",
    icon: <DeviceThermostatIcon fontSize="small" />,
    desc: "Nhiệt độ trung bình và dải Min - Max",
  },
};

const DISTRICT_COLORS = [
  "#29b6f6", "#66bb6a", "#ffa726", "#ec407a", "#ab47bc", "#26a69a",
  "#ff7043", "#7e57c2", "#5c6bc0", "#42a5f5", "#26c6da", "#9ccc65",
  "#f06292", "#ba68c8", "#4db6ac", "#ffb74d", "#aed581", "#4dd0e1",
  "#e57373", "#81c784", "#64b5f6", "#ff8a65", "#9575cd", "#4db6ac",
  "#dce775", "#ffd54f", "#a1887f", "#90a4ae",
];

// Default featured 6 locations (3 Gia Lai + 3 Binh Dinh)
const DEFAULT_SELECTED_DISTRICT_IDS = [
  "pleiku",
  "an_khe",
  "ayun_pa",
  "quy_nhon",
  "phu_cat",
  "hoai_nhon",
];

export default function SeasonalCharts({ reports, selectedLocationId }: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const axisColor = isDark ? "#90caf9" : "#1976d2";
  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const tooltipBg = isDark ? "#132f4c" : "#ffffff";
  const tooltipBorder = isDark ? "#90caf9" : "#1976d2";
  const tooltipTextColor = isDark ? "#ffffff" : "#0f172a";

  const [viewMode, setViewMode] = useState<"single" | "compare">("compare");
  const [metric, setMetric] = useState<MetricType>("precipitation");

  // Selected district IDs for comparison
  const [selectedDistrictIds, setSelectedDistrictIds] = useState<string[]>(() => {
    const validDefaults = DEFAULT_SELECTED_DISTRICT_IDS.filter((id) =>
      reports.some((r) => r.location.id === id)
    );
    return validDefaults.length > 0 ? validDefaults : reports.slice(0, 6).map((r) => r.location.id);
  });

  const activeReport = reports.find((r) => r.location.id === selectedLocationId) ?? reports[0];
  const metricCfg = METRIC_CONFIGS[metric];

  // Filter reports according to selectedDistrictIds
  const comparedReports = useMemo(() => {
    if (selectedDistrictIds.length === 0) return reports.slice(0, 6);
    return reports.filter((r) => selectedDistrictIds.includes(r.location.id));
  }, [reports, selectedDistrictIds]);

  // Quick preset handlers
  const handleSelectFeatured = () => {
    const featured = DEFAULT_SELECTED_DISTRICT_IDS.filter((id) =>
      reports.some((r) => r.location.id === id)
    );
    setSelectedDistrictIds(featured);
  };

  const handleSelectGiaLai = () => {
    setSelectedDistrictIds(
      reports.filter((r) => r.location.province === "Gia Lai").map((r) => r.location.id)
    );
  };

  const handleSelectBinhDinh = () => {
    setSelectedDistrictIds(
      reports.filter((r) => r.location.province === "Bình Định").map((r) => r.location.id)
    );
  };

  const handleSelectAll = () => {
    setSelectedDistrictIds(reports.map((r) => r.location.id));
  };

  // 1. Single location complete chart data
  const singleLocationData = useMemo(() => {
    if (!activeReport) return [];
    return activeReport.monthlyStats.map((s) => ({
      month: `T${s.month}`,
      monthFull: s.monthName,
      precipitation: s.precipitationSum,
      rainy_days: s.rainyDaysCount,
      dry_days: s.dryDaysCount,
      windSpeed: s.avgWindSpeed,
      windGust: s.maxWindGust,
      sunshine: s.avgSunshineHours,
      tempAvg: s.avgTemp,
      tempMax: s.avgTempMax,
      tempMin: s.avgTempMin,
    }));
  }, [activeReport]);

  // 2. Multi-location comparison data for chosen metric
  const comparisonData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const entry: Record<string, string | number> = { month: `T${m}` };
      for (const r of comparedReports) {
        const stat = r.monthlyStats.find((s) => s.month === m);
        if (stat) {
          if (metric === "precipitation") entry[r.location.name] = stat.precipitationSum;
          else if (metric === "rainy_days") entry[r.location.name] = stat.rainyDaysCount;
          else if (metric === "dry_days") entry[r.location.name] = stat.dryDaysCount;
          else if (metric === "wind") entry[r.location.name] = stat.avgWindSpeed;
          else if (metric === "sunshine") entry[r.location.name] = stat.avgSunshineHours;
          else if (metric === "temperature") entry[r.location.name] = stat.avgTemp;
        }
      }
      return entry;
    });
  }, [comparedReports, metric]);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 2.5, borderRadius: 2, bgcolor: "background.paper" }}>
        {/* Top Header & View Switcher */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", md: "center" }, mb: 2 }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              So sánh & Phân tích Đa Chỉ số Khí hậu 12 Tháng
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {viewMode === "compare"
                ? `Đang so sánh chỉ số: ${metricCfg.label} (${metricCfg.unit}) giữa ${comparedReports.length} huyện được chọn`
                : `Đang xem toàn cảnh các chỉ số tại ${activeReport?.location.name}`}
            </Typography>
          </Box>

          <Tabs
            value={viewMode}
            onChange={(_, val) => setViewMode(val)}
            slotProps={{ indicator: { style: { height: 3, borderRadius: 1.5 } } }}
          >
            <Tab value="compare" label="So sánh đa huyện" sx={{ textTransform: "none", fontWeight: 700 }} />
            <Tab value="single" label={`Chi tiết ${activeReport?.location.name || ""}`} sx={{ textTransform: "none", fontWeight: 700 }} />
          </Tabs>
        </Stack>

        {/* METRIC BUTTONS SELECTOR */}
        <Box sx={{ mb: 2.5, overflowX: "auto", pb: 0.5 }}>
          <ToggleButtonGroup
            value={metric}
            exclusive
            onChange={(_, newVal) => {
              if (newVal) setMetric(newVal);
            }}
            size="small"
            sx={{ flexWrap: "nowrap", minWidth: "max-content" }}
          >
            {(Object.keys(METRIC_CONFIGS) as MetricType[]).map((key) => {
              const cfg = METRIC_CONFIGS[key];
              const isSelected = metric === key;
              return (
                <ToggleButton
                  key={key}
                  value={key}
                  sx={{
                    px: 1.8,
                    py: 0.8,
                    textTransform: "none",
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? "primary.contrastText" : "text.secondary",
                    bgcolor: isSelected ? "primary.main" : "transparent",
                    "&.Mui-selected": {
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      "&:hover": { bgcolor: "primary.dark" },
                    },
                  }}
                >
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    {cfg.icon}
                    <span>{cfg.label}</span>
                  </Stack>
                </ToggleButton>
              );
            })}
          </ToggleButtonGroup>
        </Box>

        {/* DISTRICT SELECTION BAR FOR COMPARISON */}
        {viewMode === "compare" && (
          <Paper
            variant="outlined"
            sx={{
              p: 1.5,
              mb: 2.5,
              borderRadius: 1.5,
              bgcolor: "background.default",
              borderColor: "divider",
            }}
          >
            <Stack spacing={1.5}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1.5}
                sx={{ alignItems: { xs: "stretch", md: "center" }, justifyContent: "space-between" }}
              >
                {/* Multi-Select Dropdown with Checkboxes */}
                <FormControl size="small" sx={{ flexGrow: 1, maxWidth: { xs: "100%", md: 500 } }}>
                  <InputLabel id="select-districts-label">
                    Chọn các huyện muốn đưa vào so sánh ({selectedDistrictIds.length}/{reports.length})
                  </InputLabel>
                  <Select
                    labelId="select-districts-label"
                    multiple
                    value={selectedDistrictIds}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedDistrictIds(typeof val === "string" ? val.split(",") : val);
                    }}
                    input={<OutlinedInput label={`Chọn các huyện muốn đưa vào so sánh (${selectedDistrictIds.length}/${reports.length})`} />}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, maxHeight: 60, overflowY: "auto" }}>
                        {selected.map((id) => {
                          const r = reports.find((item) => item.location.id === id);
                          return (
                            <Chip
                              key={id}
                              size="small"
                              label={`${r?.location.name} (${r?.location.province === "Bình Định" ? "BĐ" : "GL"})`}
                              sx={{ height: 22, fontSize: "0.72rem" }}
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    <MenuItem disabled sx={{ fontWeight: 800, color: "#90caf9", bgcolor: "background.paper" }}>
                      📍 KHU VỰC GIA LAI (17 HUYỆN)
                    </MenuItem>
                    {reports
                      .filter((r) => r.location.province === "Gia Lai")
                      .map((r) => (
                        <MenuItem key={r.location.id} value={r.location.id}>
                          <Checkbox
                            size="small"
                            checked={selectedDistrictIds.indexOf(r.location.id) > -1}
                            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                            checkedIcon={<CheckBoxIcon fontSize="small" />}
                          />
                          <ListItemText primary={`${r.location.name} (Gia Lai)`} />
                        </MenuItem>
                      ))}

                    <MenuItem disabled sx={{ fontWeight: 800, color: "#81c784", bgcolor: "background.paper" }}>
                      📍 KHU VỰC BÌNH ĐỊNH (11 HUYỆN)
                    </MenuItem>
                    {reports
                      .filter((r) => r.location.province === "Bình Định")
                      .map((r) => (
                        <MenuItem key={r.location.id} value={r.location.id}>
                          <Checkbox
                            size="small"
                            checked={selectedDistrictIds.indexOf(r.location.id) > -1}
                            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                            checkedIcon={<CheckBoxIcon fontSize="small" />}
                          />
                          <ListItemText primary={`${r.location.name} (Bình Định)`} />
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>

                {/* Quick Selection Buttons */}
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 0.8 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handleSelectFeatured}
                    sx={{ textTransform: "none", fontSize: "0.75rem", fontWeight: 600 }}
                  >
                    ⭐ 6 Huyện Tiêu Biểu (3 GL + 3 BĐ)
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handleSelectGiaLai}
                    sx={{ textTransform: "none", fontSize: "0.75rem" }}
                  >
                    17 Huyện Gia Lai
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handleSelectBinhDinh}
                    sx={{ textTransform: "none", fontSize: "0.75rem" }}
                  >
                    11 Huyện Bình Định
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handleSelectAll}
                    sx={{ textTransform: "none", fontSize: "0.75rem" }}
                  >
                    Tất cả 28 Huyện
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          </Paper>
        )}

        {/* CHART CONTAINER */}
        <Box sx={{ width: "100%", height: 380, mt: 1 }}>
          {viewMode === "compare" ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="month" stroke={axisColor} />
                <YAxis stroke={axisColor} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    color: tooltipTextColor,
                    borderRadius: 8,
                    fontSize: "0.85rem",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                  itemStyle={{ color: tooltipTextColor }}
                  labelStyle={{ color: tooltipTextColor, fontWeight: 700 }}
                  formatter={(value: any) => [`${value} ${metricCfg.unit}`, metricCfg.label]}
                />
                <Legend wrapperStyle={{ paddingTop: 10, fontSize: "0.8rem", color: tooltipTextColor }} />
                {comparedReports.map((r, idx) => (
                  <Bar
                    key={r.location.id}
                    dataKey={r.location.name}
                    fill={DISTRICT_COLORS[idx % DISTRICT_COLORS.length]}
                    radius={[3, 3, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {metric === "precipitation" || metric === "rainy_days" || metric === "dry_days" ? (
                <ComposedChart data={singleLocationData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="month" stroke={axisColor} />
                  <YAxis yAxisId="left" stroke="#29b6f6" label={{ value: "Lượng mưa (mm)", angle: -90, position: "insideLeft", fill: "#29b6f6" }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#ef5350" label={{ value: "Ngày mưa", angle: 90, position: "insideRight", fill: "#ef5350" }} domain={[0, 31]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipTextColor, borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
                    itemStyle={{ color: tooltipTextColor }}
                    labelStyle={{ color: tooltipTextColor, fontWeight: 700 }}
                  />
                  <Legend wrapperStyle={{ color: tooltipTextColor }} />
                  <Bar yAxisId="left" dataKey="precipitation" fill="#29b6f6" name="Lượng mưa (mm)" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="rainy_days" stroke="#ef5350" strokeWidth={3} dot={{ r: 4 }} name="Số ngày mưa (ngày)" />
                  <Line yAxisId="right" type="monotone" dataKey="dry_days" stroke="#66bb6a" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} name="Số ngày khô (ngày)" />
                </ComposedChart>
              ) : metric === "wind" || metric === "sunshine" ? (
                <ComposedChart data={singleLocationData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="month" stroke={axisColor} />
                  <YAxis yAxisId="left" stroke="#ffa726" label={{ value: "Gió (km/h)", angle: -90, position: "insideLeft", fill: "#ffa726" }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#ffca28" label={{ value: "Giờ nắng/ngày", angle: 90, position: "insideRight", fill: "#ffca28" }} domain={[0, 12]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipTextColor, borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
                    itemStyle={{ color: tooltipTextColor }}
                    labelStyle={{ color: tooltipTextColor, fontWeight: 700 }}
                  />
                  <Legend wrapperStyle={{ color: tooltipTextColor }} />
                  <Bar yAxisId="left" dataKey="windSpeed" fill="#ffa726" name="Gió TB (km/h)" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="left" type="monotone" dataKey="windGust" stroke="#ff7043" strokeWidth={2} strokeDasharray="3 3" name="Gió giật max (km/h)" />
                  <Line yAxisId="right" type="monotone" dataKey="sunshine" stroke="#ffca28" strokeWidth={3} dot={{ r: 4 }} name="Giờ nắng (h/ngày)" />
                </ComposedChart>
              ) : (
                <ComposedChart data={singleLocationData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="month" stroke={axisColor} />
                  <YAxis stroke="#ff8a65" label={{ value: "Nhiệt độ (°C)", angle: -90, position: "insideLeft", fill: "#ff8a65" }} domain={[10, 42]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipTextColor, borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
                    itemStyle={{ color: tooltipTextColor }}
                    labelStyle={{ color: tooltipTextColor, fontWeight: 700 }}
                  />
                  <Legend wrapperStyle={{ color: tooltipTextColor }} />
                  <Area type="monotone" dataKey="tempMax" fill="rgba(255, 112, 67, 0.2)" stroke="#ff7043" strokeWidth={2} name="Nhiệt độ Max (°C)" />
                  <Line type="monotone" dataKey="tempAvg" stroke="#ffb74d" strokeWidth={3} dot={{ r: 4 }} name="Nhiệt độ TB (°C)" />
                  <Line type="monotone" dataKey="tempMin" stroke="#4fc3f7" strokeWidth={2} strokeDasharray="4 4" name="Nhiệt độ Min (°C)" />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          )}
        </Box>
      </Paper>

      {/* 3. COMPARATIVE TABLE FOR THE CURRENTLY SELECTED METRIC */}
      <Paper sx={{ p: 2, borderRadius: 2, bgcolor: "background.paper" }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1.5 }}>
          {metricCfg.icon}
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Bảng Đối chiếu 12 Tháng: {metricCfg.label} ({metricCfg.unit})
          </Typography>
          <Chip size="small" label={metricCfg.desc} variant="outlined" sx={{ fontSize: "0.72rem" }} />
        </Stack>

        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "action.hover" }}>
                <TableCell sx={{ fontWeight: 700, minWidth: 160 }}>Địa bàn ({comparedReports.length} huyện)</TableCell>
                {months.map((m) => (
                  <TableCell key={m} align="center" sx={{ fontWeight: 700, minWidth: 65 }}>
                    T{m}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {comparedReports.map((r) => (
                <TableRow key={r.location.id} hover>
                  <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>
                    {r.location.name}
                    <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                      {r.location.province}
                    </Typography>
                  </TableCell>

                  {months.map((m) => {
                    const stat = r.monthlyStats.find((s) => s.month === m);
                    if (!stat) return <TableCell key={m} align="center">—</TableCell>;

                    let val: number = 0;
                    if (metric === "precipitation") val = stat.precipitationSum;
                    else if (metric === "rainy_days") val = stat.rainyDaysCount;
                    else if (metric === "dry_days") val = stat.dryDaysCount;
                    else if (metric === "wind") val = stat.avgWindSpeed;
                    else if (metric === "sunshine") val = stat.avgSunshineHours;
                    else if (metric === "temperature") val = stat.avgTemp;

                    return (
                      <TableCell key={m} align="center">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {val}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.65rem" }}>
                          {metricCfg.unit}
                        </Typography>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Stack>
  );
}
