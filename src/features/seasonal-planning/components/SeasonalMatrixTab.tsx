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
  TextField,
  MenuItem,
  Button,
} from "@mui/material";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import ThunderstormIcon from "@mui/icons-material/Thunderstorm";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import type { LocationMonthlyReport } from "../types/seasonalTypes";
import { REGION_LABELS } from "../../../utils/locations";
import { exportAllDistrictsSummaryToExcel } from "../utils/excelExporter";

interface Props {
  reports: LocationMonthlyReport[];
  selectedLocationId: string;
  onSelectLocationAndNavigateToDetail: (locId: string) => void;
}

export default function SeasonalMatrixTab({
  reports,
  selectedLocationId,
  onSelectLocationAndNavigateToDetail,
}: Props) {
  const [regionFilter, setRegionFilter] = useState<"all" | "gia_lai" | "binh_dinh">("all");
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // Group reports by region
  const groupedReports = useMemo(() => {
    const giaLai = reports.filter((r) => r.location.province === "Gia Lai");
    const binhDinh = reports.filter((r) => r.location.province === "Bình Định");

    const groups = [];
    if (regionFilter === "all" || regionFilter === "gia_lai") {
      groups.push({ id: "gia_lai", label: REGION_LABELS.gia_lai, reports: giaLai, color: "#90caf9" });
    }
    if (regionFilter === "all" || regionFilter === "binh_dinh") {
      groups.push({ id: "binh_dinh", label: REGION_LABELS.binh_dinh, reports: binhDinh, color: "#81c784" });
    }
    return groups;
  }, [reports, regionFilter]);

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

    if (seasonName.includes("Giao mùa")) {
      return (
        <Box
          sx={{
            py: 0.6,
            px: 0.8,
            borderRadius: 1.5,
            bgcolor: "rgba(38, 166, 154, 0.16)",
            border: "1px solid rgba(38, 166, 154, 0.5)",
            textAlign: "center",
          }}
        >
          <Stack direction="row" spacing={0.3} sx={{ justifyContent: "center", alignItems: "center" }}>
            <Typography variant="caption" sx={{ color: "#80cbc4", fontWeight: 700, fontSize: "0.7rem" }}>
              ⛅ GIAO MÙA
            </Typography>
          </Stack>
          <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.65rem", display: "block" }}>
            {rainMm} mm
          </Typography>
        </Box>
      );
    }

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
    <Stack spacing={2.5}>
      <Paper sx={{ p: 2, borderRadius: 2, bgcolor: "background.paper" }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", md: "center" }, mb: 2 }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main" }}>
              Kế hoạch Phân bố Mùa vụ Toàn bộ 28 Huyện theo Khu vực
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Hiển thị đầy đủ 28 đơn vị hành chính • Bấm vào huyện bất kỳ để chuyển sang bảng số liệu chi tiết
            </Typography>
          </Box>

          {/* Action & Filter Bar */}
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <FilterAltIcon color="primary" fontSize="small" />
              <TextField
                select
                size="small"
                label="Chọn khu vực hiển thị"
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value as any)}
                sx={{ minWidth: 220 }}
              >
                <MenuItem value="all">Tất cả các khu vực (28 huyện)</MenuItem>
                <MenuItem value="gia_lai">Khu vực Gia Lai (17 huyện)</MenuItem>
                <MenuItem value="binh_dinh">Khu vực Bình Định (11 huyện)</MenuItem>
              </TextField>
            </Stack>

            <Button
              size="small"
              variant="contained"
              color="primary"
              startIcon={<FileDownloadIcon />}
              onClick={() => exportAllDistrictsSummaryToExcel(reports)}
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              Xuất Excel 28 Huyện
            </Button>
          </Stack>
        </Stack>

        {/* Legend Bar */}
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 0.5, mb: 2 }}>
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
            label="⛈️ Mùa mưa bão (Cảnh báo cấm bay ven biển)"
            sx={{ bgcolor: "rgba(239, 83, 80, 0.15)", border: "1px solid #ef5350", fontWeight: 600, fontSize: "0.75rem" }}
          />
        </Stack>

        {/* Full 28-District Matrix Table */}
        <TableContainer sx={{ overflowX: "auto", maxHeight: 600, borderRadius: 1.5 }}>
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
                  <TableRow key={group.label} sx={{ bgcolor: "rgba(255,255,255,0.05)" }}>
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
                  ...group.reports.map((r) => {
                    const isSelected = r.location.id === selectedLocationId;
                    return (
                      <TableRow
                        key={r.location.id}
                        hover
                        selected={isSelected}
                        onClick={() => onSelectLocationAndNavigateToDetail(r.location.id)}
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
                            bgcolor: "background.paper",
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
    </Stack>
  );
}
