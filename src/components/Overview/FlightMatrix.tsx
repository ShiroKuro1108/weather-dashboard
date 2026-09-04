import { useState, useMemo } from "react";
import {
  Box, Typography, Paper, Stack, LinearProgress, Chip, Divider, Button, Tooltip,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import MatrixCell from "./MatrixCell";
import DetailPanel from "./DetailPanel";
import type { DistrictWeatherData, DistrictDaySummary, FlightCondition } from "../../types/weather";
import { GIA_LAI_DISTRICTS, REGION_LABELS } from "../../utils/locations";
import { exportDailyOverviewMatrixToExcel } from "../../utils/dailyExcelExporter";

interface Props {
  data: Map<string, DistrictWeatherData>;
  isLoading: boolean;
  progress: number;
}

export default function FlightMatrix({ data, isLoading, progress }: Props) {
  const [selected, setSelected] = useState<{ districtId: string; date: string; session: "morning" | "afternoon" } | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Get unique dates from first available district data
  const dates = useMemo(() => {
    for (const dwd of data.values()) {
      return dwd.daySummaries.map((s) => ({ date: s.date, dayOfWeek: s.dayOfWeek }));
    }
    return [];
  }, [data]);

  // Group districts by region
  const regions = useMemo(() => {
    const groups: { label: string; districts: typeof GIA_LAI_DISTRICTS }[] = [];
    const giaLai = GIA_LAI_DISTRICTS.filter((d) => d.region === "gia_lai");
    const binhDinh = GIA_LAI_DISTRICTS.filter((d) => d.region === "binh_dinh");
    if (giaLai.length > 0) groups.push({ label: REGION_LABELS.gia_lai, districts: giaLai });
    if (binhDinh.length > 0) groups.push({ label: REGION_LABELS.binh_dinh, districts: binhDinh });
    return groups;
  }, []);

  // Find selected cell detail
  const selectedDetail: DistrictDaySummary | null = useMemo(() => {
    if (!selected) return null;
    const dwd = data.get(selected.districtId);
    if (!dwd) return null;
    return dwd.daySummaries.find((s) => s.date === selected.date) ?? null;
  }, [selected, data]);

  // Day summary when clicking date header
  const daySummaryInfo = useMemo(() => {
    if (!selectedDate) return null;

    const allSummaries: DistrictDaySummary[] = [];
    for (const dwd of data.values()) {
      const ds = dwd.daySummaries.find((s) => s.date === selectedDate);
      if (ds) allSummaries.push(ds);
    }
    if (allSummaries.length === 0) return null;

    const countCondition = (session: "morning" | "afternoon", cond: FlightCondition) =>
      allSummaries.filter((s) => s[session].condition === cond).length;

    const goMorning = allSummaries.filter((s) => s.morning.condition === "GO");
    const goAfternoon = allSummaries.filter((s) => s.afternoon.condition === "GO");
    const bestMorning = goMorning.sort((a, b) => b.morning.goHours - a.morning.goHours);
    const bestAfternoon = goAfternoon.sort((a, b) => b.afternoon.goHours - a.afternoon.goHours);

    return {
      date: selectedDate,
      dayOfWeek: allSummaries[0]?.dayOfWeek ?? "",
      total: allSummaries.length,
      morning: {
        go: countCondition("morning", "GO"),
        caution: countCondition("morning", "CAUTION"),
        noGo: countCondition("morning", "NO_GO"),
        best: bestMorning.slice(0, 5),
      },
      afternoon: {
        go: countCondition("afternoon", "GO"),
        caution: countCondition("afternoon", "CAUTION"),
        noGo: countCondition("afternoon", "NO_GO"),
        best: bestAfternoon.slice(0, 5),
      },
    };
  }, [selectedDate, data]);

  const todayStr = new Date().toISOString().substring(0, 10);

  return (
    <Box>
      {/* Loading progress */}
      {isLoading && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress variant="determinate" value={progress} sx={{ borderRadius: 1 }} />
          <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.5 }}>
            Đang tải dữ liệu {progress}% ({Math.round(progress * 28 / 100)}/28 huyện)...
          </Typography>
        </Box>
      )}

      {/* Top Action Bar */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          mb: 1.5,
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.05rem" }}>
            📊 Ma trận Điều kiện bay theo Ca (7 ngày)
          </Typography>
          <Chip
            label="28 Huyện / TX / TP"
            size="small"
            variant="outlined"
            sx={{ fontWeight: 600, fontSize: "0.75rem", borderColor: "rgba(255,255,255,0.2)" }}
          />
        </Stack>

        <Tooltip title="Xuất toàn bộ ma trận lịch bay 7 ngày của 28 huyện ra file Excel">
          <span>
            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={<FileDownloadIcon />}
              disabled={isLoading || data.size === 0}
              onClick={() => exportDailyOverviewMatrixToExcel(data)}
              sx={{
                fontWeight: 600,
                textTransform: "none",
                borderRadius: 1.5,
                px: 2,
                py: 0.7,
                boxShadow: "0 2px 8px rgba(46, 125, 50, 0.25)",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(46, 125, 50, 0.35)",
                },
              }}
            >
              Xuất Excel (7 ngày)
            </Button>
          </span>
        </Tooltip>
      </Stack>

      {/* Matrix */}
      <Paper sx={{ overflow: "auto", borderRadius: 2, bgcolor: "background.paper" }}>
        <Box sx={{ minWidth: 800, p: 1.5 }}>
          {/* Header row — dates (CLICKABLE) */}
          <Stack direction="row" sx={{ alignItems: "center", mb: 0.5 }}>
            <Box sx={{ width: 130, flexShrink: 0 }} />
            {dates.map((d) => (
              <Box
                key={d.date}
                onClick={() => {
                  setSelectedDate((prev) => (prev === d.date ? null : d.date));
                  setSelected(null);
                }}
                sx={{
                  width: 88,
                  flexShrink: 0,
                  textAlign: "center",
                  cursor: "pointer",
                  borderBottom: d.date === todayStr ? "2px solid" : selectedDate === d.date ? "2px solid" : "none",
                  borderColor: d.date === todayStr ? "primary.main" : "warning.main",
                  pb: 0.5,
                  borderRadius: "4px 4px 0 0",
                  bgcolor: selectedDate === d.date ? "rgba(255,167,38,0.08)" : "transparent",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.05)",
                  },
                }}
              >
                <Typography variant="caption" sx={{
                  fontWeight: d.date === todayStr || selectedDate === d.date ? 800 : 600,
                  color: selectedDate === d.date ? "warning.main" : d.date === todayStr ? "primary.main" : "text.secondary",
                  fontSize: d.date === todayStr ? "0.8rem" : "0.7rem",
                }}>
                  {d.date === todayStr ? "HÔM NAY" : d.dayOfWeek}
                </Typography>
                <Typography variant="caption" sx={{ display: "block", color: "text.secondary", fontSize: "0.65rem" }}>
                  {d.date.substring(5).replace("-", "/")}
                </Typography>
              </Box>
            ))}
          </Stack>

          {/* Sub-header — Sáng / Chiều */}
          <Stack direction="row" sx={{ alignItems: "center", mb: 1 }}>
            <Box sx={{ width: 130, flexShrink: 0 }} />
            {dates.map((d) => (
              <Stack key={d.date + "-sub"} direction="row" spacing={0.5} sx={{ width: 88, flexShrink: 0, justifyContent: "center" }}>
                <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.55rem", width: 40, textAlign: "center" }}>S</Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.55rem", width: 40, textAlign: "center" }}>C</Typography>
              </Stack>
            ))}
          </Stack>

          {/* Region groups */}
          {regions.map((region) => (
            <Box key={region.label}>
              <Typography variant="caption" sx={{
                fontWeight: 700,
                color: "primary.main",
                px: 1,
                py: 0.3,
                display: "block",
                bgcolor: "rgba(144,202,249,0.08)",
                borderRadius: 0.5,
                mb: 0.5,
                fontSize: "0.7rem",
              }}>
                {region.label}
              </Typography>

              {region.districts.map((district) => {
                const dwd = data.get(district.id);
                return (
                  <Stack
                    key={district.id}
                    direction="row"
                    sx={{
                      alignItems: "center",
                      py: 0.3,
                      "&:hover": { bgcolor: "rgba(255,255,255,0.03)" },
                    }}
                  >
                    {/* District name */}
                    <Box sx={{ width: 130, flexShrink: 0, px: 1 }}>
                      <Typography variant="body2" sx={{
                        fontWeight: 500,
                        fontSize: "0.75rem",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}>
                        {district.name}
                      </Typography>
                    </Box>

                    {/* Day cells */}
                    {dates.map((d) => {
                      const daySummary = dwd?.daySummaries.find((s) => s.date === d.date);
                      if (!daySummary) {
                        return (
                          <Stack key={d.date} direction="row" spacing={0.5} sx={{ width: 88, flexShrink: 0, justifyContent: "center" }}>
                            <Box sx={{ width: 40, height: 32, bgcolor: "rgba(255,255,255,0.04)", borderRadius: 0.5 }} />
                            <Box sx={{ width: 40, height: 32, bgcolor: "rgba(255,255,255,0.04)", borderRadius: 0.5 }} />
                          </Stack>
                        );
                      }
                      return (
                        <Stack key={d.date} direction="row" spacing={0.5} sx={{
                          width: 88,
                          flexShrink: 0,
                          justifyContent: "center",
                          bgcolor: selectedDate === d.date ? "rgba(255,167,38,0.04)" : "transparent",
                        }}>
                          <MatrixCell
                            session={daySummary.morning}
                            isSelected={selected?.districtId === district.id && selected.date === d.date && selected.session === "morning"}
                            onClick={() => {
                              setSelected({ districtId: district.id, date: d.date, session: "morning" });
                              setSelectedDate(null);
                            }}
                          />
                          <MatrixCell
                            session={daySummary.afternoon}
                            isSelected={selected?.districtId === district.id && selected.date === d.date && selected.session === "afternoon"}
                            onClick={() => {
                              setSelected({ districtId: district.id, date: d.date, session: "afternoon" });
                              setSelectedDate(null);
                            }}
                          />
                        </Stack>
                      );
                    })}
                  </Stack>
                );
              })}
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Day Summary Panel — when clicking date header */}
      {daySummaryInfo && (
        <Paper sx={{
          mt: 2, p: 2.5, borderRadius: 2,
          border: "1px solid rgba(255,167,38,0.3)",
          animation: "slideDown 0.2s ease",
          "@keyframes slideDown": {
            from: { opacity: 0, transform: "translateY(-8px)" },
            to: { opacity: 1, transform: "translateY(0)" },
          },
        }}>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              📅 {daySummaryInfo.dayOfWeek} — {daySummaryInfo.date.substring(5).replace("-", "/")}
            </Typography>
            <Chip label="✕ Đóng" size="small" onClick={() => setSelectedDate(null)} sx={{ cursor: "pointer" }} />
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
            {/* Sáng */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>☀️ SÁNG (06-12h)</Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                <Chip label={`🟢 ${daySummaryInfo.morning.go} huyện bay được`} size="small" sx={{ bgcolor: "rgba(102,187,106,0.15)", color: "#66bb6a" }} />
                <Chip label={`🟡 ${daySummaryInfo.morning.caution} cẩn thận`} size="small" sx={{ bgcolor: "rgba(255,167,38,0.15)", color: "#ffa726" }} />
                <Chip label={`🔴 ${daySummaryInfo.morning.noGo} không bay`} size="small" sx={{ bgcolor: "rgba(244,67,54,0.15)", color: "#f44336" }} />
              </Stack>
              {daySummaryInfo.morning.best.length > 0 && (
                <>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                    Top huyện bay tốt nhất buổi sáng:
                  </Typography>
                  {daySummaryInfo.morning.best.map((s) => (
                    <Typography key={s.districtId} variant="body2" sx={{ fontSize: "0.8rem", ml: 1 }}>
                      ✅ <b>{s.districtName}</b> — {s.morning.goHours}h bay, {s.morning.bestSlot}
                    </Typography>
                  ))}
                </>
              )}
              {daySummaryInfo.morning.go === 0 && (
                <Typography variant="body2" sx={{ color: "error.main" }}>
                  ❌ Không có huyện nào bay được buổi sáng
                </Typography>
              )}
            </Box>

            <Divider orientation="vertical" flexItem />

            {/* Chiều */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>🌤️ CHIỀU (12-18h)</Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                <Chip label={`🟢 ${daySummaryInfo.afternoon.go} huyện bay được`} size="small" sx={{ bgcolor: "rgba(102,187,106,0.15)", color: "#66bb6a" }} />
                <Chip label={`🟡 ${daySummaryInfo.afternoon.caution} cẩn thận`} size="small" sx={{ bgcolor: "rgba(255,167,38,0.15)", color: "#ffa726" }} />
                <Chip label={`🔴 ${daySummaryInfo.afternoon.noGo} không bay`} size="small" sx={{ bgcolor: "rgba(244,67,54,0.15)", color: "#f44336" }} />
              </Stack>
              {daySummaryInfo.afternoon.best.length > 0 && (
                <>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                    Top huyện bay tốt nhất buổi chiều:
                  </Typography>
                  {daySummaryInfo.afternoon.best.map((s) => (
                    <Typography key={s.districtId} variant="body2" sx={{ fontSize: "0.8rem", ml: 1 }}>
                      ✅ <b>{s.districtName}</b> — {s.afternoon.goHours}h bay, {s.afternoon.bestSlot}
                    </Typography>
                  ))}
                </>
              )}
              {daySummaryInfo.afternoon.go === 0 && (
                <Typography variant="body2" sx={{ color: "error.main" }}>
                  ❌ Không có huyện nào bay được buổi chiều
                </Typography>
              )}
            </Box>
          </Stack>
        </Paper>
      )}

      {/* District Detail Panel — when clicking a cell */}
      {selectedDetail && (
        <Box sx={{ mt: 2 }}>
          <DetailPanel
            summary={selectedDetail}
            onClose={() => setSelected(null)}
          />
        </Box>
      )}
    </Box>
  );
}
