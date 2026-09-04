/**
 * Radar Dashboard: Main unified page for Interactive Weather Radar Map
 */

import { useState, useCallback } from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import LayersIcon from "@mui/icons-material/Layers";
import RadarIcon from "@mui/icons-material/Radar";
import RadarMapContainer from "./RadarMapContainer";
import RadarPlaybackBar from "./RadarPlaybackBar";
import RadarLayerControl from "./RadarLayerControl";
import RadarLegend from "./RadarLegend";
import { useRadarFrames } from "../hooks/useRadarFrames";
import { useRadarPlayback } from "../hooks/useRadarPlayback";
import type { RadarLayerMode, BaseMapStyle } from "../types/radarTypes";
import type { DistrictWeatherData } from "../../../types/weather";
import { GIA_LAI_DISTRICTS } from "../../../utils/locations";

interface Props {
  districtData?: Map<string, DistrictWeatherData>;
}

export default function RadarDashboard({ districtData }: Props) {
  const { host, radarFrames, satelliteFrames, isLoading, error, refetch, lastUpdated } = useRadarFrames();

  // Layer & Map Display State
  const [, setMapInstance] = useState<L.Map | null>(null);
  const handleMapReady = useCallback((map: L.Map) => {
    setMapInstance(map);
  }, []);

  const [layerMode, setLayerMode] = useState<RadarLayerMode>("radar");
  const [baseMapStyle, setBaseMapStyle] = useState<BaseMapStyle>("dark");
  const [opacity, setOpacity] = useState<number>(0.8);
  const [showMarkers, setShowMarkers] = useState<boolean>(true);
  const [showLayerControl, setShowLayerControl] = useState<boolean>(false);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>("");

  const activeFrames = layerMode === "satellite" ? satelliteFrames : radarFrames;

  const {
    currentFrameIndex,
    setCurrentFrameIndex,
    currentFrame,
    isPlaying,
    togglePlay,
    prevFrame,
    nextFrame,
    jumpToNow,
  } = useRadarPlayback({ frames: activeFrames });

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1.5 }}>
      {/* Top Header Card */}
      <Paper
        elevation={2}
        sx={{
          p: 1.5,
          borderRadius: 2,
          bgcolor: "background.paper",
          backgroundImage: "none",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          sx={{
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
          }}
        >
          {/* Title & Status */}
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <RadarIcon sx={{ color: "primary.main", fontSize: 28 }} />
            <div>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                Bản đồ Radar Lượng mưa &amp; Mây Vệ tinh (Nowcasting)
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                Giám sát di chuyển mây mưa thời gian thực phục vụ tác chiến bay UAV • 28 địa bàn
              </Typography>
            </div>
          </Stack>

          {/* District Quick-Fly Selector & Controls */}
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", width: { xs: "100%", md: "auto" } }}>
            <FormControl size="small" sx={{ minWidth: 190 }}>
              <InputLabel id="radar-district-select-label" sx={{ fontSize: "0.8rem" }}>
                🎯 Nhảy đến địa bàn
              </InputLabel>
              <Select
                labelId="radar-district-select-label"
                value={selectedDistrictId}
                label="🎯 Nhảy đến địa bàn"
                onChange={(e) => setSelectedDistrictId(e.target.value)}
                sx={{ fontSize: "0.8rem" }}
              >
                <MenuItem value="">
                  <em>-- Toàn cảnh 2 tỉnh --</em>
                </MenuItem>
                {GIA_LAI_DISTRICTS.map((d) => (
                  <MenuItem key={d.id} value={d.id} sx={{ fontSize: "0.8rem" }}>
                    {d.name} ({d.region === "gia_lai" ? "Gia Lai" : "Bình Định"})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Tooltip title="Bật / tắt bảng điều khiển lớp phủ">
              <IconButton
                onClick={() => setShowLayerControl((prev) => !prev)}
                color={showLayerControl ? "primary" : "default"}
                sx={{ bgcolor: showLayerControl ? "rgba(59, 130, 246, 0.15)" : "transparent" }}
              >
                <LayersIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Làm mới ảnh radar RainViewer">
              <IconButton onClick={() => refetch()} disabled={isLoading} color="primary">
                {isLoading ? <CircularProgress size={20} /> : <RefreshIcon />}
              </IconButton>
            </Tooltip>

            {lastUpdated && (
              <Chip
                label={`Cập nhật: ${lastUpdated.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`}
                size="small"
                variant="outlined"
                sx={{ display: { xs: "none", sm: "inline-flex" }, fontSize: "0.75rem" }}
              />
            )}
          </Stack>
        </Stack>
      </Paper>

      {/* Error Notice if any */}
      {error && (
        <Alert severity="warning" sx={{ width: "100%", borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Main Map Box */}
      <Paper
        elevation={3}
        sx={{
          position: "relative",
          width: "100%",
          height: "calc(100vh - 210px)",
          minHeight: 560,
          borderRadius: 2,
          overflow: "hidden",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* Leaflet Map */}
        <RadarMapContainer
          host={host}
          currentFrame={currentFrame}
          layerMode={layerMode}
          baseMapStyle={baseMapStyle}
          opacity={opacity}
          showMarkers={showMarkers}
          districtData={districtData}
          selectedDistrictId={selectedDistrictId}
          onSelectDistrict={(id) => setSelectedDistrictId(id)}
          onMapReady={handleMapReady}
        />

        {/* Floating Layer Controls (Top Left / Collapsible) */}
        {showLayerControl && (
          <Box
            sx={{
              position: "absolute",
              top: 16,
              left: 16,
              zIndex: 1000,
              maxWidth: 300,
              animation: "fadeIn 0.2s ease-in-out",
              "@keyframes fadeIn": {
                from: { opacity: 0, transform: "translateY(-6px)" },
                to: { opacity: 1, transform: "translateY(0)" },
              },
            }}
          >
            <RadarLayerControl
              layerMode={layerMode}
              onLayerModeChange={setLayerMode}
              baseMapStyle={baseMapStyle}
              onBaseMapStyleChange={setBaseMapStyle}
              opacity={opacity}
              onOpacityChange={setOpacity}
              showMarkers={showMarkers}
              onToggleMarkers={() => setShowMarkers((prev) => !prev)}
              onClose={() => setShowLayerControl(false)}
            />
          </Box>
        )}

        {/* Floating Precipitation Legend (Bottom Left) */}
        {layerMode === "radar" && (
          <Box
            sx={{
              position: "absolute",
              bottom: 90,
              left: 16,
              zIndex: 1000,
              display: { xs: "none", sm: "block" },
              maxWidth: 320,
            }}
          >
            <RadarLegend />
          </Box>
        )}

        {/* Floating Playback Bar (Bottom Center) */}
        <Box
          sx={{
            position: "absolute",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            width: "calc(100% - 32px)",
            maxWidth: 580,
          }}
        >
          <RadarPlaybackBar
            frames={activeFrames}
            currentIndex={currentFrameIndex}
            isPlaying={isPlaying}
            onIndexChange={setCurrentFrameIndex}
            onTogglePlay={togglePlay}
            onPrev={prevFrame}
            onNext={nextFrame}
            onJumpToNow={jumpToNow}
          />
        </Box>
      </Paper>
    </Box>
  );
}
