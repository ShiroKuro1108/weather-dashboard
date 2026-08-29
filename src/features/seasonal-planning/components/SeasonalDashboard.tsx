import { useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Tabs,
  Tab,
  Button,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
  Chip,
} from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import RefreshIcon from "@mui/icons-material/Refresh";
import GridViewIcon from "@mui/icons-material/GridView";
import TableChartIcon from "@mui/icons-material/TableChart";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CalculateIcon from "@mui/icons-material/Calculate";
import DescriptionIcon from "@mui/icons-material/Description";

import { useCapacityConfig } from "../hooks/useCapacityConfig";
import { useSeasonalAnalysis } from "../hooks/useSeasonalAnalysis";
import { getAllAvailableSeasonalLocations } from "../utils/seasonalLocations";

import SeasonalMatrixTab from "./SeasonalMatrixTab";
import DetailedWeatherReportTab from "./DetailedWeatherReportTab";
import SeasonalCharts from "./SeasonalCharts";
import ScheduleTimeline from "./ScheduleTimeline";
import ProductivityBreakdown from "./ProductivityBreakdown";
import StrategicExecutiveReport from "./StrategicExecutiveReport";
import CapacitySettingsModal from "./CapacitySettingsModal";

export default function SeasonalDashboard() {
  const { config, updateConfig, resetConfig } = useCapacityConfig();
  const allLocations = useMemo(() => getAllAvailableSeasonalLocations(), []);

  const [activeLocationId, setActiveLocationId] = useState<string>("pleiku");
  const [subTab, setSubTab] = useState<number>(0);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

  // Load all 28 districts automatically so matrix and reports are always complete
  const {
    reports,
    strategicPlan,
    aiReport,
    isLoading,
    isAiLoading,
    progress,
    error,
    refetch,
    regenerateReport,
  } = useSeasonalAnalysis(allLocations, config);

  const activeReport = reports.find((r) => r.location.id === activeLocationId) ?? reports[0];

  const handleSelectLocationAndNavigateToDetail = (locId: string) => {
    setActiveLocationId(locId);
    setSubTab(1); // Navigate to DetailedWeatherReportTab
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Top Action & Status Bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: "background.paper" }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" } }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "primary.main" }}>
              Kế hoạch Mùa vụ & Báo cáo Khí hậu 28 Huyện (Gia Lai & Bình Định)
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Tổng hợp dữ liệu thời tiết nhiều năm • Đánh giá khả năng bay và lập lịch trình tối ưu
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", flexShrink: 0 }}>
            <Chip
              label="28 Huyện / 2 Khu vực • 3 Đội UAV"
              variant="outlined"
              size="small"
              color="primary"
              sx={{ fontWeight: 700 }}
            />

            <Tooltip title="Làm mới dữ liệu thời tiết">
              <IconButton onClick={refetch} color="primary" disabled={isLoading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>

            <Button
              variant="outlined"
              startIcon={<TuneIcon />}
              onClick={() => setSettingsOpen(true)}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Cấu hình Đội bay & Năng suất
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Loading Progress */}
      {isLoading && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress variant="determinate" value={progress} sx={{ borderRadius: 1 }} />
          <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.5, display: "block" }}>
            Đang tổng hợp số liệu thời tiết 28 huyện ({progress}%)...
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Sub Navigation Tabs */}
      <Paper sx={{ mb: 3, borderRadius: 2, bgcolor: "background.paper" }}>
        <Tabs
          value={subTab}
          onChange={(_, v) => setSubTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          slotProps={{ indicator: { style: { height: 3, borderRadius: 1.5 } } }}
        >
          <Tab
            icon={<GridViewIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Ma trận Mùa vụ 28 Huyện"
            sx={{ textTransform: "none", fontWeight: 700 }}
          />
          <Tab
            icon={<TableChartIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Bảng Số liệu Thời tiết Chi tiết"
            sx={{ textTransform: "none", fontWeight: 700 }}
          />
          <Tab
            icon={<ShowChartIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Biểu đồ Khí hậu & So sánh"
            sx={{ textTransform: "none", fontWeight: 700 }}
          />
          <Tab
            icon={<CalendarMonthIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Lịch trình Bay Khả quan"
            sx={{ textTransform: "none", fontWeight: 700 }}
          />
          <Tab
            icon={<CalculateIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Định mức & Công suất Đo đạc"
            sx={{ textTransform: "none", fontWeight: 700 }}
          />
          <Tab
            icon={<DescriptionIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Báo cáo Chiến lược Điều hành"
            sx={{ textTransform: "none", fontWeight: 700 }}
          />
        </Tabs>
      </Paper>

      {/* View Content */}
      {reports.length > 0 && (
        <>
          {subTab === 0 && (
            <SeasonalMatrixTab
              reports={reports}
              selectedLocationId={activeLocationId}
              onSelectLocationAndNavigateToDetail={handleSelectLocationAndNavigateToDetail}
            />
          )}

          {subTab === 1 && (
            <DetailedWeatherReportTab
              reports={reports}
              selectedLocationId={activeLocationId}
              onSelectLocation={setActiveLocationId}
            />
          )}

          {subTab === 2 && (
            <SeasonalCharts
              reports={reports}
              selectedLocationId={activeLocationId}
            />
          )}

          {subTab === 3 && (
            <ScheduleTimeline plan={strategicPlan} />
          )}

          {subTab === 4 && activeReport && (
            <ProductivityBreakdown
              report={activeReport}
              config={config}
            />
          )}

          {subTab === 5 && (
            <StrategicExecutiveReport
              report={aiReport}
              isLoading={isAiLoading}
              onRegenerate={regenerateReport}
              config={config}
            />
          )}
        </>
      )}

      {/* Settings Modal */}
      <CapacitySettingsModal
        open={settingsOpen}
        config={config}
        onSave={updateConfig}
        onReset={resetConfig}
        onClose={() => setSettingsOpen(false)}
      />
    </Box>
  );
}
