import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Chip,
  Stack,
  Button,
  Grid,
  Divider,
  TextField,
  MenuItem,
} from "@mui/material";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import ThunderstormIcon from "@mui/icons-material/Thunderstorm";
import AirIcon from "@mui/icons-material/Air";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import CheckIcon from "@mui/icons-material/Check";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import type { LocationMonthlyReport, FlightPaceType } from "../types/seasonalTypes";

import {
  exportDistrictMonthlyReportToExcel,
  exportAllDistrictsSummaryToExcel,
} from "../utils/excelExporter";

interface Props {
  reports: LocationMonthlyReport[];
  selectedLocationId: string;
  onSelectLocation: (locId: string) => void;
}

const PACE_STYLES: Record<
  FlightPaceType,
  { label: string; bg: string; color: string; border: string }
> = {
  RAPID: {
    label: "Bay nhiều / Nhanh",
    bg: "rgba(102, 187, 106, 0.15)",
    color: "#81c784",
    border: "#66bb6a",
  },
  NORMAL: {
    label: "Bay đều đặn",
    bg: "rgba(33, 150, 243, 0.15)",
    color: "#64b5f6",
    border: "#2196f3",
  },
  SLOW: {
    label: "Bay ít / Chậm",
    bg: "rgba(255, 167, 38, 0.15)",
    color: "#ffb74d",
    border: "#ffa726",
  },
  RESTRICTED: {
    label: "Hạn chế / Cấm bay",
    bg: "rgba(239, 83, 80, 0.18)",
    color: "#e57373",
    border: "#ef5350",
  },
};

export default function DetailedWeatherReportTab({
  reports,
  selectedLocationId,
  onSelectLocation,
}: Props) {
  const [copied, setCopied] = useState(false);

  const activeReport = reports.find((r) => r.location.id === selectedLocationId) ?? reports[0];

  const handleCopyTable = () => {
    if (!activeReport) return;
    let text = `BÁO CÁO SỐ LIỆU THỜI TIẾT 12 THÁNG - ${activeReport.location.name} (${activeReport.location.province})\n`;
    text += `Tháng\tMùa vụ\tNhiệt độ TB (°C)\tLượng mưa (mm)\tSố ngày mưa\tSố ngày khô\tGió TB (km/h)\tGiờ nắng (h/d)\tNhận định thời tiết & Khả năng bay\n`;
    for (const s of activeReport.monthlyStats) {
      text += `${s.monthName}\t${s.seasonName}\t${s.avgTemp}°C (${s.avgTempMin}-${s.avgTempMax})\t${s.precipitationSum}\t${s.rainyDaysCount}\t${s.dryDaysCount}\t${s.avgWindSpeed}\t${s.avgSunshineHours}\t${s.flightAssessment}\n`;
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExportExcel = () => {
    if (!activeReport) return;
    exportDistrictMonthlyReportToExcel(activeReport);
  };

  const handleExportAllExcel = () => {
    if (reports.length === 0) return;
    exportAllDistrictsSummaryToExcel(reports);
  };

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 2.5, borderRadius: 2, bgcolor: "background.paper" }}>
        {/* District Selector & Action Bar */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{ justifyContent: "space-between", alignItems: { xs: "stretch", md: "center" }, mb: 2 }}
        >
          {/* Dropdown select district */}
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", flexGrow: 1, maxWidth: { xs: "100%", md: 450 } }}>
            <LocationOnIcon color="primary" />
            <TextField
              select
              fullWidth
              size="small"
              label="Chọn huyện / thành phố muốn xem báo cáo chi tiết"
              value={activeReport?.location.id || selectedLocationId}
              onChange={(e) => onSelectLocation(e.target.value)}
            >
              <MenuItem disabled sx={{ fontWeight: 800, color: "#90caf9", bgcolor: "background.default" }}>
                📍 KHU VỰC GIA LAI (17 HUYỆN)
              </MenuItem>
              {reports
                .filter((r) => r.location.province === "Gia Lai")
                .map((r) => (
                  <MenuItem key={r.location.id} value={r.location.id}>
                    {r.location.name} (Gia Lai)
                  </MenuItem>
                ))}

              <MenuItem disabled sx={{ fontWeight: 800, color: "#81c784", bgcolor: "background.default" }}>
                📍 KHU VỰC BÌNH ĐỊNH (11 HUYỆN)
              </MenuItem>
              {reports
                .filter((r) => r.location.province === "Bình Định")
                .map((r) => (
                  <MenuItem key={r.location.id} value={r.location.id}>
                    {r.location.name} (Bình Định)
                  </MenuItem>
                ))}
            </TextField>
          </Stack>

          {/* Action Buttons */}
          <Stack direction="row" spacing={1} sx={{ flexShrink: 0, justifyContent: "flex-end", flexWrap: "wrap", gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={copied ? <CheckIcon color="success" /> : <ContentCopyIcon />}
              onClick={handleCopyTable}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              {copied ? "Đã sao chép!" : "Sao chép số liệu"}
            </Button>
            <Button
              size="small"
              variant="contained"
              color="primary"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportExcel}
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              Xuất Excel (UTF-8)
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportAllExcel}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Xuất Tổng hợp 28 Huyện
            </Button>
          </Stack>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {/* Detailed 12-Month Table */}
        {activeReport && (
          <>
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main" }}>
                Bảng Số liệu Thời tiết 12 Tháng — {activeReport.location.name} ({activeReport.location.province})
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Số liệu khí hậu nhiều năm phục vụ làm báo cáo kế hoạch bay và kiểm tra điều kiện thời tiết
              </Typography>
            </Box>

            <TableContainer sx={{ overflowX: "auto", borderRadius: 1.5 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "action.hover" }}>
                    <TableCell sx={{ fontWeight: 700, width: 85 }}>Tháng</TableCell>
                    <TableCell sx={{ fontWeight: 700, width: 140 }}>Đặc trưng mùa</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, width: 110 }}>Nhiệt độ (°C)</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, width: 110 }}>Lượng mưa (mm)</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, width: 95 }}>Số ngày mưa</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, width: 95 }}>Ngày khô ráo</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, width: 110 }}>Gió TB / Giật</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, width: 100 }}>Giờ nắng (h/d)</TableCell>
                    <TableCell sx={{ fontWeight: 700, minWidth: 260 }}>Nhận định Thời tiết & Khả năng Bay</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, width: 130 }}>Tốc độ bay đề xuất</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {activeReport.monthlyStats.map((s) => {
                    const pace = PACE_STYLES[s.flightPace] || PACE_STYLES.NORMAL;
                    const isRainyHeavy = s.precipitationSum >= 180;
                    const isDrySunny = s.precipitationSum < 50;

                    return (
                      <TableRow
                        key={s.month}
                        hover
                        sx={{
                          bgcolor: isDrySunny
                            ? "rgba(102, 187, 106, 0.04)"
                            : isRainyHeavy
                            ? "rgba(239, 83, 80, 0.04)"
                            : "transparent",
                        }}
                      >
                        <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>
                          {s.monthName}
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {s.seasonName}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {s.avgTemp}°C
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            ({s.avgTempMin} - {s.avgTempMax}°)
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              color: isRainyHeavy ? "error.main" : isDrySunny ? "success.main" : "text.primary",
                            }}
                          >
                            {s.precipitationSum} mm
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Chip
                            size="small"
                            label={`${s.rainyDaysCount} ngày`}
                            color={s.rainyDaysCount >= 15 ? "error" : s.rainyDaysCount >= 8 ? "warning" : "default"}
                            variant="outlined"
                            sx={{ fontSize: "0.72rem", fontWeight: 600 }}
                          />
                        </TableCell>

                        <TableCell align="center">
                          <Typography variant="body2" sx={{ fontWeight: 700, color: "#81c784" }}>
                            {s.dryDaysCount} ngày
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Typography variant="body2">
                            {s.avgWindSpeed} km/h
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            (giật {s.maxWindGust})
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} sx={{ justifyContent: "center", alignItems: "center" }}>
                            <WbSunnyIcon sx={{ color: "#ffca28", fontSize: 15 }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {s.avgSunshineHours} h
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Typography variant="caption" sx={{ color: "text.primary", lineHeight: 1.35, display: "block" }}>
                            {s.flightAssessment}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Chip
                            size="small"
                            label={pace.label}
                            sx={{
                              bgcolor: pace.bg,
                              color: pace.color,
                              border: `1px solid ${pace.border}`,
                              fontWeight: 700,
                              fontSize: "0.72rem",
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Footer Summary Stats */}
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper sx={{ p: 1.5, bgcolor: "background.default", borderRadius: 1.5 }}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <ThunderstormIcon color="info" />
                    <Box>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        Tổng lượng mưa trung bình năm
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "info.main" }}>
                        {activeReport.annualRainfall.toLocaleString()} mm
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Paper sx={{ p: 1.5, bgcolor: "background.default", borderRadius: 1.5 }}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <WbSunnyIcon sx={{ color: "#ffca28" }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        Số ngày mưa trung bình năm
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#ffca28" }}>
                        {activeReport.annualRainyDays} ngày mưa / 365 ngày
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Paper sx={{ p: 1.5, bgcolor: "background.default", borderRadius: 1.5 }}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <AirIcon color="warning" />
                    <Box>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        Quy luật phân bố mùa vụ
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "text.primary", display: "block" }}>
                        {activeReport.location.province === "Bình Định"
                          ? "☀️ Mùa khô T1-T8 nhiều nắng | ⛈️ Mùa mưa bão T9-T12"
                          : "☀️ Mùa khô T11-T4 nắng ráo | 🌧️ Mùa mưa dầm T5-T10"}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
      </Paper>
    </Stack>
  );
}
