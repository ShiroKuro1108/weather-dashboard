/**
 * Layer Controls: Switch between Radar (dBZ) / Satellite (IR), Base Map style, Opacity and 28 UAV Stations toggle
 */

import {
  Paper,
  Typography,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Slider,
  FormControlLabel,
  Switch,
  Divider,
  IconButton,
  Tooltip,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ThunderstormIcon from "@mui/icons-material/Thunderstorm";
import SatelliteAltIcon from "@mui/icons-material/SatelliteAlt";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import type { RadarLayerMode, BaseMapStyle } from "../types/radarTypes";

interface Props {
  layerMode: RadarLayerMode;
  onLayerModeChange: (mode: RadarLayerMode) => void;
  baseMapStyle: BaseMapStyle;
  onBaseMapStyleChange: (style: BaseMapStyle) => void;
  opacity: number;
  onOpacityChange: (opacity: number) => void;
  showMarkers: boolean;
  onToggleMarkers: () => void;
  onClose?: () => void;
}

export default function RadarLayerControl({
  layerMode,
  onLayerModeChange,
  baseMapStyle,
  onBaseMapStyleChange,
  opacity,
  onOpacityChange,
  showMarkers,
  onToggleMarkers,
  onClose,
}: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const panelBg = isDark ? "rgba(15, 23, 42, 0.94)" : "rgba(255, 255, 255, 0.96)";
  const panelBorder = isDark ? "1px solid rgba(255, 255, 255, 0.18)" : "1px solid rgba(0, 0, 0, 0.12)";
  const panelColor = isDark ? "#fff" : "#0f172a";
  const dividerColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
  const labelColor = isDark ? "#93c5fd" : "#1976d2";
  const titleColor = isDark ? "#60a5fa" : "#1565c0";
  const toggleBtnBorder = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)";
  const toggleBtnColor = isDark ? "#94a3b8" : "#64748b";

  return (
    <Paper
      elevation={5}
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: panelBg,
        backdropFilter: "blur(14px)",
        border: panelBorder,
        color: panelColor,
        minWidth: 280,
        maxWidth: 320,
        maxHeight: "calc(100vh - 220px)",
        overflowY: "auto",
        scrollbarWidth: "thin",
        "&::-webkit-scrollbar": { width: 5 },
        "&::-webkit-scrollbar-thumb": { bgcolor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)", borderRadius: 4 },
      }}
    >
      <Stack spacing={1.8}>
        {/* Header with Close */}
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: titleColor, fontSize: "0.85rem" }}>
            ⚙️ TÙY CHỈNH LỚP PHỦ
          </Typography>
          {onClose && (
            <Tooltip title="Đóng bảng">
              <IconButton size="small" onClick={onClose} sx={{ color: isDark ? "#94a3b8" : "#64748b", p: 0.2 }}>
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>

        <Divider sx={{ borderColor: dividerColor }} />

        {/* 2 Layer Modes: Radar vs Satellite */}
        <div>
          <Typography variant="caption" sx={{ fontWeight: 700, color: labelColor, display: "block", mb: 0.8, fontSize: "0.75rem" }}>
            🛰️ LỚP THỜI TIẾT
          </Typography>
          <ToggleButtonGroup
            value={layerMode}
            exclusive
            onChange={(_, val) => val && onLayerModeChange(val)}
            size="small"
            fullWidth
            sx={{
              "& .MuiToggleButton-root": {
                color: toggleBtnColor,
                borderColor: toggleBtnBorder,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.75rem",
                "&.Mui-selected": {
                  color: isDark ? "#fff" : "#1976d2",
                  bgcolor: isDark ? "rgba(59, 130, 246, 0.35)" : "rgba(25, 118, 210, 0.12)",
                  borderColor: isDark ? "#3b82f6" : "#1976d2",
                },
              },
            }}
          >
            <ToggleButton value="radar">
              <ThunderstormIcon sx={{ fontSize: 16, mr: 0.8, color: "#60a5fa" }} />
              Radar Mưa
            </ToggleButton>
            <ToggleButton value="satellite">
              <SatelliteAltIcon sx={{ fontSize: 16, mr: 0.8, color: "#a78bfa" }} />
              Mây Vệ Tinh
            </ToggleButton>
          </ToggleButtonGroup>
        </div>

        <Divider sx={{ borderColor: dividerColor }} />

        {/* 28 District UAV Markers Toggle */}
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={showMarkers}
              onChange={onToggleMarkers}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": {
                  color: "#ef4444",
                  "& + .MuiSwitch-track": { backgroundColor: "#dc2626" },
                },
              }}
            />
          }
          label={
            <Stack direction="row" spacing={0.6} sx={{ alignItems: "center" }}>
              <LocationOnIcon sx={{ fontSize: 16, color: "#ef4444" }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: panelColor, fontSize: "0.75rem" }}>
                Hiện 28 Trạm UAV
              </Typography>
            </Stack>
          }
        />

        <Divider sx={{ borderColor: dividerColor }} />

        {/* Base Map Style */}
        <div>
          <Typography variant="caption" sx={{ fontWeight: 700, color: labelColor, display: "block", mb: 0.8, fontSize: "0.75rem" }}>
            🗺️ NỀN BẢN ĐỒ
          </Typography>
          <ToggleButtonGroup
            value={baseMapStyle}
            exclusive
            onChange={(_, val) => val && onBaseMapStyleChange(val)}
            size="small"
            fullWidth
            sx={{
              "& .MuiToggleButton-root": {
                color: toggleBtnColor,
                borderColor: toggleBtnBorder,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.72rem",
                "&.Mui-selected": {
                  color: isDark ? "#fff" : "#1976d2",
                  bgcolor: isDark ? "rgba(59, 130, 246, 0.35)" : "rgba(25, 118, 210, 0.12)",
                  borderColor: isDark ? "#3b82f6" : "#1976d2",
                },
              },
            }}
          >
            <ToggleButton value="dark">Tối</ToggleButton>
            <ToggleButton value="streets">Sáng / Đường</ToggleButton>
            <ToggleButton value="satellite">Vệ tinh</ToggleButton>
          </ToggleButtonGroup>
        </div>

        <Divider sx={{ borderColor: dividerColor }} />

        {/* Opacity Slider */}
        <div>
          <Stack direction="row" sx={{ justifyContent: "space-between" }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: labelColor, fontSize: "0.75rem" }}>
              ĐỘ ĐẬM LỚP RADAR
            </Typography>
            <Typography variant="caption" sx={{ color: isDark ? "#cbd5e1" : "#475569", fontWeight: 600 }}>
              {Math.round(opacity * 100)}%
            </Typography>
          </Stack>
          <Slider
            size="small"
            min={0.2}
            max={1.0}
            step={0.05}
            value={opacity}
            onChange={(_, val) => onOpacityChange(val as number)}
            sx={{ color: isDark ? "#3b82f6" : "#1976d2" }}
          />
        </div>
      </Stack>
    </Paper>
  );
}
