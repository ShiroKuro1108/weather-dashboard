import { useState, useMemo } from "react";
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
} from "@mui/material";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import ThunderstormIcon from "@mui/icons-material/Thunderstorm";
import AirIcon from "@mui/icons-material/Air";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import CheckIcon from "@mui/icons-material/Check";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import type { LocationMonthlyReport, FlightPaceType } from "../types/seasonalTypes";
import { REGION_LABELS } from "../../../utils/locations";

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

export default function SeasonalFlyabilityHeatmap({
  reports,
  selectedLocationId,
  onSelectLocation,
}: Props) {
  const [copied, setCopied] = useState(false);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // Group reports by region (Gia Lai vs Binh Dinh)
  const groupedReports = useMemo(() => {
    const giaLai = reports.filter((r) => r.location.province === "Gia Lai");
    const binhDinh = reports.filter((r) => r.location.province === "Bình Định");
    return [
      { label: REGION_LABELS.gia_lai, reports: giaLai, color: "#90caf9" },
      { label: REGION_LABELS.binh_dinh, reports: binhDinh, color: "#81c784" },
    ];
  }, [reports]);

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

  const handleExportCSV = () => {
    if (!activeReport) return;
    let csv = `Thang,Mua vu,Nhiet do TB (C),Nhiet do Min (C),Nhiet do Max (C),Luong mua (mm),So ngay mua,So ngay kho,Gio TB (kmh),Gio giat max (kmh),Gio nang (hd),Nhan dinh thoi tiet,Toc do bay\n`;
    for (const s of activeReport.monthlyStats) {
      csv += `"${s.monthName}","${s.seasonName}",${s.avgTemp},${s.avgTempMin},${s.avgTempMax},${s.precipitationSum},${s.rainyDaysCount},${s.dryDaysCount},${s.avgWindSpeed},${s.maxWindGust},${s.avgSunshineHours},"${s.flightAssessment}","${s.flightPace}"\n`;
    }
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Bao_cao_thoi_tiet_${activeReport.location.id}_12_thang.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Helper to render quick season pill
  const renderSeasonBadge = (seasonName: string, rainMm: number) => {
    if (seasonName.includes("Mùa khô")) {
      return (
        <Box
          sx={{
            py: 0.6,
            px: 0.8,
            borderRadius: 1.5,
            bgcolor: "rgba(255, 202, 40, 0.16)",
            border: "1px solid rgba(255, 202, 40, 0.5)",
            textAlign: "center",
          }}
        >
          <Stack direction="row" spacing={0.3} sx={{ justifyContent: "center", alignItems: "center" }}>
            <WbSunnyIcon sx={{ color: "#ffca28", fontSize: 13 }} />
            <Typography variant="caption" sx={{ color: "#ffe082", fontWeight: 700, fontSize: "0.7rem" }}>
              MÙA KHÔ
            </Typography>
          </Stack>
          <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.65rem", display: "block" }}>
            {rainMm} mm
          </Typography>
        </Box>
      );
    }

    if (seasonName.includes("bão") || seasonName.includes("Cảnh báo")) {
      return (
        <Box
          sx={{
            py: 0.6,
            px: 0.8,
            borderRadius: 1.5,
            bgcolor: "rgba(239, 83, 80, 0.22)",
            border: "1px solid rgba(239, 83, 80, 0.6)",
            textAlign: "center",
          }}
        >
          <Stack direction="row" spacing={0.3} sx={{ justifyContent: "center", alignItems: "center" }}>
            <ThunderstormIcon sx={{ color: "#ef5350", fontSize: 13 }} />
            <Typography variant="caption" sx={{ color: "#ef5350", fontWeight: 700, fontSize: "0.7rem" }}>
              MƯA BÃO
            </Typography>
          </Stack>
          <Typography variant="caption" sx={{ color: "#ffcdd2", fontSize: "0.65rem", display: "block" }}>
            {rainMm} mm
          </Typography>
        </Box>
      );
    }

    // Regular rainy season
    return (
      <Box
        sx={{
          py: 0.6,
          px: 0.8,
          borderRadius: 1.5,
          bgcolor: "rgba(41, 182, 246, 0.16)",
          border: "1px solid rgba(41, 182, 246, 0.4)",
          textAlign: "center",
        }}
      >
        <Stack direction="row" spacing={0.3} sx={{ justifyContent: "center", alignItems: "center" }}>
          <Typography variant="caption" sx={{ color: "#81d4fa", fontWeight: 700, fontSize: "0.7rem" }}>
            🌧️ MÙA MƯA
          </Typography>
        </Stack>
        <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.65rem", display: "block" }}>
          {rainMm} mm
        </Typography>
      </Box>
    );
  };

  return (
    <Stack spacing={3}>
      {/* 1. TOP OVERVIEW MATRIX (NHẬN BIẾT MÙA MƯA / KHÔ THEO 2 KHU VỰC) */}
      <Paper sx={{ p: 2, borderRadius: 2, bgcolor: "background.paper" }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, mb: 2 }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main" }}>
              Kế hoạch Phân bố Mùa vụ 12 Tháng theo Khu vực
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Nhìn nhanh để biết ngay tháng nào mùa mưa / mùa khô tại từng huyện • Bấm vào huyện để xem chi tiết
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 0.5 }}>
            <Chip
              icon={<WbSunnyIcon sx={{ color: "#ffca28 !important" }} />}
              size="small"
              label="☀️ Mùa khô (Nắng nhiều, bay thuận lợi)"
              sx={{ bgcolor: "rgba(255, 202, 40, 0.15)", border: "1px solid #ffca28", fontWeight: 600, fontSize: "0.75rem" }}
            />
            <Chip
              size="small"
              label="🌧️ Mùa mưa (Mưa rào chiều, bay ca sáng)"
              sx={{ bgcolor: "rgba(41, 182, 246, 0.15)", border: "1px solid #29b6f6", fontWeight: 600, fontSize: "0.75rem" }}
            />
            <Chip
              icon={<ThunderstormIcon sx={{ color: "#ef5350 !important" }} />}
              size="small"
              label="⛈️ Mùa mưa bão (Cấm bay ven biển)"
              sx={{ bgcolor: "rgba(239, 83, 80, 0.15)", border: "1px solid #ef5350", fontWeight: 600, fontSize: "0.75rem" }}
            />
          </Stack>
        </Stack>

        <TableContainer sx={{ overflowX: "auto", maxHeight: 520, borderRadius: 1.5 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: "action.hover" }}>
                <TableCell sx={{ fontWeight: 700, minWidth: 170, position: "sticky", left: 0, bgcolor: "background.paper", zIndex: 3 }}>
                  Địa bàn theo Khu vực
                </TableCell>
                {months.map((m) => (
                  <TableCell key={m} align="center" sx={{ fontWeight: 700, minWidth: 92 }}>
                    Tháng {m}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {groupedReports.map((group) => {
                if (group.reports.length === 0) return null;
                return [
                  // Region Header Row
                  <TableRow key={group.label} sx={{ bgcolor: "action.hover" }}>
                    <TableCell
                      colSpan={13}
                      sx={{
                        fontWeight: 800,
                        color: group.color,
                        py: 1,
                        fontSize: "0.85rem",
                        position: "sticky",
                        left: 0,
                        bgcolor: "background.default",
                      }}
                    >
                      📍 {group.label.toUpperCase()} ({group.reports.length} huyện/TX/TP)
                    </TableCell>
                  </TableRow>,
                  // District Rows
                  ...group.reports.map((r) => {
                    const isSelected = r.location.id === selectedLocationId;
                    return (
                      <TableRow
                        key={r.location.id}
                        hover
                        selected={isSelected}
                        onClick={() => onSelectLocation(r.location.id)}
                        sx={{
                          cursor: "pointer",
                          "&.Mui-selected": { bgcolor: "rgba(144, 202, 249, 0.12)" },
                        }}
                      >
                        <TableCell
                          sx={{
                            fontWeight: isSelected ? 800 : 600,
                            color: isSelected ? "primary.main" : "text.primary",
                            position: "sticky",
                            left: 0,
                            bgcolor: isSelected ? "background.paper" : "background.paper",
                            zIndex: 2,
                            borderRight: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                            {isSelected && <TouchAppIcon sx={{ fontSize: 16, color: "primary.main" }} />}
                            <Typography variant="body2" sx={{ fontWeight: isSelected ? 800 : 600 }}>
                              {r.location.name}
                            </Typography>
                          </Stack>
                        </TableCell>

                        {months.map((m) => {
                          const stat = r.monthlyStats.find((s) => s.month === m);
                          if (!stat) return <TableCell key={m} align="center">—</TableCell>;
                          return (
                            <TableCell key={m} align="center" sx={{ p: 0.6 }}>
                              {renderSeasonBadge(stat.seasonName, stat.precipitationSum)}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  }),
                ];
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 2. DETAILED 12-MONTH WEATHER REPORT TABLE FOR SELECTED DISTRICT */}
      {activeReport && (
        <Paper sx={{ p: 2.5, borderRadius: 2, bgcolor: "background.paper" }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ justifyContent: "space-between", alignItems: { xs: "stretch", sm: "center" }, mb: 2 }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Bảng Số liệu Thời tiết 12 Tháng — {activeReport.location.name} ({activeReport.location.province})
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Số liệu khí hậu nhiều năm phục vụ làm báo cáo kế hoạch bay và kiểm tra điều kiện thời tiết
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} sx={{ flexShrink: 0, justifyContent: "flex-end" }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={copied ? <CheckIcon color="success" /> : <ContentCopyIcon />}
                onClick={handleCopyTable}
                sx={{ textTransform: "none" }}
              >
                {copied ? "Đã sao chép!" : "Sao chép số liệu"}
              </Button>
              <Button
                size="small"
                variant="contained"
                startIcon={<FileDownloadIcon />}
                onClick={handleExportCSV}
                sx={{ textTransform: "none" }}
              >
                Xuất file CSV
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          <TableContainer sx={{ overflowX: "auto" }}>
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

          {/* Footer Climate Stats */}
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
        </Paper>
      )}
    </Stack>
  );
}
