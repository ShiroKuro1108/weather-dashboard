/**
 * Radar Rain / Precipitation Intensity Legend Component (with Minimize / Expand)
 */

import { useState } from "react";
import { Box, Typography, Stack, Paper, IconButton, Tooltip, Chip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ColorLensIcon from "@mui/icons-material/ColorLens";

export default function RadarLegend() {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  if (isMinimized) {
    return (
      <Tooltip title="Mở rộng thang đo cường độ mưa">
        <Chip
          icon={<ColorLensIcon sx={{ fontSize: "16px !important", color: "#fbbf24" }} />}
          label="🌈 Thang đo lượng mưa (dBZ)"
          size="small"
          onClick={() => setIsMinimized(false)}
          sx={{
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "0.75rem",
            bgcolor: "rgba(15, 23, 42, 0.9)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "#fff",
            "&:hover": { bgcolor: "rgba(30, 41, 59, 0.95)" },
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
        bgcolor: "rgba(15, 23, 42, 0.92)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        color: "#fff",
        minWidth: 260,
      }}
    >
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.75rem", color: "#fbbf24" }}>
          🌈 CƯỜNG ĐỘ MƯA (RADAR dBZ)
        </Typography>
        <Tooltip title="Thu nhỏ">
          <IconButton size="small" onClick={() => setIsMinimized(true)} sx={{ color: "#94a3b8", p: 0.2 }}>
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
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      />

      {/* Scale Labels */}
      <Stack direction="row" sx={{ justifyContent: "space-between", fontSize: "0.65rem", color: "#cbd5e1" }}>
        <span>Nhẹ</span>
        <span>Vừa</span>
        <span>To</span>
        <span>Rất to</span>
        <span>Cực đoan</span>
      </Stack>
    </Paper>
  );
}
