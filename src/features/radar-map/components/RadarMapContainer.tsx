/**
 * Leaflet-based Interactive Map Container with Weather Radar & Satellite Overlay
 */

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Box } from "@mui/material";
import { buildRadarTileUrl } from "../api/rainViewerApi";
import type { RadarFrame, RadarLayerMode, BaseMapStyle } from "../types/radarTypes";
import type { DistrictWeatherData } from "../../../types/weather";
import { GIA_LAI_DISTRICTS } from "../../../utils/locations";

interface Props {
  host: string;
  currentFrame: RadarFrame | null;
  layerMode: RadarLayerMode;
  baseMapStyle: BaseMapStyle;
  opacity: number;
  showMarkers: boolean;
  districtData?: Map<string, DistrictWeatherData>;
  selectedDistrictId?: string | null;
  onSelectDistrict?: (id: string) => void;
  onMapReady?: (map: L.Map) => void;
}

const BASE_MAP_URLS: Record<BaseMapStyle, { url: string; attribution: string }> = {
  dark: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
  },
  streets: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap contributors",
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye",
  },
};

export default function RadarMapContainer({
  host,
  currentFrame,
  layerMode,
  baseMapStyle,
  opacity,
  showMarkers,
  districtData,
  selectedDistrictId,
  onSelectDistrict,
  onMapReady,
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const radarTileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const onMapReadyRef = useRef(onMapReady);
  onMapReadyRef.current = onMapReady;

  // 1. Initialize Map on Mount (Run ONLY once!)
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Map zoom options
    const map = L.map(mapContainerRef.current, {
      center: [13.85, 108.65],
      zoom: 8.5,
      minZoom: 5,
      maxZoom: 18,
      zoomControl: false,
    });

    // Zoom control at top right
    L.control.zoom({ position: "topright" }).addTo(map);

    // Initial Base Tile Layer
    const baseConfig = BASE_MAP_URLS.dark;
    const baseLayer = L.tileLayer(baseConfig.url, {
      attribution: baseConfig.attribution,
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    baseTileLayerRef.current = baseLayer;

    // Layer Group for Markers
    const markersGroup = L.layerGroup().addTo(map);
    markersLayerGroupRef.current = markersGroup;

    mapRef.current = map;
    if (onMapReadyRef.current) {
      onMapReadyRef.current(map);
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Update Base Map Style
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
    }

    const config = BASE_MAP_URLS[baseMapStyle] || BASE_MAP_URLS.dark;
    const newBaseLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      subdomains: baseMapStyle === "dark" ? "abcd" : "abc",
      maxZoom: 19,
    }).addTo(map);

    baseTileLayerRef.current = newBaseLayer;
  }, [baseMapStyle]);

  // 3. Update Radar / Satellite Tile Layer Overlay
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!currentFrame || !host) {
      if (radarTileLayerRef.current) {
        map.removeLayer(radarTileLayerRef.current);
        radarTileLayerRef.current = null;
      }
      return;
    }

    // Standard Meteorological TITAN colorScheme (2) for precipitation intensity
    const isSatellite = layerMode === "satellite";
    const tileUrl = buildRadarTileUrl(host, currentFrame.path, isSatellite, 2);

    if (radarTileLayerRef.current) {
      map.removeLayer(radarTileLayerRef.current);
    }

    let radarPane = map.getPane("radarPane");
    if (!radarPane) {
      radarPane = map.createPane("radarPane");
      radarPane.style.zIndex = "450";
    }
    radarPane.style.filter = "none";

    const newRadarLayer = L.tileLayer(tileUrl, {
      pane: "radarPane",
      className: "leaflet-radar-tile",
      crossOrigin: true,
      opacity: opacity,
      tileSize: 256,
      maxNativeZoom: 7, // Scale radar tiles seamlessly above zoom 7
      maxZoom: 18,
    }).addTo(map);

    radarTileLayerRef.current = newRadarLayer;
  }, [host, currentFrame, layerMode, opacity]);

  // 4. Render 28 District UAV Station Markers with Synced Open-Meteo Popups
  useEffect(() => {
    const markersGroup = markersLayerGroupRef.current;
    if (!markersGroup) return;

    markersGroup.clearLayers();

    if (!showMarkers) return;

    GIA_LAI_DISTRICTS.forEach((district) => {
      const dwd = districtData?.get(district.id);
      const todaySummary = dwd?.daySummaries[0];
      const morningCond = todaySummary?.morning.condition || "GO";
      const afternoonCond = todaySummary?.afternoon.condition || "GO";

      // Overall condition today
      const overallCond =
        morningCond === "NO_GO" || afternoonCond === "NO_GO"
          ? "NO_GO"
          : morningCond === "CAUTION" || afternoonCond === "CAUTION"
          ? "CAUTION"
          : "GO";

      const badgeColor = overallCond === "GO" ? "#22c55e" : overallCond === "CAUTION" ? "#f59e0b" : "#ef4444";
      const badgeEmoji = overallCond === "GO" ? "🟢" : overallCond === "CAUTION" ? "🟡" : "🔴";

      const totalGoHours = (todaySummary?.morning.goHours || 0) + (todaySummary?.afternoon.goHours || 0);

      // Latest hourly metrics
      const latestHourly = dwd?.hourlyData[new Date().getHours()] || dwd?.hourlyData[0];
      const temp = latestHourly ? `${latestHourly.temperature}°C` : "--°C";
      const wind = latestHourly ? `${latestHourly.windSpeed} km/h` : "-- km/h";
      const gust = latestHourly ? `${latestHourly.windGusts} km/h` : "-- km/h";
      const precip = latestHourly ? `${latestHourly.precipitation} mm` : "0 mm";
      const precipProb = latestHourly ? `${latestHourly.precipProbability}%` : "--%";

      // Custom HTML Marker Icon
      const customIcon = L.divIcon({
        className: "custom-district-marker",
        html: `
          <div style="
            display: flex;
            align-items: center;
            background: rgba(15, 23, 42, 0.9);
            border: 2px solid ${badgeColor};
            border-radius: 16px;
            padding: 2px 8px;
            color: #fff;
            font-size: 11px;
            font-weight: 700;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0,0,0,0.6);
            transform: translate(-50%, -50%);
            cursor: pointer;
          ">
            <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${badgeColor}; margin-right:5px; box-shadow: 0 0 6px ${badgeColor};"></span>
            <span>${district.name}</span>
          </div>
        `,
        iconSize: [0, 0],
      });

      const marker = L.marker([district.centerLat, district.centerLon], { icon: customIcon });

      // Interactive Popup with Weather Details
      const popupHtml = `
        <div style="font-family: 'Segoe UI', Roboto, sans-serif; min-width: 220px; color: #1e293b; padding: 4px;">
          <div style="font-size: 14px; font-weight: 800; border-bottom: 2px solid ${badgeColor}; padding-bottom: 4px; margin-bottom: 6px; display:flex; justify-content:space-between;">
            <span>📍 ${district.name}</span>
            <span style="font-size: 11px; font-weight: 600; color: #64748b;">${district.region === "gia_lai" ? "Gia Lai" : "Bình Định"}</span>
          </div>

          <div style="background: #f8fafc; padding: 6px; border-radius: 6px; margin-bottom: 8px; font-size: 12px;">
            <div style="display:flex; justify-content:space-between; margin-bottom: 3px;">
              <span>Trạng thái bay:</span>
              <strong style="color: ${badgeColor};">${badgeEmoji} ${overallCond === "GO" ? "BAY TỐT" : overallCond === "CAUTION" ? "CẨN TRỌNG" : "KHÔNG BAY"}</strong>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span>Tổng giờ bay hôm nay:</span>
              <strong>${totalGoHours} giờ</strong>
            </div>
          </div>

          <div style="font-size: 11px; color: #334155; line-height: 1.6;">
            <div>🌡️ <b>Nhiệt độ hiện tại:</b> ${temp}</div>
            <div>💨 <b>Gió / Gió giật:</b> ${wind} (Giật ${gust})</div>
            <div>🌧️ <b>Lượng mưa / Xác suất:</b> ${precip} (${precipProb})</div>
            <div>☀️ <b>Khung giờ tối ưu:</b> ${todaySummary?.morning.bestSlot || "06:00 - 09:00"}</div>
          </div>

          ${
            todaySummary?.morning.advisory
              ? `<div style="margin-top: 6px; font-size: 10.5px; color: #475569; background: #e0f2fe; padding: 4px 6px; border-radius: 4px;">💡 ${todaySummary.morning.advisory}</div>`
              : ""
          }
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 300 });

      marker.on("click", () => {
        if (onSelectDistrict) onSelectDistrict(district.id);
      });

      marker.addTo(markersGroup);
    });
  }, [showMarkers, districtData, onSelectDistrict]);

  // 5. Fly to selected district if chosen from outside
  useEffect(() => {
    if (!selectedDistrictId || !mapRef.current) return;
    const district = GIA_LAI_DISTRICTS.find((d) => d.id === selectedDistrictId);
    if (district) {
      mapRef.current.flyTo([district.centerLat, district.centerLon], 10, { duration: 1.2 });
    }
  }, [selectedDistrictId]);

  return (
    <Box
      ref={mapContainerRef}
      sx={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: "#0f172a",
        zIndex: 1,
        "& .leaflet-popup-content-wrapper": {
          borderRadius: "10px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
        },
      }}
    />
  );
}
