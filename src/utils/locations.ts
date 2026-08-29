import type { District, FlightLocation } from "../types/weather";

// ===== 28 HUYỆN — TỈNH GIA LAI MỚI (NQ 202/2025) =====
// Gia Lai cũ (17) + Bình Định cũ (11)

export const GIA_LAI_DISTRICTS: District[] = [
  // ==================== KHU VỰC GIA LAI CŨ ====================
  {
    id: "pleiku", name: "TP. Pleiku", type: "city", region: "gia_lai",
    centerLat: 13.9833, centerLon: 108.0000,
    communes: [
      "P. Pleiku", "P. Diên Hồng", "P. Chi Lăng", "P. Thống Nhất",
      "P. Trà Bá", "P. Thắng Lợi", "P. Yên Thế",
      "Xã Biển Hồ", "Xã Tân Sơn", "Xã Gào", "Xã An Phú",
      "Xã Chư Á", "Xã Ia Kênh", "Xã Chư Hdrông"
    ]
  },
  {
    id: "an_khe", name: "TX. An Khê", type: "town", region: "gia_lai",
    centerLat: 13.9544, centerLon: 108.6514,
    communes: [
      "P. An Khê", "P. An Bình", "P. An Phú", "P. An Tân",
      "Xã Cửu An", "Xã Song An", "Xã Tú An", "Xã Xuân An", "Xã Thành An"
    ]
  },
  {
    id: "ayun_pa", name: "TX. Ayun Pa", type: "town", region: "gia_lai",
    centerLat: 13.3906, centerLon: 108.4375,
    communes: [
      "P. Ayun Pa", "P. Sông Bờ", "P. Đoàn Kết", "P. Hòa Bình",
      "Xã Ia Rbol", "Xã Chư Băh", "Xã Ia Sao", "Xã Ia Rtô"
    ]
  },
  {
    id: "chu_pah", name: "H. Chư Păh", type: "district", region: "gia_lai",
    centerLat: 14.1300, centerLon: 108.0000,
    communes: [
      "TT. Phú Hòa", "Xã Hà Tây", "Xã Ia Khươl", "Xã Ia Phí",
      "Xã Ia Ly", "Xã Ia Mơ Nông", "Xã Ia Kreng", "Xã Đăk Tơ Ver",
      "Xã Hòa Phú", "Xã Chư Đăng Ya", "Xã Ia Ka", "Xã Ia Nhin"
    ]
  },
  {
    id: "chu_prong", name: "H. Chư Prông", type: "district", region: "gia_lai",
    centerLat: 13.7500, centerLon: 107.8333,
    communes: [
      "TT. Chư Prông", "Xã Ia Kly", "Xã Ia Drăng", "Xã Ia Boòng",
      "Xã Ia O", "Xã Ia Púch", "Xã Ia Me", "Xã Ia Vê",
      "Xã Ia Bang", "Xã Ia Pia", "Xã Ia Ga", "Xã Ia Lâu",
      "Xã Ia Piơr", "Xã Bàu Cạn", "Xã Bình Giáo", "Xã Ia Phìn",
      "Xã Ia Tôr", "Xã Thăng Hưng"
    ]
  },
  {
    id: "chu_puh", name: "H. Chư Pưh", type: "district", region: "gia_lai",
    centerLat: 13.5000, centerLon: 108.0000,
    communes: [
      "TT. Nhơn Hòa", "Xã Ia Hrú", "Xã Ia Rong", "Xã Ia Dreng",
      "Xã Ia Hla", "Xã Chư Don", "Xã Ia Phang", "Xã Ia Le", "Xã Ia Blứ"
    ]
  },
  {
    id: "chu_se", name: "H. Chư Sê", type: "district", region: "gia_lai",
    centerLat: 13.7167, centerLon: 108.0833,
    communes: [
      "Xã Chư Sê", "Xã Al Bá", "Xã Ayun", "Xã Bar Măih",
      "Xã Bờ Ngoong", "Xã Chư Pơng", "Xã H Bông", "Xã Ia HLốp",
      "Xã Ia Ko", "Xã Ia Tiêm", "Xã Kông Htok"
    ]
  },
  {
    id: "dak_doa", name: "H. Đak Đoa", type: "district", region: "gia_lai",
    centerLat: 14.1135, centerLon: 108.1666,
    communes: [
      "TT. Đak Đoa", "Xã Hà Đông", "Xã Đak Sơ Mei", "Xã Đak Krong",
      "Xã Hải Yang", "Xã Kon Gang", "Xã Tân Bình", "Xã Hnol",
      "Xã Ia Pết", "Xã Ia Băng", "Xã Glar", "Xã A Dơk",
      "Xã Trang", "Xã Hà Bầu", "Xã Nam Yang", "Xã K'Dang",
      "Xã H'Neng", "Xã Ia Dơk"
    ]
  },
  {
    id: "dak_po", name: "H. Đak Pơ", type: "district", region: "gia_lai",
    centerLat: 13.9333, centerLon: 108.5333,
    communes: [
      "Xã Đak Pơ", "Xã An Thành", "Xã Cư An", "Xã Hà Tam",
      "Xã Phú An", "Xã Tân An", "Xã Ya Hội", "Xã Yang Bắc"
    ]
  },
  {
    id: "duc_co", name: "H. Đức Cơ", type: "district", region: "gia_lai",
    centerLat: 13.7833, centerLon: 107.6167,
    communes: [
      "TT. Chư Ty", "Xã Ia Dom", "Xã Ia Nan", "Xã Ia Din",
      "Xã Ia Kla", "Xã Ia Kriêng", "Xã Ia Pnôn", "Xã Ia Lang", "Xã Ia Dơk"
    ]
  },
  {
    id: "ia_grai", name: "H. Ia Grai", type: "district", region: "gia_lai",
    centerLat: 13.9667, centerLon: 107.8167,
    communes: [
      "TT. Ia Kha", "Xã Ia Grăng", "Xã Ia Tô", "Xã Ia O",
      "Xã Ia Dêr", "Xã Ia Chia", "Xã Ia Pếch", "Xã Ia Sao",
      "Xã Ia Hrung", "Xã Ia Bă", "Xã Ia Krai", "Xã Ia Tơi"
    ]
  },
  {
    id: "ia_pa", name: "H. Ia Pa", type: "district", region: "gia_lai",
    centerLat: 13.4833, centerLon: 108.5500,
    communes: [
      "Xã Ia Pa", "Xã Chư Mố", "Xã Ia Kdăm", "Xã Ia Tul",
      "Xã Ia Broăi", "Xã Ia Trok", "Xã Kim Tân", "Xã Ia Mrơn",
      "Xã Chư Răng", "Xã Pờ Tó"
    ]
  },
  {
    id: "kbang", name: "H. Kbang", type: "district", region: "gia_lai",
    centerLat: 14.2833, centerLon: 108.6000,
    communes: [
      "TT. Kbang", "Xã Đak Roong", "Xã Kon Pne", "Xã Kông Lơng Khơng",
      "Xã Kông Pla", "Xã Krong", "Xã Lơ Ku", "Xã Nghĩa An",
      "Xã Sơ Pai", "Xã Sơn Lang", "Xã Tơ Tung", "Xã Đông",
      "Xã Đak Hlơ", "Xã Đak SMar"
    ]
  },
  {
    id: "kong_chro", name: "H. Kông Chro", type: "district", region: "gia_lai",
    centerLat: 13.7667, centerLon: 108.5667,
    communes: [
      "TT. Kông Chro", "Xã An Trung", "Xã Chơ Long", "Xã Đak Kơ Ning",
      "Xã Đak Pling", "Xã Đak Pơ Pho", "Xã Đak Tơ Pang", "Xã Đak Song",
      "Xã Kông Yang", "Xã SRó", "Xã Yang Nam", "Xã Yang Trung", "Xã Ya Ma"
    ]
  },
  {
    id: "krong_pa", name: "H. Krông Pa", type: "district", region: "gia_lai",
    centerLat: 13.2315, centerLon: 108.6549,
    communes: [
      "TT. Phú Túc", "Xã Chư Gu", "Xã Chư Ngọc", "Xã Chư Rcăm",
      "Xã Đất Bằng", "Xã Ia Hdreh", "Xã Ia Mlá", "Xã Ia Rsai",
      "Xã Ia Rsươm", "Xã Ia Rmok", "Xã Krông Năng", "Xã Phú Cần", "Xã Uar"
    ]
  },
  {
    id: "mang_yang", name: "H. Mang Yang", type: "district", region: "gia_lai",
    centerLat: 13.9667, centerLon: 108.3000,
    communes: [
      "TT. Kon Dơng", "Xã Ayun", "Xã Đak Djrăng", "Xã Đak Jơ Ta",
      "Xã Đak Ta Ley", "Xã Đak Yă", "Xã Hà Ra", "Xã Kon Chiêng",
      "Xã Kon Thụp", "Xã Lơ Pang", "Xã Đê Ar", "Xã Hra"
    ]
  },
  {
    id: "phu_thien", name: "H. Phú Thiện", type: "district", region: "gia_lai",
    centerLat: 13.4333, centerLon: 108.3833,
    communes: [
      "TT. Phú Thiện", "Xã Ayun Hạ", "Xã Chrôh Pơnan", "Xã Chư A Thai",
      "Xã Ia Ake", "Xã Ia Hiao", "Xã Ia Peng", "Xã Ia Piar",
      "Xã Ia Sol", "Xã Ia Yeng"
    ]
  },

  // ==================== KHU VỰC BÌNH ĐỊNH CŨ ====================
  {
    id: "quy_nhon", name: "TP. Quy Nhơn", type: "city", region: "binh_dinh",
    centerLat: 13.7765, centerLon: 109.2237, communes: []
  },
  {
    id: "an_nhon", name: "TX. An Nhơn", type: "town", region: "binh_dinh",
    centerLat: 13.8833, centerLon: 109.1167, communes: []
  },
  {
    id: "hoai_nhon", name: "TX. Hoài Nhơn", type: "town", region: "binh_dinh",
    centerLat: 14.3667, centerLon: 109.0167, communes: []
  },
  {
    id: "an_lao", name: "H. An Lão", type: "district", region: "binh_dinh",
    centerLat: 14.5500, centerLon: 108.9167, communes: []
  },
  {
    id: "hoai_an", name: "H. Hoài Ân", type: "district", region: "binh_dinh",
    centerLat: 14.3333, centerLon: 108.8833, communes: []
  },
  {
    id: "phu_cat", name: "H. Phù Cát", type: "district", region: "binh_dinh",
    centerLat: 14.0500, centerLon: 109.0500, communes: []
  },
  {
    id: "phu_my", name: "H. Phù Mỹ", type: "district", region: "binh_dinh",
    centerLat: 14.2230, centerLon: 109.0861, communes: []
  },
  {
    id: "tay_son", name: "H. Tây Sơn", type: "district", region: "binh_dinh",
    centerLat: 13.9431, centerLon: 108.8800, communes: []
  },
  {
    id: "tuy_phuoc", name: "H. Tuy Phước", type: "district", region: "binh_dinh",
    centerLat: 13.8167, centerLon: 109.1500, communes: []
  },
  {
    id: "van_canh", name: "H. Vân Canh", type: "district", region: "binh_dinh",
    centerLat: 13.7000, centerLon: 108.9000, communes: []
  },
  {
    id: "vinh_thanh", name: "H. Vĩnh Thạnh", type: "district", region: "binh_dinh",
    centerLat: 14.2500, centerLon: 108.6833, communes: []
  },
];

// ===== HELPERS =====

export function getDistrictLocations(): FlightLocation[] {
  return GIA_LAI_DISTRICTS.map((d) => ({
    id: d.id,
    name: d.name,
    lat: d.centerLat,
    lon: d.centerLon,
    district: d.name,
    isDistrictCenter: true,
  }));
}

export function flattenLocations(): FlightLocation[] {
  const result: FlightLocation[] = [];
  for (const d of GIA_LAI_DISTRICTS) {
    result.push({
      id: d.id, name: d.name,
      lat: d.centerLat, lon: d.centerLon,
      district: d.name, isDistrictCenter: true,
    });
    for (const commune of d.communes) {
      const slug = commune
        .replace(/^(P\.|TT\.|Xã)\s*/, "")
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d").replace(/Đ/g, "D")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");
      result.push({
        id: `${d.id}__${slug}`, name: commune,
        lat: d.centerLat, lon: d.centerLon,
        district: d.name, isDistrictCenter: false,
      });
    }
  }
  return result;
}

export const DEFAULT_LOCATION: FlightLocation = {
  id: "pleiku", name: "TP. Pleiku",
  lat: 13.9833, lon: 108.0000,
  district: "TP. Pleiku", isDistrictCenter: true,
};

export const REGION_LABELS: Record<string, string> = {
  gia_lai: "Khu vực Gia Lai",
  binh_dinh: "Khu vực Bình Định",
};
