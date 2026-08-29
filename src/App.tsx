import { useState, useMemo } from "react";
import {
  AppBar, Toolbar, Typography, IconButton, Box, Stack, Container, Paper,
  CircularProgress, Alert, Snackbar, Tooltip, Chip, Tab, Tabs,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import RefreshIcon from "@mui/icons-material/Refresh";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import TimerIcon from "@mui/icons-material/Timer";
import GridViewIcon from "@mui/icons-material/GridView";
import TableChartIcon from "@mui/icons-material/TableChart";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

import FlightMatrix from "./components/Overview/FlightMatrix";
import LocationSelector from "./components/Location/LocationSelector";
import DaySummaryCard from "./components/Weather/DaySummaryCard";
import WeatherTable from "./components/Weather/WeatherTable";
import WeatherChart from "./components/Weather/WeatherChart";
import ThresholdSettings from "./components/Settings/ThresholdSettings";
import SeasonalDashboard from "./features/seasonal-planning/components/SeasonalDashboard";

import { useAllDistrictsWeather } from "./hooks/useAllDistrictsWeather";
import { useWeatherData } from "./hooks/useWeatherData";
import { flattenLocations, DEFAULT_LOCATION, GIA_LAI_DISTRICTS } from "./utils/locations";
import { computeDaySummaries, loadThresholds, saveThresholds } from "./utils/flightCondition";
import type { FlightLocation, FlightThresholds } from "./types/weather";

export default function App() {
  const [tabIndex, setTabIndex] = useState(0);
  const allLocations = useMemo(() => flattenLocations(), []);
  const [location, setLocation] = useState<FlightLocation>(DEFAULT_LOCATION);
  const [thresholds, setThresholds] = useState<FlightThresholds>(loadThresholds);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Tab 0: All districts overview
  const allDistrictsData = useAllDistrictsWeather(GIA_LAI_DISTRICTS, thresholds);

  // Tab 1: Single location detail
  const singleData = useWeatherData(location, thresholds, 7);

  const daySummaries = useMemo(
    () => (singleData.data ? computeDaySummaries(singleData.data) : []),
    [singleData.data]
  );

  const handleThresholdsSave = (t: FlightThresholds) => {
    setThresholds(t);
    saveThresholds(t);
  };

  const refreshMinutes = Math.floor(allDistrictsData.nextRefreshIn / 60);
  const refreshSeconds = allDistrictsData.nextRefreshIn % 60;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Header */}
      <AppBar position="sticky" sx={{ bgcolor: "background.paper", backgroundImage: "none" }}>
        <Toolbar>
          <FlightTakeoffIcon sx={{ mr: 1.5, color: "primary.main" }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mr: 2 }}>
            VDCD Flight Planner
          </Typography>

          <Tabs
            value={tabIndex}
            onChange={(_, v) => setTabIndex(v)}
            sx={{ flexGrow: 1, minHeight: 48 }}
            slotProps={{ indicator: { style: { height: 3, borderRadius: 1.5 } } }}
          >
            <Tab
              icon={<GridViewIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label="Tổng quan"
              sx={{ textTransform: "none", fontWeight: 600, minHeight: 48 }}
            />
            <Tab
              icon={<TableChartIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label="Chi tiết"
              sx={{ textTransform: "none", fontWeight: 600, minHeight: 48 }}
            />
            <Tab
              icon={<CalendarMonthIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label="Kế hoạch Mùa vụ"
              sx={{ textTransform: "none", fontWeight: 600, minHeight: 48 }}
            />
          </Tabs>

          {allDistrictsData.lastUpdated && (
            <Chip
              icon={<TimerIcon />}
              label={`${refreshMinutes}:${String(refreshSeconds).padStart(2, "0")}`}
              size="small"
              variant="outlined"
              sx={{ mr: 1 }}
            />
          )}

          <Tooltip title="Làm mới dữ liệu">
            <IconButton
              onClick={tabIndex === 0 ? allDistrictsData.refetch : singleData.refetch}
              color="primary"
              disabled={allDistrictsData.isLoading || singleData.isLoading}
            >
              {(allDistrictsData.isLoading || singleData.isLoading) ? <CircularProgress size={20} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Cài đặt ngưỡng bay">
            <IconButton onClick={() => setSettingsOpen(true)} color="primary">
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 2 }}>
        {/* Error snackbar */}
        <Snackbar open={!!(allDistrictsData.error || singleData.error)} autoHideDuration={6000}>
          <Alert severity="warning" sx={{ width: "100%" }}>
            {allDistrictsData.error || singleData.error}
          </Alert>
        </Snackbar>

        {/* ===== TAB 0: TỔNG QUAN — Ma trận 28 huyện ===== */}
        {tabIndex === 0 && (
          <FlightMatrix
            data={allDistrictsData.data}
            isLoading={allDistrictsData.isLoading}
            progress={allDistrictsData.progress}
          />
        )}

        {/* ===== TAB 1: CHI TIẾT — 1 location ===== */}
        {tabIndex === 1 && (
          <>
            <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: "center" }}>
                <LocationSelector
                  locations={allLocations}
                  selected={location}
                  onChange={(loc) => {
                    setLocation(loc);
                    setSelectedDate(null);
                  }}
                />
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  📍 {location.lat.toFixed(4)}°N, {location.lon.toFixed(4)}°E • {location.district}
                  {singleData.lastUpdated && ` • Cập nhật: ${singleData.lastUpdated.toLocaleTimeString("vi-VN")}`}
                </Typography>
              </Stack>
            </Paper>

            {singleData.isLoading && !singleData.data && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <Stack sx={{ alignItems: "center" }} spacing={2}>
                  <CircularProgress size={48} />
                  <Typography sx={{ color: "text.secondary" }}>Đang tải dữ liệu thời tiết...</Typography>
                </Stack>
              </Box>
            )}

            {singleData.data && (
              <>
                <Box sx={{ mb: 2, overflowX: "auto" }}>
                  <Stack direction="row" spacing={1.5} sx={{ pb: 1, minWidth: "max-content" }}>
                    {daySummaries.map((s) => (
                      <DaySummaryCard
                        key={s.date}
                        summary={s}
                        isSelected={selectedDate === s.date}
                        onClick={() => setSelectedDate((prev) => (prev === s.date ? null : s.date))}
                      />
                    ))}
                  </Stack>
                </Box>

                <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                  <WeatherChart data={singleData.data} selectedDate={selectedDate} />
                </Paper>

                <WeatherTable data={singleData.data} selectedDate={selectedDate} />
              </>
            )}
          </>
        )}

        {/* ===== TAB 2: KẾ HOẠCH MÙA VỤ & LỊCH TRÌNH KHẢ QUAN ===== */}
        {tabIndex === 2 && <SeasonalDashboard />}
      </Container>

      <ThresholdSettings
        open={settingsOpen}
        thresholds={thresholds}
        onSave={handleThresholdsSave}
        onClose={() => setSettingsOpen(false)}
      />
    </Box>
  );
}
