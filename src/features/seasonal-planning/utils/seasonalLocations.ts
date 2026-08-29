import type { SeasonalLocation } from "../types/seasonalTypes";
import { GIA_LAI_DISTRICTS, REGION_LABELS } from "../../../utils/locations";

// Map all 28 districts of Gia Lai and Binh Dinh from locations.ts
export function getAllAvailableSeasonalLocations(): SeasonalLocation[] {
  return GIA_LAI_DISTRICTS.map((d) => ({
    id: d.id,
    name: d.name,
    province: d.region === "binh_dinh" ? "Bình Định" : "Gia Lai",
    zone: d.region === "binh_dinh" ? "duyen_hai_mientrung" : "tay_nguyen",
    zoneLabel: d.region === "binh_dinh" ? REGION_LABELS.binh_dinh : REGION_LABELS.gia_lai,
    lat: d.centerLat,
    lon: d.centerLon,
    description: `${d.name} (${d.region === "binh_dinh" ? REGION_LABELS.binh_dinh : REGION_LABELS.gia_lai})`,
  }));
}

// Default featured benchmark districts across Gia Lai and Binh Dinh
export const DEFAULT_FEATURED_LOCATIONS: SeasonalLocation[] = [
  // Khu vực Gia Lai
  {
    id: "pleiku",
    name: "TP. Pleiku",
    province: "Gia Lai",
    zone: "tay_nguyen",
    zoneLabel: "Khu vực Gia Lai",
    lat: 13.9833,
    lon: 108.0000,
    description: "TP. Pleiku (Khu vực Gia Lai) - Cao nguyên phía Tây",
  },
  {
    id: "an_khe",
    name: "TX. An Khê",
    province: "Gia Lai",
    zone: "tay_nguyen",
    zoneLabel: "Khu vực Gia Lai",
    lat: 13.9544,
    lon: 108.6514,
    description: "TX. An Khê (Khu vực Gia Lai) - Cửa ngõ phía Đông Gia Lai",
  },
  {
    id: "ayun_pa",
    name: "TX. Ayun Pa",
    province: "Gia Lai",
    zone: "tay_nguyen",
    zoneLabel: "Khu vực Gia Lai",
    lat: 13.3906,
    lon: 108.4375,
    description: "TX. Ayun Pa (Khu vực Gia Lai) - Thung lũng phía Nam Gia Lai",
  },
  // Khu vực Bình Định
  {
    id: "quy_nhon",
    name: "TP. Quy Nhơn",
    province: "Bình Định",
    zone: "duyen_hai_mientrung",
    zoneLabel: "Khu vực Bình Định",
    lat: 13.7765,
    lon: 109.2237,
    description: "TP. Quy Nhơn (Khu vực Bình Định) - Trung tâm Duyên hải",
  },
  {
    id: "phu_cat",
    name: "H. Phù Cát",
    province: "Bình Định",
    zone: "duyen_hai_mientrung",
    zoneLabel: "Khu vực Bình Định",
    lat: 14.0500,
    lon: 109.0500,
    description: "H. Phù Cát (Khu vực Bình Định) - Ven biển trung tâm",
  },
  {
    id: "hoai_nhon",
    name: "TX. Hoài Nhơn",
    province: "Bình Định",
    zone: "duyen_hai_mientrung",
    zoneLabel: "Khu vực Bình Định",
    lat: 14.3667,
    lon: 109.0167,
    description: "TX. Hoài Nhơn (Khu vực Bình Định) - Phía Bắc Duyên hải Bình Định",
  },
];
