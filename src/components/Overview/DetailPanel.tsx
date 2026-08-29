import { Paper, Box, Typography, Stack, Divider, Chip } from "@mui/material";
import AirIcon from "@mui/icons-material/Air";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import CloudIcon from "@mui/icons-material/Cloud";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FlightConditionChip from "../Weather/FlightConditionChip";
import type { DistrictDaySummary, SessionSummary } from "../../types/weather";

interface Props {
  summary: DistrictDaySummary;
  onClose: () => void;
}

function SessionBlock({ label, s }: { label: string; s: SessionSummary }) {
  return (
    <Box sx={{ flex: 1 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{label}</Typography>
        <FlightConditionChip condition={s.condition} size="small" />
      </Stack>

      <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.5 }}>
        {s.reason}
      </Typography>

      <Typography variant="body2" sx={{
        color: s.condition === "GO" ? "success.main" : s.condition === "CAUTION" ? "warning.main" : "error.main",
        fontWeight: 500,
        mb: 1,
      }}>
        💡 {s.advisory}
      </Typography>

      <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
        <Chip icon={<AccessTimeIcon />} label={`Khung giờ: ${s.bestSlot}`} size="small" variant="outlined" />
        <Chip icon={<AirIcon />} label={`Gió ${Math.round(s.avgWindSpeed)} km/h`} size="small" variant="outlined" />
        <Chip icon={<WaterDropIcon />} label={`Mưa ${s.totalPrecipitation.toFixed(1)} mm`} size="small" variant="outlined" />
        <Chip icon={<CloudIcon />} label={`Mây ${Math.round(s.avgCloudCover)}%`} size="small" variant="outlined" />
      </Stack>
    </Box>
  );
}

export default function DetailPanel({ summary, onClose }: Props) {
  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 2,
        border: "1px solid rgba(255,255,255,0.12)",
        bgcolor: "background.paper",
        animation: "slideDown 0.2s ease",
        "@keyframes slideDown": {
          from: { opacity: 0, transform: "translateY(-8px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      }}
    >
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          📍 {summary.districtName} — {summary.dayOfWeek} {summary.date.substring(5).replace("-", "/")}
        </Typography>
        <Chip label="✕ Đóng" size="small" onClick={onClose} sx={{ cursor: "pointer" }} />
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
        <SessionBlock label="☀️ SÁNG (06-12h)" s={summary.morning} />
        <Divider orientation="vertical" flexItem />
        <SessionBlock label="🌤️ CHIỀU (12-18h)" s={summary.afternoon} />
      </Stack>
    </Paper>
  );
}
