/**
 * Interactive Playback Controller Bar for Weather Radar Timeline (with Minimize / Expand)
 */

import { useState } from "react";
import { Box, Stack, IconButton, Slider, Typography, Chip, Tooltip, Paper, useTheme } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import type { RadarFrame } from "../types/radarTypes";

interface Props {
  frames: RadarFrame[];
  currentIndex: number;
  isPlaying: boolean;
  onIndexChange: (index: number) => void;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onJumpToNow: () => void;
}

export default function RadarPlaybackBar({
  frames,
  currentIndex,
  isPlaying,
  onIndexChange,
  onTogglePlay,
  onPrev,
  onNext,
  onJumpToNow,
}: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const currentFrame = frames[currentIndex];

  const formatFrameTime = (timestamp?: number) => {
    if (!timestamp) return "--:--";
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  const getRelativeTimeLabel = (frame?: RadarFrame) => {
    if (!frame) return "";
    if (frame.type === "nowcast") {
      const now = Date.now();
      const frameTime = frame.time * 1000;
      const diffMins = Math.max(10, Math.round((frameTime - now) / (60 * 1000)));
      return `+${diffMins}p (Dự báo)`;
    }

    const now = Date.now();
    const frameTime = frame.time * 1000;
    const diffMins = Math.round((frameTime - now) / (60 * 1000));

    if (Math.abs(diffMins) <= 5) return "LIVE";
    if (diffMins < 0) return `-${Math.abs(diffMins)}p`;
    return `+${diffMins}p`;
  };

  const isNowFrame = currentFrame && Math.abs((currentFrame.time * 1000) - Date.now()) <= 5 * 60 * 1000;
  const isNowcast = currentFrame?.type === "nowcast";

  const panelBg = isDark ? "rgba(15, 23, 42, 0.92)" : "rgba(255, 255, 255, 0.94)";
  const panelBorder = isDark ? "1px solid rgba(255, 255, 255, 0.18)" : "1px solid rgba(0, 0, 0, 0.12)";
  const panelColor = isDark ? "#fff" : "#0f172a";
  const btnBg = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const btnColor = isDark ? "#fff" : "#0f172a";

  // Compact Minimized Bar
  if (isMinimized) {
    return (
      <Paper
        elevation={4}
        sx={{
          py: 0.8,
          px: 1.5,
          borderRadius: 20,
          bgcolor: panelBg,
          backdropFilter: "blur(10px)",
          border: panelBorder,
          color: panelColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          boxShadow: isDark ? "0 6px 20px rgba(0,0,0,0.5)" : "0 6px 20px rgba(0,0,0,0.1)",
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <IconButton
            size="small"
            onClick={onTogglePlay}
            sx={{
              bgcolor: isPlaying ? "#eab308" : "#2563eb",
              color: "#fff",
              p: 0.6,
              "&:hover": { bgcolor: isPlaying ? "#ca8a04" : "#1d4ed8" },
            }}
          >
            {isPlaying ? <PauseIcon sx={{ fontSize: 16 }} /> : <PlayArrowIcon sx={{ fontSize: 16 }} />}
          </IconButton>

          <Typography variant="body2" sx={{ fontWeight: 800, fontSize: "0.85rem", color: isDark ? "#60a5fa" : "#1976d2" }}>
            ⏰ {formatFrameTime(currentFrame?.time)}
          </Typography>

          <Chip
            size="small"
            label={getRelativeTimeLabel(currentFrame)}
            sx={{
              height: 20,
              fontSize: "0.68rem",
              fontWeight: 700,
              bgcolor: isNowcast ? "rgba(234, 179, 8, 0.25)" : isNowFrame ? "rgba(239, 68, 68, 0.25)" : isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0,0,0,0.08)",
              color: isNowcast ? (isDark ? "#facc15" : "#b45309") : isNowFrame ? (isDark ? "#f87171" : "#dc2626") : "inherit",
            }}
          />
        </Stack>

        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
          <Tooltip title="Mở rộng thanh điều khiển">
            <IconButton size="small" onClick={() => setIsMinimized(false)} sx={{ color: isDark ? "#93c5fd" : "#1976d2", p: 0.5 }}>
              <KeyboardArrowUpIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>
    );
  }

  // Full Expanded Bar
  return (
    <Paper
      elevation={4}
      sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor: panelBg,
        backdropFilter: "blur(12px)",
        border: panelBorder,
        color: panelColor,
      }}
    >
      <Stack spacing={1}>
        {/* Top Info Row */}
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: "1.1rem", color: isDark ? "#60a5fa" : "#1976d2" }}>
              ⏰ {formatFrameTime(currentFrame?.time)}
            </Typography>

            <Chip
              size="small"
              icon={isNowFrame ? <RadioButtonCheckedIcon sx={{ fontSize: "14px !important", color: "#ef4444" }} /> : undefined}
              label={getRelativeTimeLabel(currentFrame)}
              sx={{
                fontWeight: 700,
                fontSize: "0.75rem",
                bgcolor: isNowcast ? "rgba(234, 179, 8, 0.2)" : isNowFrame ? "rgba(239, 68, 68, 0.2)" : "rgba(255, 255, 255, 0.1)",
                color: isNowcast ? "#facc15" : isNowFrame ? "#f87171" : "#e2e8f0",
                border: isNowcast ? "1px solid #facc15" : isNowFrame ? "1px solid #f87171" : "none",
              }}
            />
          </Stack>

          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Tooltip title="Nhảy đến khung hình thời gian thực tế mới nhất">
              <Chip
                label="🔴 LIVE"
                size="small"
                onClick={onJumpToNow}
                sx={{
                  cursor: "pointer",
                  fontWeight: 800,
                  bgcolor: "rgba(239, 68, 68, 0.25)",
                  color: "#fca5a5",
                  border: "1px solid #ef4444",
                  "&:hover": { bgcolor: "rgba(239, 68, 68, 0.4)" },
                }}
              />
            </Tooltip>

            <Tooltip title="Thu gọn thanh timeline">
              <IconButton size="small" onClick={() => setIsMinimized(true)} sx={{ color: "#94a3b8", p: 0.4 }}>
                <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Timeline Slider */}
        <Box sx={{ px: 1 }}>
          <Slider
            size="small"
            min={0}
            max={Math.max(0, frames.length - 1)}
            value={currentIndex}
            onChange={(_, val) => onIndexChange(val as number)}
            sx={{
              color: isNowcast ? "#eab308" : "#3b82f6",
              height: 6,
              "& .MuiSlider-thumb": {
                width: 16,
                height: 16,
                transition: "0.2s cubic-bezier(.47,1.64,.41,.8)",
                "&:hover, &.Mui-focusVisible": {
                  boxShadow: `0px 0px 0px 8px ${isNowcast ? "rgba(234, 179, 8, 0.16)" : "rgba(59, 130, 246, 0.16)"}`,
                },
              },
              "& .MuiSlider-rail": {
                opacity: 0.3,
              },
            }}
          />
        </Box>

        {/* Playback Controls & Frame Ticks */}
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.7rem", fontWeight: 600 }}>
            ⏪ Quá khứ -1h
          </Typography>

          {/* Buttons */}
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <IconButton size="small" onClick={onPrev} sx={{ color: btnColor, bgcolor: btnBg }}>
              <SkipPreviousIcon fontSize="small" />
            </IconButton>

            <IconButton
              size="medium"
              onClick={onTogglePlay}
              sx={{
                bgcolor: isPlaying ? "#eab308" : "#2563eb",
                color: "#fff",
                "&:hover": { bgcolor: isPlaying ? "#ca8a04" : "#1d4ed8" },
                boxShadow: "0 0 12px rgba(37, 99, 235, 0.5)",
              }}
            >
              {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>

            <IconButton size="small" onClick={onNext} sx={{ color: btnColor, bgcolor: btnBg }}>
              <SkipNextIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Typography variant="caption" sx={{ color: "#facc15", fontSize: "0.7rem", fontWeight: 700 }}>
            ⏩ Dự báo +2h
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}
