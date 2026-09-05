/**
 * Radar Rain / Precipitation Intensity Legend Component (with Minimize / Expand)
 */

import { useState } from "react";
import { Box, Typography, Stack, Paper, IconButton, Tooltip, Chip, useTheme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ColorLensIcon from "@mui/icons-material/ColorLens";

export default function RadarLegend() {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const panelBg = isDark ? "rgba(15, 23, 42, 0.92)" : "rgba(255, 255, 255, 0.94)";
  const panelBorder = isDark ? "1px solid rgba(255, 255, 255, 0.18)" : "1px solid rgba(0, 0, 0, 0.12)";
  const panelColor = isDark ? "#fff" : "#0f172a";

  if (isMinimized) {
    return (
      <Tooltip title="Mở rộng thang đo cường độ mưa">
        <Chip
          icon={<ColorLensIcon sx={{ fontSize: "16px !important", color: isDark ? "#fbbf24" : "#d97706" }} />}
          label="🌈 Thang đo lượng mưa (dBZ)"
          size="small"
          onClick={() => setIsMinimized(false)}
          sx={{
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "0.75rem",
            bgcolor: panelBg,
            backdropFilter: "blur(8px)",
            border: panelBorder,
            color: panelColor,
            "&:hover": { bgcolor: isDark ? "rgba(30, 41, 59, 0.95)" : "rgba(241, 245, 249, 0.98)" },
          }}
        />
      </Tooltip>
    );
  }

  return (
    <Paper
      elevation={4}
      sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor: panelBg,
        backdropFilter: "blur(10px)",
        border: panelBorder,
        color: panelColor,
        minWidth: 260,
      }}
    >
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.75rem", color: isDark ? "#fbbf24" : "#d97706" }}>
          🌈 CƯỜNG ĐỘ MƯA (RADAR dBZ)
        </Typography>
        <Tooltip title="Thu nhỏ">
          <IconButton size="small" onClick={() => setIsMinimized(true)} sx={{ color: isDark ? "#94a3b8" : "#64748b", p: 0.2 }}>
            <CloseIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Gradient Bar */}
      <Box
        sx={{
          height: 8,
          borderRadius: 1,
          background:
            "linear-gradient(to right, #00ffff 0%, #0099ff 20%, #00cc00 40%, #ffff00 60%, #ff9900 75%, #ff0000 90%, #cc00cc 100%)",
          mb: 0.8,
          border: isDark ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(0,0,0,0.15)",
        }}
      />

      {/* Scale Labels */}
      <Stack direction="row" sx={{ justifyContent: "space-between", fontSize: "0.65rem", color: isDark ? "#cbd5e1" : "#475569" }}>
        <span>Nhẹ</span>
        <span>Vừa</span>
        <span>To</span>
        <span>Rất to</span>
        <span>Cực đoan</span>
      </Stack>
    </Paper>
  );
}
