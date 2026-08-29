import {
  Paper,
  Typography,
  Stack,
  Chip,
  Box,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Button,
} from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import RefreshIcon from "@mui/icons-material/Refresh";
import type { GeminiStrategicReportResponse } from "../api/geminiAdvisorApi";
import type { UAVCapacityConfig } from "../types/seasonalTypes";

interface Props {
  report: GeminiStrategicReportResponse | null;
  isLoading: boolean;
  onRegenerate: () => void;
  config: UAVCapacityConfig;
}

export default function StrategicExecutiveReport({
  report,
  isLoading,
  onRegenerate,
  config,
}: Props) {
  if (isLoading) {
    return (
      <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2, bgcolor: "background.paper" }}>
        <CircularProgress size={36} sx={{ mb: 2 }} />
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          Đang tổng hợp báo cáo chiến lược điều hành...
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {config.geminiEnabled
            ? `Đang kết nối mô hình ${config.geminiModel}...`
            : "Đang tính toán qua thuật toán heuristic đa vùng..."}
        </Typography>
      </Paper>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <Stack spacing={3}>
      {/* Header Banner */}
      <Paper sx={{ p: 2.5, borderRadius: 2, bgcolor: "background.paper" }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, mb: 1.5 }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            {report.generatedBy === "gemini-ai" ? (
              <SmartToyIcon color="primary" sx={{ fontSize: 28 }} />
            ) : (
              <AutoFixHighIcon color="primary" sx={{ fontSize: 28 }} />
            )}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Báo cáo Chiến lược Điều hành Bay & Phân bổ Lực lượng Cả năm
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Động cơ phân tích:{" "}
                <strong>
                  {report.generatedBy === "gemini-ai"
                    ? `Google Gemini AI (${config.geminiModel})`
                    : "Thuật toán Định chuẩn Khí hậu Heuristic"}
                </strong>
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Chip
              size="small"
              label={report.generatedBy === "gemini-ai" ? "Gemini AI Live" : "Offline Heuristic"}
              color={report.generatedBy === "gemini-ai" ? "primary" : "default"}
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
            <Button
              size="small"
              startIcon={<RefreshIcon />}
              onClick={onRegenerate}
              sx={{ textTransform: "none" }}
            >
              Cập nhật
            </Button>
          </Stack>
        </Stack>

        <Paper sx={{ p: 2, bgcolor: "rgba(144, 202, 249, 0.08)", borderRadius: 1.5 }}>
          <Typography variant="body1" sx={{ color: "text.primary", lineHeight: 1.6 }}>
            {report.executiveBrief}
          </Typography>
        </Paper>
      </Paper>

      {/* 4 Quarter Cards */}
      <Grid container spacing={2}>
        {report.quarterlyRecommendations.map((q) => (
          <Grid key={q.quarter} size={{ xs: 12, md: 6 }}>
            <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: "background.paper", height: "100%" }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "primary.main" }}>
                      {q.quarter}
                    </Typography>
                    <Chip size="small" label={q.focusArea.split("&")[0]} color="primary" variant="outlined" sx={{ fontSize: "0.72rem" }} />
                  </Stack>

                  <Box>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, display: "block" }}>
                      📍 ĐỊA BÀN TRỌNG TÂM:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {q.focusArea}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ color: "#81c784", fontWeight: 700, display: "block" }}>
                      🚁 ĐIỀU PHỐI ĐỘI BAY UAV:
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.primary" }}>
                      {q.uavTeamDeployment}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ color: "#ffca28", fontWeight: 700, display: "block" }}>
                      📡 ĐIỀU PHỐI ĐỘI MẶT ĐẤT RTK:
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.primary" }}>
                      {q.rtkDeployment}
                    </Typography>
                  </Box>

                  <Paper sx={{ p: 1, bgcolor: "rgba(255, 152, 0, 0.08)", borderRadius: 1 }}>
                    <Typography variant="caption" sx={{ color: "#ffb74d", fontWeight: 600, display: "block" }}>
                      ⚠️ Đặc trưng thời tiết: {q.weatherSummary || (q as any).weatherRiskNote}
                    </Typography>
                  </Paper>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Contingency Plan */}
      <Paper sx={{ p: 2.5, borderRadius: 2, bgcolor: "background.paper" }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.5 }}>
          <WarningAmberIcon color="warning" />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Phương án Dự phòng Rủi ro Thời tiết & Bù Tiến độ (Weather Contingency)
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.6 }}>
          {report.contingencyPlan}
        </Typography>
      </Paper>
    </Stack>
  );
}
