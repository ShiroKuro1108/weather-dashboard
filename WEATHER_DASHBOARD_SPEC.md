# WEATHER DASHBOARD SPECIFICATION
## VDCD Flight Weather Decision System — Gia Lai

> **Mục đích tài liệu**: Đây là spec tự đủ (self-contained). Bất kỳ agent hoặc developer nào đọc file này đều có thể triển khai toàn bộ hệ thống mà KHÔNG cần thêm context từ conversation hay requirement khác.

---

## 1. BUSINESS CONTEXT

### 1.1 Vấn đề
Đội bay UAV khảo sát địa chính tại Gia Lai cần quyết định nhanh: **bay ở đâu, ngày nào, khung giờ nào** dựa trên dự báo thời tiết. Hiện tại không có công cụ nào giúp đánh giá điều kiện bay theo giờ.

### 1.2 Giải pháp
Hệ thống gồm 2 phần:
1. **Web Dashboard** — Bảng dự báo thời tiết động, tự cập nhật, xem trên mọi thiết bị (bao gồm điện thoại tại hiện trường bay)
2. **Python Excel Export** — Script xuất file Excel dự báo có conditional formatting, dễ chia sẻ qua Zalo/email

### 1.3 Người dùng
- Trưởng đội bay (quyết định lịch bay)
- Phi công UAV (kiểm tra điều kiện trước bay)
- Quản lý dự án (lập kế hoạch dài hạn)

---

## 2. TECH STACK

| Layer | Technology | Version |
|---|---|---|
| Package Manager | **pnpm** | latest |
| Build Tool | **Vite** | latest |
| Framework | **React** | 18+ |
| Language | **TypeScript** | 5+ |
| UI Library | **Material UI (MUI)** | 6+ (`@mui/material`) |
| Styling Engine | **Emotion** | `@emotion/react` + `@emotion/styled` |
| Icons | **MUI Icons** | `@mui/icons-material` |
| Charts | **Recharts** | latest |
| Date Utility | **dayjs** | latest |
| Weather API | **Open-Meteo** | Free, no API key |
| Excel Export (Python) | **openpyxl** | latest |

### 2.1 Khởi tạo project
```bash
pnpm create vite@latest weather-dashboard -- --template react-ts
cd weather-dashboard
pnpm add @mui/material @emotion/react @emotion/styled @mui/icons-material @mui/x-date-pickers dayjs recharts
```

### 2.2 Project Location
```
d:\Work\VDCD\Kế Hoạch Bay\flight-plan-tool\weather-dashboard\
```

---

## 3. API SPECIFICATION

### 3.1 Open-Meteo Forecast API

**Base URL:** `https://api.open-meteo.com/v1/forecast`

**Authentication:** Không cần API key

**Request Parameters:**

| Param | Type | Value | Description |
|---|---|---|---|
| `latitude` | float | Tọa độ vĩ | Vĩ độ địa điểm |
| `longitude` | float | Tọa độ kinh | Kinh độ địa điểm |
| `hourly` | string | Comma-separated | Các biến cần lấy |
| `timezone` | string | `Asia/Ho_Chi_Minh` | Múi giờ VN (GMT+7) |
| `forecast_days` | int | `7` hoặc `14` | Số ngày dự báo |
| `wind_speed_unit` | string | `kmh` | Đơn vị gió |

**Hourly Variables cần lấy:**
```
temperature_2m,
relative_humidity_2m,
precipitation,
precipitation_probability,
cloud_cover,
cloud_cover_low,
cloud_cover_mid,
cloud_cover_high,
wind_speed_10m,
wind_gusts_10m,
visibility,
weather_code
```

**Example Request:**
```
GET https://api.open-meteo.com/v1/forecast
  ?latitude=13.98
  &longitude=108.0
  &hourly=temperature_2m,relative_humidity_2m,precipitation,precipitation_probability,cloud_cover,wind_speed_10m,wind_gusts_10m,visibility,weather_code
  &timezone=Asia/Ho_Chi_Minh
  &forecast_days=7
```

**Response Structure:**
```typescript
interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
  hourly_units: Record<string, string>;
  hourly: {
    time: string[];              // ISO 8601, e.g. "2026-08-18T06:00"
    temperature_2m: number[];
    relative_humidity_2m: number[];
    precipitation: number[];
    precipitation_probability: number[];
    cloud_cover: number[];
    wind_speed_10m: number[];
    wind_gusts_10m: number[];
    visibility: number[];
    weather_code: number[];
  };
}
```

### 3.2 Weather Code Mapping (WMO)
```typescript
const WEATHER_CODES: Record<number, { label: string; icon: string }> = {
  0: { label: "Trời quang", icon: "WbSunny" },
  1: { label: "Ít mây", icon: "WbSunny" },
  2: { label: "Mây rải rác", icon: "Cloud" },
  3: { label: "U ám", icon: "Cloud" },
  45: { label: "Sương mù", icon: "Foggy" },
  48: { label: "Sương mù đóng băng", icon: "Foggy" },
  51: { label: "Mưa phùn nhẹ", icon: "Grain" },
  53: { label: "Mưa phùn", icon: "Grain" },
  55: { label: "Mưa phùn dày", icon: "Grain" },
  61: { label: "Mưa nhẹ", icon: "Umbrella" },
  63: { label: "Mưa vừa", icon: "Umbrella" },
  65: { label: "Mưa to", icon: "Thunderstorm" },
  80: { label: "Mưa rào nhẹ", icon: "Umbrella" },
  81: { label: "Mưa rào vừa", icon: "Umbrella" },
  82: { label: "Mưa rào to", icon: "Thunderstorm" },
  95: { label: "Giông", icon: "Thunderstorm" },
  96: { label: "Giông + mưa đá nhẹ", icon: "Thunderstorm" },
  99: { label: "Giông + mưa đá to", icon: "Thunderstorm" },
};
```

---

## 4. LOCATIONS DATA

Tất cả 17 đơn vị hành chính cấp huyện và 200 xã/phường/thị trấn trong tỉnh Gia Lai.

Lưu trong `src/utils/locations.ts`. Dữ liệu tổ chức theo **nhóm huyện** để dùng với MUI `Autocomplete` grouped.

```typescript
// --- Types ---
export type DistrictType = "city" | "town" | "district";

export interface FlightLocation {
  id: string;            // Unique slug: "pleiku" hoặc "pleiku__p_dien_hong"
  name: string;          // Tên hiển thị: "P. Diên Hồng"
  lat: number;
  lon: number;
  district: string;      // Tên huyện/TP cha: "TP. Pleiku"
  isDistrictCenter: boolean; // true = trung tâm huyện (dùng khi chọn cả huyện)
}

export interface District {
  id: string;
  name: string;          // "TP. Pleiku", "H. Chư Sê", ...
  type: DistrictType;
  centerLat: number;
  centerLon: number;
  communes: string[];    // Danh sách tên xã/phường/TT
}

// --- 17 Huyện/Thị xã/Thành phố ---
export const GIA_LAI_DISTRICTS: District[] = [
  {
    id: "pleiku", name: "TP. Pleiku", type: "city",
    centerLat: 13.9833, centerLon: 108.0000,
    communes: [
      "P. Pleiku", "P. Diên Hồng", "P. Chi Lăng", "P. Thống Nhất",
      "P. Trà Bá", "P. Thắng Lợi", "P. Yên Thế",
      "Xã Biển Hồ", "Xã Tân Sơn", "Xã Gào", "Xã An Phú",
      "Xã Chư Á", "Xã Ia Kênh", "Xã Chư Hdrông"
    ]
  },
  {
    id: "an_khe", name: "TX. An Khê", type: "town",
    centerLat: 13.9544, centerLon: 108.6514,
    communes: [
      "P. An Khê", "P. An Bình", "P. An Phú", "P. An Tân",
      "Xã Cửu An", "Xã Song An", "Xã Tú An", "Xã Xuân An", "Xã Thành An"
    ]
  },
  {
    id: "ayun_pa", name: "TX. Ayun Pa", type: "town",
    centerLat: 13.3906, centerLon: 108.4375,
    communes: [
      "P. Ayun Pa", "P. Sông Bờ", "P. Đoàn Kết", "P. Hòa Bình",
      "Xã Ia Rbol", "Xã Chư Băh", "Xã Ia Sao", "Xã Ia Rtô"
    ]
  },
  {
    id: "chu_pah", name: "H. Chư Păh", type: "district",
    centerLat: 14.1300, centerLon: 108.0000,
    communes: [
      "TT. Phú Hòa", "Xã Hà Tây", "Xã Ia Khươl", "Xã Ia Phí",
      "Xã Ia Ly", "Xã Ia Mơ Nông", "Xã Ia Kreng", "Xã Đăk Tơ Ver",
      "Xã Hòa Phú", "Xã Chư Đăng Ya", "Xã Ia Ka", "Xã Ia Nhin"
    ]
  },
  {
    id: "chu_prong", name: "H. Chư Prông", type: "district",
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
    id: "chu_puh", name: "H. Chư Pưh", type: "district",
    centerLat: 13.5000, centerLon: 108.0000,
    communes: [
      "TT. Nhơn Hòa", "Xã Ia Hrú", "Xã Ia Rong", "Xã Ia Dreng",
      "Xã Ia Hla", "Xã Chư Don", "Xã Ia Phang", "Xã Ia Le", "Xã Ia Blứ"
    ]
  },
  {
    id: "chu_se", name: "H. Chư Sê", type: "district",
    centerLat: 13.7167, centerLon: 108.0833,
    communes: [
      "Xã Chư Sê", "Xã Al Bá", "Xã Ayun", "Xã Bar Măih",
      "Xã Bờ Ngoong", "Xã Chư Pơng", "Xã H Bông", "Xã Ia HLốp",
      "Xã Ia Ko", "Xã Ia Tiêm", "Xã Kông Htok"
    ]
  },
  {
    id: "dak_doa", name: "H. Đak Đoa", type: "district",
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
    id: "dak_po", name: "H. Đak Pơ", type: "district",
    centerLat: 13.9333, centerLon: 108.5333,
    communes: [
      "Xã Đak Pơ", "Xã An Thành", "Xã Cư An", "Xã Hà Tam",
      "Xã Phú An", "Xã Tân An", "Xã Ya Hội", "Xã Yang Bắc"
    ]
  },
  {
    id: "duc_co", name: "H. Đức Cơ", type: "district",
    centerLat: 13.7833, centerLon: 107.6167,
    communes: [
      "TT. Chư Ty", "Xã Ia Dom", "Xã Ia Nan", "Xã Ia Din",
      "Xã Ia Kla", "Xã Ia Kriêng", "Xã Ia Pnôn", "Xã Ia Lang", "Xã Ia Dơk"
    ]
  },
  {
    id: "ia_grai", name: "H. Ia Grai", type: "district",
    centerLat: 13.9667, centerLon: 107.8167,
    communes: [
      "TT. Ia Kha", "Xã Ia Grăng", "Xã Ia Tô", "Xã Ia O",
      "Xã Ia Dêr", "Xã Ia Chia", "Xã Ia Pếch", "Xã Ia Sao",
      "Xã Ia Hrung", "Xã Ia Bă", "Xã Ia Krai", "Xã Ia Tơi"
    ]
  },
  {
    id: "ia_pa", name: "H. Ia Pa", type: "district",
    centerLat: 13.4833, centerLon: 108.5500,
    communes: [
      "Xã Ia Pa", "Xã Chư Mố", "Xã Ia Kdăm", "Xã Ia Tul",
      "Xã Ia Broăi", "Xã Ia Trok", "Xã Kim Tân", "Xã Ia Mrơn",
      "Xã Chư Răng", "Xã Pờ Tó"
    ]
  },
  {
    id: "kbang", name: "H. Kbang", type: "district",
    centerLat: 14.2833, centerLon: 108.6000,
    communes: [
      "TT. Kbang", "Xã Đak Roong", "Xã Kon Pne", "Xã Kông Lơng Khơng",
      "Xã Kông Pla", "Xã Krong", "Xã Lơ Ku", "Xã Nghĩa An",
      "Xã Sơ Pai", "Xã Sơn Lang", "Xã Tơ Tung", "Xã Đông",
      "Xã Đak Hlơ", "Xã Đak SMar"
    ]
  },
  {
    id: "kong_chro", name: "H. Kông Chro", type: "district",
    centerLat: 13.7667, centerLon: 108.5667,
    communes: [
      "TT. Kông Chro", "Xã An Trung", "Xã Chơ Long", "Xã Đak Kơ Ning",
      "Xã Đak Pling", "Xã Đak Pơ Pho", "Xã Đak Tơ Pang", "Xã Đak Song",
      "Xã Kông Yang", "Xã SRó", "Xã Yang Nam", "Xã Yang Trung", "Xã Ya Ma"
    ]
  },
  {
    id: "krong_pa", name: "H. Krông Pa", type: "district",
    centerLat: 13.2315, centerLon: 108.6549,
    communes: [
      "TT. Phú Túc", "Xã Chư Gu", "Xã Chư Ngọc", "Xã Chư Rcăm",
      "Xã Đất Bằng", "Xã Ia Hdreh", "Xã Ia Mlá", "Xã Ia Rsai",
      "Xã Ia Rsươm", "Xã Ia Rmok", "Xã Krông Năng", "Xã Phú Cần", "Xã Uar"
    ]
  },
  {
    id: "mang_yang", name: "H. Mang Yang", type: "district",
    centerLat: 13.9667, centerLon: 108.3000,
    communes: [
      "TT. Kon Dơng", "Xã Ayun", "Xã Đak Djrăng", "Xã Đak Jơ Ta",
      "Xã Đak Ta Ley", "Xã Đak Yă", "Xã Hà Ra", "Xã Kon Chiêng",
      "Xã Kon Thụp", "Xã Lơ Pang", "Xã Đê Ar", "Xã Hra"
    ]
  },
  {
    id: "phu_thien", name: "H. Phú Thiện", type: "district",
    centerLat: 13.4333, centerLon: 108.3833,
    communes: [
      "TT. Phú Thiện", "Xã Ayun Hạ", "Xã Chrôh Pơnan", "Xã Chư A Thai",
      "Xã Ia Ake", "Xã Ia Hiao", "Xã Ia Peng", "Xã Ia Piar",
      "Xã Ia Sol", "Xã Ia Yeng"
    ]
  },
];

// --- Helper: Flatten to FlightLocation[] for Autocomplete ---
// Mỗi district tạo 1 entry "trung tâm huyện" + N entries cho từng xã
// Xã sử dụng tọa độ trung tâm huyện (Open-Meteo resolution ~1km, đủ chính xác)
export function flattenLocations(): FlightLocation[] {
  const result: FlightLocation[] = [];
  for (const d of GIA_LAI_DISTRICTS) {
    // District center entry
    result.push({
      id: d.id,
      name: d.name,
      lat: d.centerLat,
      lon: d.centerLon,
      district: d.name,
      isDistrictCenter: true,
    });
    // Commune entries
    for (const commune of d.communes) {
      const slug = commune
        .replace(/^(P\.|TT\.|Xã)\s*/, "")
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d").replace(/Đ/g, "D")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");
      result.push({
        id: `${d.id}__${slug}`,
        name: commune,
        lat: d.centerLat,   // Same as district center (API resolution ~1km)
        lon: d.centerLon,
        district: d.name,
        isDistrictCenter: false,
      });
    }
  }
  return result;
}

// Total: 17 districts, 200 communes/wards/towns
```

> **Ghi chú kỹ thuật:** Open-Meteo API có resolution ~1-11km tùy mô hình. Các xã trong cùng một huyện sử dụng chung tọa độ trung tâm huyện vì sai lệch không đáng kể. LocationSelector sẽ dùng MUI `Autocomplete` với `groupBy={option => option.district}` để nhóm theo huyện.

---

## 5. FLIGHT CONDITION ENGINE

### 5.1 Đánh giá điều kiện bay

Mỗi giờ được đánh giá thành 3 mức:

| Mức | Label | MUI Color | Ý nghĩa |
|---|---|---|---|
| **GO** | "Bay được" | `success` (#4caf50) | Điều kiện tốt, an toàn bay |
| **CAUTION** | "Cẩn thận" | `warning` (#ff9800) | Có thể bay nhưng cần cẩn trọng |
| **NO_GO** | "Không bay" | `error` (#f44336) | Không nên bay |

### 5.2 Ngưỡng mặc định

```typescript
interface FlightThresholds {
  // Wind
  windSpeedGo: number;      // <= 15 km/h -> GO
  windSpeedCaution: number;  // <= 25 km/h -> CAUTION, > 25 -> NO_GO
  windGustMax: number;       // > 35 km/h -> NO_GO bất kể

  // Rain
  precipitationGo: number;   // <= 0.5 mm -> GO
  precipitationMax: number;  // > 2.0 mm -> NO_GO
  precipProbGo: number;      // <= 30% -> GO
  precipProbMax: number;     // > 70% -> NO_GO

  // Cloud
  cloudCoverGo: number;      // <= 50% -> GO
  cloudCoverMax: number;     // > 85% -> NO_GO (ảnh hưởng chất lượng ảnh)

  // Visibility
  visibilityMin: number;     // < 3000m -> NO_GO

  // Humidity
  humidityMax: number;       // > 95% -> CAUTION (sương mù)
}

const DEFAULT_THRESHOLDS: FlightThresholds = {
  windSpeedGo: 15,
  windSpeedCaution: 25,
  windGustMax: 35,
  precipitationGo: 0.5,
  precipitationMax: 2.0,
  precipProbGo: 30,
  precipProbMax: 70,
  cloudCoverGo: 50,
  cloudCoverMax: 85,
  visibilityMin: 3000,
  humidityMax: 95,
};
```

### 5.3 Logic đánh giá (Pseudocode)

```typescript
function evaluateFlightCondition(hourData: HourlyData, thresholds: FlightThresholds): FlightCondition {
  // NO_GO nếu bất kỳ điều kiện nào vi phạm
  if (hourData.windGusts > thresholds.windGustMax) return "NO_GO";
  if (hourData.windSpeed > thresholds.windSpeedCaution) return "NO_GO";
  if (hourData.precipitation > thresholds.precipitationMax) return "NO_GO";
  if (hourData.precipProbability > thresholds.precipProbMax) return "NO_GO";
  if (hourData.visibility < thresholds.visibilityMin) return "NO_GO";
  if (hourData.cloudCover > thresholds.cloudCoverMax) return "NO_GO";

  // CAUTION nếu gần ngưỡng
  if (hourData.windSpeed > thresholds.windSpeedGo) return "CAUTION";
  if (hourData.precipitation > thresholds.precipitationGo) return "CAUTION";
  if (hourData.precipProbability > thresholds.precipProbGo) return "CAUTION";
  if (hourData.cloudCover > thresholds.cloudCoverGo) return "CAUTION";
  if (hourData.humidity > thresholds.humidityMax) return "CAUTION";

  return "GO";
}
```

---

## 6. UI SPECIFICATION

### 6.1 Theme

**Mode:** Dark mode mặc định (dễ nhìn ngoài trời)

```typescript
// src/theme/theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },       // Light blue
    secondary: { main: '#ce93d8' },     // Light purple
    background: {
      default: '#0a1929',              // Deep navy
      paper: '#132f4c',                // Slightly lighter navy
    },
    success: { main: '#66bb6a' },       // Green - GO
    warning: { main: '#ffa726' },       // Orange - CAUTION
    error: { main: '#f44336' },         // Red - NO_GO
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backdropFilter: 'blur(20px)',
        },
      },
    },
  },
});
```

**Google Font:** Import `Inter` in `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

### 6.2 Layout

```
+-----------------------------------------------------+
|  AppHeader                                          |
|  [Logo] VDCD Weather Dashboard   [Settings] [Refresh]|
+-----------------------------------------------------+
|  Location Selector Bar                              |
|  [Location Dropdown: Pleiku] [Date Range] [Refresh] |
+-----------------------------------------------------+
|  Day Summary Cards (horizontal scroll)              |
|  +------+ +------+ +------+ +------+ +------+     |
|  | T2   | | T3   | | T4   | | T5   | | T6   |     |
|  | 18/8 | | 19/8 | | 20/8 | | 21/8 | | 22/8 |     |
|  | 4h GO| | 2h ! | | 6h GO| | 0h X | | 5h GO|     |
|  +------+ +------+ +------+ +------+ +------+     |
+-----------------------------------------------------+
|  Weather Charts (collapsible)                       |
|  [Wind Speed] [Precipitation] [Cloud Cover]         |
+-----------------------------------------------------+
|  Hourly Forecast Table                              |
|  +----+------+-----+------+-----+----+------+      |
|  |Gio | Tinh | Gio | Mua  | May | Am | Danh |      |
|  |    | trang|km/h |  mm  |  %  |  % | gia  |      |
|  +----+------+-----+------+-----+----+------+      |
|  |06h | Sun  | 8   | 0.0  | 20  | 75 | GO   |      |
|  |07h | Sun  | 12  | 0.0  | 35  | 70 | GO   |      |
|  |08h | Cloud| 18  | 0.2  | 55  | 68 | CAUT |      |
|  |...                                               |
|  +--------------------------------------------------+
+-----------------------------------------------------+
|  Footer: Auto-refresh in 28:45  | [Export Excel]    |
+-----------------------------------------------------+
```

### 6.3 Component Specifications

#### `AppHeader.tsx`
- **MUI:** `AppBar`, `Toolbar`, `Typography`, `IconButton`
- **Props:** `onSettingsOpen: () => void`, `onRefresh: () => void`, `lastUpdated: Date | null`
- **Behavior:** Hiển thị tên app, nút settings (mở dialog ThresholdSettings), nút refresh, thời gian cập nhật cuối

#### `LocationSelector.tsx`
- **MUI:** `Autocomplete`, `TextField`, `Chip`
- **Props:** `locations: FlightLocation[]`, `selected: FlightLocation`, `onChange: (loc: FlightLocation) => void`
- **Behavior:** Dropdown tìm kiếm + chọn địa điểm. Hiển thị tọa độ bên dưới. Hỗ trợ "Custom" để nhập lat/lon thủ công.

#### `DaySummaryCard.tsx`
- **MUI:** `Card`, `CardContent`, `Typography`, `Chip`, `Box`
- **Props:** `date: string`, `flyableHours: number`, `bestTimeSlot: string`, `overallCondition: FlightCondition`, `isSelected: boolean`, `onClick: () => void`
- **Behavior:**
  - Card hiển thị ngày, số giờ bay được, khung giờ tốt nhất
  - Border color theo overallCondition (success/warning/error)
  - Click để filter bảng bên dưới theo ngày đó
  - `isSelected` -> border dày + glow effect

#### `WeatherTable.tsx`
- **MUI:** `Table`, `TableHead`, `TableBody`, `TableRow`, `TableCell`, `TableContainer`, `Paper`
- **Props:** `data: HourlyForecastData[]`, `thresholds: FlightThresholds`, `selectedDate: string | null`
- **Behavior:**
  - Hiển thị dữ liệu theo giờ cho ngày được chọn (hoặc tất cả nếu không chọn)
  - Mỗi row có background color nhạt theo condition (GO=green tint, CAUTION=orange tint, NO_GO=red tint)
  - Sticky header
  - Highlight giờ hiện tại
  - **Cột:** Giờ | Thời tiết | Nhiệt độ | Gió (km/h) | Gió giật | Mưa (mm) | XS Mưa (%) | Mây (%) | Tầm nhìn | Đánh giá

#### `FlightConditionChip.tsx`
- **MUI:** `Chip`
- **Props:** `condition: "GO" | "CAUTION" | "NO_GO"`
- **Behavior:**
  - GO -> `<Chip color="success" label="Bay được" icon={<CheckCircle/>} />`
  - CAUTION -> `<Chip color="warning" label="Cẩn thận" icon={<Warning/>} />`
  - NO_GO -> `<Chip color="error" label="Không bay" icon={<Cancel/>} />`

#### `WeatherChart.tsx`
- **Library:** Recharts (`AreaChart`, `BarChart`, `LineChart`)
- **Props:** `data: HourlyForecastData[]`, `selectedDate: string | null`
- **Behavior:**
  - 3 chart tabs: Gió | Mưa | Mây
  - Gió: AreaChart, fill gradient, reference line ở ngưỡng 15 và 25 km/h
  - Mưa: BarChart, bars color-coded
  - Mây: AreaChart, fill gray gradient
  - Tooltip hiển thị chi tiết
  - Responsive, co giãn theo container

#### `ThresholdSettings.tsx`
- **MUI:** `Dialog`, `DialogTitle`, `DialogContent`, `DialogActions`, `Slider`, `TextField`, `Button`, `Switch`
- **Props:** `open: boolean`, `thresholds: FlightThresholds`, `onSave: (t: FlightThresholds) => void`, `onClose: () => void`
- **Behavior:**
  - Dialog modal chỉnh các ngưỡng bay
  - Slider cho mỗi ngưỡng (wind, rain, cloud, visibility)
  - Nút "Reset về mặc định"
  - Lưu vào `localStorage` key `"flight_thresholds"`
  - Toggle dark/light mode

---

## 7. DATA FLOW

```
+---------------+     GET request      +-----------------+
|   Browser     | ------------------->  |  Open-Meteo API |
|  (React App)  | <-------------------  |  (Free, no key) |
|               |     JSON response    +-----------------+
|               |
|  +------------+-----------+
|  | useWeatherData hook    |
|  | - fetch + parse        |
|  | - evaluate conditions  |
|  | - cache in state       |
|  +------------+-----------+
|               |
|  +------------+-----------+
|  | App.tsx (state hub)    |
|  | - selectedLocation     |
|  | - selectedDate         |
|  | - thresholds           |
|  | - weatherData          |
|  +------------+-----------+
|               |
|  +--------+---+----+----------+
|  |Cards   |Table   |Charts    |
|  |Summary |Hourly  |Wind/Rain |
|  +--------+--------+----------+
+-----------------------------+
```

### 7.1 Custom Hooks

#### `useWeatherData(location: FlightLocation, forecastDays: number)`
```typescript
interface UseWeatherDataReturn {
  data: HourlyForecastData[] | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refetch: () => void;
}
```
- Gọi Open-Meteo API khi `location` thay đổi
- Parse response -> array of `HourlyForecastData`
- Auto-refetch mỗi 30 phút (configurable)
- Error handling: retry 3 lần, exponential backoff

#### `useAutoRefresh(callback: () => void, intervalMs: number)`
- Gọi `callback` mỗi `intervalMs` ms
- Hiển thị countdown timer ở footer
- Pause khi tab không active (visibility API)

---

## 8. TYPESCRIPT TYPES

```typescript
// src/types/weather.ts

export type FlightCondition = "GO" | "CAUTION" | "NO_GO";

export interface FlightLocation {
  id: string;
  name: string;
  lat: number;
  lon: number;
  district: string;
}

export interface HourlyForecastData {
  time: string;          // ISO 8601
  dateStr: string;       // "2026-08-18"
  hourStr: string;       // "06:00"
  hour: number;          // 6
  temperature: number;
  humidity: number;
  precipitation: number;
  precipProbability: number;
  cloudCover: number;
  windSpeed: number;
  windGusts: number;
  visibility: number;
  weatherCode: number;
  condition: FlightCondition;  // Computed
}

export interface DaySummary {
  date: string;
  dayOfWeek: string;     // "T2", "T3", ...
  flyableHours: number;
  cautionHours: number;
  noGoHours: number;
  bestTimeSlot: string;  // "06:00-10:00"
  overallCondition: FlightCondition;
  avgWindSpeed: number;
  totalPrecipitation: number;
  avgCloudCover: number;
}

export interface FlightThresholds {
  windSpeedGo: number;
  windSpeedCaution: number;
  windGustMax: number;
  precipitationGo: number;
  precipitationMax: number;
  precipProbGo: number;
  precipProbMax: number;
  cloudCoverGo: number;
  cloudCoverMax: number;
  visibilityMin: number;
  humidityMax: number;
}
```

---

## 9. FILE-BY-FILE IMPLEMENTATION GUIDE

### 9.1 `src/api/openMeteoApi.ts`
- Export `fetchWeatherForecast(lat, lon, days)` -> `Promise<OpenMeteoResponse>`
- Build URL with all hourly params from Section 3
- Parse JSON response
- No external HTTP library — use native `fetch()`

### 9.2 `src/utils/flightCondition.ts`
- Export `evaluateFlightCondition(hourData, thresholds)` -> `FlightCondition`
- Export `computeDaySummaries(hourlyData, thresholds)` -> `DaySummary[]`
- Export `findBestTimeSlot(hours)` -> `string` (tìm chuỗi giờ GO liên tiếp dài nhất)
- Export `DEFAULT_THRESHOLDS`
- Logic chính xác như Section 5.3

### 9.3 `src/utils/locations.ts`
- Export `GIA_LAI_LOCATIONS` — data từ Section 4
- Export `getLocationById(id)` -> `FlightLocation`

### 9.4 `src/utils/formatters.ts`
- `formatHour(isoString)` -> "06:00"
- `formatDate(isoString)` -> "18/08"
- `formatDayOfWeek(isoString)` -> "T2" (Thứ 2)
- `formatWindSpeed(speed)` -> "15 km/h"
- `formatPrecipitation(mm)` -> "0.5 mm"

### 9.5 `src/hooks/useWeatherData.ts`
- Sử dụng `useState`, `useEffect`, `useCallback`
- Gọi `fetchWeatherForecast` -> transform -> set state
- Auto-refresh logic

### 9.6 `src/theme/theme.ts`
- MUI `createTheme` với dark mode palette từ Section 6.1

### 9.7 Components
- Implement theo spec trong Section 6.3
- Mọi component dùng MUI components, KHÔNG dùng HTML/CSS thuần
- Responsive: sử dụng MUI `Grid`, `Stack`, `useMediaQuery`

### 9.8 `src/App.tsx`
- State management cho: `selectedLocation`, `selectedDate`, `thresholds`, `settingsOpen`
- Pass data xuống components
- Layout theo Section 6.2

### 9.9 `src/main.tsx`
- `ThemeProvider` wrap toàn bộ app
- `CssBaseline` cho consistent styling

---

## 10. PYTHON EXCEL EXPORT

### 10.1 File: `services/weather_excel_export.py`

**Chạy:**
```bash
python -m services.weather_excel_export --location pleiku --days 7 --output weather_forecast.xlsx
```

**Chức năng:**
1. Gọi Open-Meteo API (dùng `urllib.request` — no external deps)
2. Tạo Excel workbook với openpyxl:
   - Sheet cho mỗi ngày
   - Header: Ngày, Địa điểm, Tọa độ
   - Bảng theo giờ: Giờ | Thời tiết | Nhiệt độ | Gió | Mưa | Mây | Đánh giá
3. Conditional formatting:
   - GO cells -> Green fill (#C6EFCE)
   - CAUTION cells -> Yellow fill (#FFEB9C)
   - NO_GO cells -> Red fill (#FFC7CE)
4. Summary sheet: Tổng hợp các ngày, số giờ bay, khung giờ tốt nhất

### 10.2 File: `services/weather_service.py`

Module shared logic:
- `fetch_forecast(lat, lon, days=7)` -> dict
- `evaluate_condition(hour_data, thresholds=None)` -> "GO" / "CAUTION" / "NO_GO"
- `LOCATIONS` dict — same data as frontend
- `DEFAULT_THRESHOLDS` dict — same values as frontend

---

## 11. RESPONSIVE DESIGN

| Breakpoint | Layout |
|---|---|
| Desktop (>=1200px) | Full layout, charts bên cạnh table |
| Tablet (>=600px) | Stacked, cards scrollable horizontal |
| Mobile (<600px) | Single column, cards stacked, table horizontal scroll |

Sử dụng MUI `useMediaQuery` và `Grid` responsive props:
```tsx
<Grid container spacing={2}>
  <Grid item xs={12} md={8}>{/* Table */}</Grid>
  <Grid item xs={12} md={4}>{/* Charts */}</Grid>
</Grid>
```

---

## 12. LOCAL STORAGE

| Key | Value | Purpose |
|---|---|---|
| `flight_thresholds` | JSON FlightThresholds | Ngưỡng bay tuỳ chỉnh |
| `selected_location_id` | string | Địa điểm đã chọn |
| `theme_mode` | `"dark"` or `"light"` | Theme preference |
| `forecast_days` | number | Số ngày dự báo (7 hoặc 14) |

---

## 13. ERROR HANDLING

- **Network error:** Hiển thị `Snackbar` với `Alert` severity="error", nút retry
- **API rate limit:** Unlikely với Open-Meteo, nhưng handle 429 -> wait + retry
- **No data:** Hiển thị empty state với icon + message
- **Offline:** Detect với `navigator.onLine`, hiển thị banner

---

## 14. ACCEPTANCE CRITERIA

- [ ] Dashboard load được dữ liệu cho Pleiku (Gia Lai) mặc định
- [ ] Chọn được địa điểm khác trong danh sách 12 huyện/thị
- [ ] Bảng hiển thị đúng theo giờ VN (GMT+7)
- [ ] Color coding GO/CAUTION/NO_GO chính xác theo ngưỡng
- [ ] Day summary cards hiển thị số giờ bay được + khung giờ tốt nhất
- [ ] Charts hiển thị gió, mưa, mây
- [ ] Settings dialog cho phép chỉnh ngưỡng + lưu localStorage
- [ ] Auto-refresh mỗi 30 phút
- [ ] Responsive trên mobile
- [ ] Python script xuất Excel thành công
- [ ] Excel có conditional formatting đúng màu
- [ ] `pnpm run build` thành công không lỗi
