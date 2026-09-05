/**
 * Export Daily Flight Planner 7-Day Matrix to Microsoft Excel (.xls XML SpreadsheetML)
 * Tab: "Tổng quan" (Daily Overview Matrix)
 * Professional Design & Color System
 */

import type { DistrictWeatherData, FlightThresholds, FlightCondition } from "../types/weather";
import { GIA_LAI_DISTRICTS } from "./locations";

function escapeXml(str: string | number | null | undefined): string {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateDailyExcelStyles(): string {
  return `
  <Styles>
    <!-- Default / Base Style -->
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Center"/>
      <Borders/>
      <Font ss:FontName="Segoe UI" ss:Size="9.5" ss:Color="#2D3748"/>
      <Interior/>
      <NumberFormat/>
      <Protection/>
    </Style>

    <!-- Main Title Banner -->
    <Style ss:ID="MainTitle">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Font ss:FontName="Segoe UI" ss:Size="13" ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#1A365D" ss:Pattern="Solid"/>
    </Style>

    <!-- Subtitle Banner -->
    <Style ss:ID="SubTitle">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Font ss:FontName="Segoe UI" ss:Size="9.5" ss:Italic="1" ss:Color="#E2E8F0"/>
      <Interior ss:Color="#2B6CB0" ss:Pattern="Solid"/>
    </Style>

    <!-- Metadata Block -->
    <Style ss:ID="MetaLabel">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
      </Borders>
      <Font ss:FontName="Segoe UI" ss:Size="9" ss:Bold="1" ss:Color="#4A5568"/>
      <Interior ss:Color="#F7FAFC" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="MetaVal">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
      </Borders>
      <Font ss:FontName="Segoe UI" ss:Size="9" ss:Color="#1A202C"/>
      <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
    </Style>

    <!-- Level 1 Table Header (Dates & Category Groups) -->
    <Style ss:ID="TableHeaderL1">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#2B6CB0"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#2B6CB0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#4299E1"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#4299E1"/>
      </Borders>
      <Font ss:FontName="Segoe UI" ss:Size="9.5" ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#2B6CB0" ss:Pattern="Solid"/>
    </Style>

    <!-- Level 2 Table Header (Sáng / Chiều Sub-headers) -->
    <Style ss:ID="TableHeaderL2">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#2B6CB0"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
      </Borders>
      <Font ss:FontName="Segoe UI" ss:Size="9" ss:Bold="1" ss:Color="#2D3748"/>
      <Interior ss:Color="#EDF2F7" ss:Pattern="Solid"/>
    </Style>

    <!-- Region Group Section Headers -->
    <Style ss:ID="RegionHeaderGL">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#90CAF9"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#90CAF9"/>
      </Borders>
      <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#0D47A1"/>
      <Interior ss:Color="#E3F2FD" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="RegionHeaderBD">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#A5D6A7"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#A5D6A7"/>
      </Borders>
      <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#1B5E20"/>
      <Interior ss:Color="#E8F5E9" ss:Pattern="Solid"/>
    </Style>

    <!-- Professional Soft Palette for Matrix Cells -->
    <!-- GO: Soft Mint Green with Dark Green text -->
    <Style ss:ID="CellGo">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
      </Borders>
      <Font ss:FontName="Segoe UI" ss:Size="9.5" ss:Bold="1" ss:Color="#1C4924"/>
      <Interior ss:Color="#C6F6D5" ss:Pattern="Solid"/>
    </Style>

    <!-- CAUTION: Soft Warm Amber with Dark Amber text -->
    <Style ss:ID="CellCaution">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
      </Borders>
      <Font ss:FontName="Segoe UI" ss:Size="9.5" ss:Bold="1" ss:Color="#7B341E"/>
      <Interior ss:Color="#FEEBC8" ss:Pattern="Solid"/>
    </Style>

    <!-- NO_GO: Soft Light Rose with Subtle Red text -->
    <Style ss:ID="CellNoGo">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
      </Borders>
      <Font ss:FontName="Segoe UI" ss:Size="9.5" ss:Bold="1" ss:Color="#9B2C2C"/>
      <Interior ss:Color="#FED7D7" ss:Pattern="Solid"/>
    </Style>

    <!-- Neutral Table Cells -->
    <Style ss:ID="CellNormal">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
      </Borders>
      <Font ss:FontName="Segoe UI" ss:Size="9" ss:Color="#2D3748"/>
    </Style>
    <Style ss:ID="CellCenter">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
      </Borders>
      <Font ss:FontName="Segoe UI" ss:Size="9" ss:Color="#2D3748"/>
    </Style>
    <Style ss:ID="CellNumber">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
      </Borders>
      <Font ss:FontName="Segoe UI" ss:Size="9" ss:Color="#2D3748"/>
      <NumberFormat ss:Format="#,##0.0"/>
    </Style>
    <Style ss:ID="CellWrap">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center" ss:WrapText="1"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
      </Borders>
      <Font ss:FontName="Segoe UI" ss:Size="8.5" ss:Color="#2D3748"/>
    </Style>

    <!-- Regional Subtotal Row -->
    <Style ss:ID="CellTotal">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#2B6CB0"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
      </Borders>
      <Font ss:FontName="Segoe UI" ss:Size="9" ss:Bold="1" ss:Color="#1A365D"/>
      <Interior ss:Color="#EDF2F7" ss:Pattern="Solid"/>
    </Style>

    <!-- Legend Cell Styles -->
    <Style ss:ID="LegendVal">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Font ss:FontName="Segoe UI" ss:Size="9" ss:Color="#4A5568"/>
    </Style>
  </Styles>
  `;
}

/**
 * Generate Sheet 1: 7-Day Matrix Overview with 2-Tier Header & Elegant Soft Colors
 */
function generateDailyMatrixWorksheetXml(
  data: Map<string, DistrictWeatherData>,
  thresholds?: FlightThresholds
): string {
  // Extract unique dates from first available district
  let dates: { date: string; dayOfWeek: string }[] = [];
  for (const dwd of data.values()) {
    dates = dwd.daySummaries.map((s) => ({ date: s.date, dayOfWeek: s.dayOfWeek }));
    break;
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const totalCols = 3 + dates.length * 2 + 3; // 20 columns
  const mergeSpan = totalCols - 1;

  const giaLaiDistricts = GIA_LAI_DISTRICTS.filter((d) => d.region === "gia_lai");
  const binhDinhDistricts = GIA_LAI_DISTRICTS.filter((d) => d.region === "binh_dinh");

  const regions = [
    {
      id: "gia_lai",
      label: "KHU VỰC GIA LAI (17 ĐƠN VỊ HÀNH CHÍNH)",
      style: "RegionHeaderGL",
      districts: giaLaiDistricts,
    },
    {
      id: "binh_dinh",
      label: "KHU VỰC BÌNH ĐỊNH (11 ĐƠN VỊ HÀNH CHÍNH)",
      style: "RegionHeaderBD",
      districts: binhDinhDistricts,
    },
  ];

  return `
  <Worksheet ss:Name="Ke hoach 7 ngay">
    <Table ss:DefaultRowHeight="24">
      <Column ss:Width="90"/>  <!-- STT -->
      <Column ss:Width="150"/> <!-- Huyện/Thị xã/TP -->
      <Column ss:Width="95"/>  <!-- Tỉnh/Khu vực -->
      <!-- 14 Columns for 7 Days (Morning / Afternoon) -->
      ${dates.map(() => `<Column ss:Width="65"/>\n      <Column ss:Width="65"/>`).join("\n      ")}
      <Column ss:Width="95"/>  <!-- Tổng giờ bay 7 ngày -->
      <Column ss:Width="105"/> <!-- Số ca bay được -->
      <Column ss:Width="130"/> <!-- Đánh giá chung -->

      <!-- Title & Header Banner -->
      <Row ss:Height="28">
        <Cell ss:MergeAcross="${mergeSpan}" ss:StyleID="MainTitle">
          <Data ss:Type="String">BẢNG TỔNG HỢP KẾ HOẠCH ĐIỀU KIỆN BAY THEO THỜI TIẾT 7 NGÀY TỚI</Data>
        </Cell>
      </Row>
      <Row ss:Height="20">
        <Cell ss:MergeAcross="${mergeSpan}" ss:StyleID="SubTitle">
          <Data ss:Type="String">HỆ THỐNG DỰ BÁO &amp; LẬP KẾ HOẠCH KHẢO SÁT - 28 ĐỊA BÀN</Data>
        </Cell>
      </Row>
      <Row ss:Height="6"/>

      <!-- Metadata & Info Box -->
      <Row ss:Height="20">
        <Cell ss:StyleID="MetaLabel"><Data ss:Type="String">Thời gian xuất:</Data></Cell>
        <Cell ss:MergeAcross="1" ss:StyleID="MetaVal"><Data ss:Type="String">${escapeXml(dateStr)}</Data></Cell>
        <Cell ss:StyleID="MetaLabel"><Data ss:Type="String">Nguồn dự báo:</Data></Cell>
        <Cell ss:MergeAcross="2" ss:StyleID="MetaVal"><Data ss:Type="String">Open-Meteo Hourly Forecast API (7 ngày)</Data></Cell>
        <Cell ss:StyleID="MetaLabel"><Data ss:Type="String">Tiêu chuẩn:</Data></Cell>
        <Cell ss:MergeAcross="${mergeSpan - 7}" ss:StyleID="MetaVal">
          <Data ss:Type="String">Gió &lt;= ${thresholds?.windSpeedGo ?? 20}km/h (Cảnh báo &lt;= ${thresholds?.windSpeedCaution ?? 28}km/h), Mưa &lt;= ${thresholds?.precipitationGo ?? 0.5}mm</Data>
        </Cell>
      </Row>

      <!-- Legend Explanation Block -->
      <Row ss:Height="22">
        <Cell ss:StyleID="CellGo"><Data ss:Type="String">6h / 3h</Data></Cell>
        <Cell ss:MergeAcross="3" ss:StyleID="LegendVal"><Data ss:Type="String">BAY ĐƯỢC • Thời tiết thuận lợi</Data></Cell>
        <Cell ss:StyleID="CellCaution"><Data ss:Type="String">2h / 1h</Data></Cell>
        <Cell ss:MergeAcross="4" ss:StyleID="LegendVal"><Data ss:Type="String">CẨN TRỌNG• Gió mạnh / nguy cơ mưa rào</Data></Cell>
        <Cell ss:StyleID="CellNoGo"><Data ss:Type="String">✕</Data></Cell>
        <Cell ss:MergeAcross="${mergeSpan - 11}" ss:StyleID="LegendVal"><Data ss:Type="String">KHÔNG BAY • Mưa / dông bão / gió giật</Data></Cell>
      </Row>
      <Row ss:Height="8"/>

      <!-- 2-Tier Table Header: Row 1 (Categories & Dates) -->
      <Row ss:Height="24">
        <Cell ss:StyleID="TableHeaderL1"><Data ss:Type="String">STT</Data></Cell>
        <Cell ss:StyleID="TableHeaderL1"><Data ss:Type="String">Địa bàn (Huyện/TX/TP)</Data></Cell>
        <Cell ss:StyleID="TableHeaderL1"><Data ss:Type="String">Khu vực</Data></Cell>
        ${dates
      .map((d, idx) => {
        const dayLabel = idx === 0 ? "HÔM NAY" : d.dayOfWeek;
        const dateShort = d.date.substring(5).replace("-", "/");
        return `<Cell ss:MergeAcross="1" ss:StyleID="TableHeaderL1"><Data ss:Type="String">${escapeXml(dayLabel)} (${escapeXml(dateShort)})</Data></Cell>`;
      })
      .join("\n        ")}
        <Cell ss:StyleID="TableHeaderL1"><Data ss:Type="String">Tổng giờ bay</Data></Cell>
        <Cell ss:StyleID="TableHeaderL1"><Data ss:Type="String">Số ca GO</Data></Cell>
        <Cell ss:StyleID="TableHeaderL1"><Data ss:Type="String">Đánh giá chung</Data></Cell>
      </Row>

      <!-- 2-Tier Table Header: Row 2 (Sub-headers for Sessions) -->
      <Row ss:Height="22">
        <Cell ss:StyleID="TableHeaderL2"><Data ss:Type="String">#</Data></Cell>
        <Cell ss:StyleID="TableHeaderL2"><Data ss:Type="String">Đơn vị hành chính</Data></Cell>
        <Cell ss:StyleID="TableHeaderL2"><Data ss:Type="String">Tỉnh</Data></Cell>
        ${dates
      .map(
        () =>
          `<Cell ss:StyleID="TableHeaderL2"><Data ss:Type="String">Sáng (06-12h)</Data></Cell>\n        <Cell ss:StyleID="TableHeaderL2"><Data ss:Type="String">Chiều (12-18h)</Data></Cell>`
      )
      .join("\n        ")}
        <Cell ss:StyleID="TableHeaderL2"><Data ss:Type="String">(7 ngày)</Data></Cell>
        <Cell ss:StyleID="TableHeaderL2"><Data ss:Type="String">(/14 ca)</Data></Cell>
        <Cell ss:StyleID="TableHeaderL2"><Data ss:Type="String">toàn tuần</Data></Cell>
      </Row>

      <!-- Table Rows Grouped by Region -->
      ${regions
      .map((region) => {
        const rows = region.districts
          .map((district, dIdx) => {
            const dwd = data.get(district.id);
            let totalGoHours = 0;
            let goSessionsCount = 0;
            let totalSessions = 0;

            const sessionCells = dates
              .map((d) => {
                const daySummary = dwd?.daySummaries.find((s) => s.date === d.date);
                if (!daySummary) {
                  return `<Cell ss:StyleID="CellCenter"><Data ss:Type="String">-</Data></Cell>\n        <Cell ss:StyleID="CellCenter"><Data ss:Type="String">-</Data></Cell>`;
                }

                totalSessions += 2;
                if (daySummary.morning.condition === "GO") goSessionsCount++;
                if (daySummary.afternoon.condition === "GO") goSessionsCount++;
                totalGoHours += daySummary.morning.goHours + daySummary.afternoon.goHours;

                const getCellStyle = (cond: FlightCondition) =>
                  cond === "GO" ? "CellGo" : cond === "CAUTION" ? "CellCaution" : "CellNoGo";

                const getCellContent = (goHours: number, cond: FlightCondition) =>
                  cond === "NO_GO" ? "✕" : `${goHours}h`;

                const mStyle = getCellStyle(daySummary.morning.condition);
                const aStyle = getCellStyle(daySummary.afternoon.condition);
                const mText = getCellContent(daySummary.morning.goHours, daySummary.morning.condition);
                const aText = getCellContent(daySummary.afternoon.goHours, daySummary.afternoon.condition);

                return `<Cell ss:StyleID="${mStyle}"><Data ss:Type="String">${escapeXml(mText)}</Data></Cell>\n        <Cell ss:StyleID="${aStyle}"><Data ss:Type="String">${escapeXml(aText)}</Data></Cell>`;
              })
              .join("\n        ");

            const generalEvaluation =
              totalGoHours >= 28
                ? "Rất thuận lợi"
                : totalGoHours >= 14
                  ? "Khá thuận lợi"
                  : totalGoHours >= 7
                    ? "Cần chọn lọc ca"
                    : "Mưa gió nhiều";

            return `
      <Row ss:Height="24">
        <Cell ss:StyleID="CellCenter"><Data ss:Type="Number">${dIdx + 1}</Data></Cell>
        <Cell ss:StyleID="CellNormal"><Data ss:Type="String">${escapeXml(district.name)}</Data></Cell>
        <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${escapeXml(district.region === "gia_lai" ? "Gia Lai" : "Bình Định")}</Data></Cell>
        ${sessionCells}
        <Cell ss:StyleID="CellNumber"><Data ss:Type="Number">${totalGoHours}</Data></Cell>
        <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${goSessionsCount}/${totalSessions} ca</Data></Cell>
        <Cell ss:StyleID="CellNormal"><Data ss:Type="String">${escapeXml(generalEvaluation)}</Data></Cell>
      </Row>`;
          })
          .join("");

        // Calculate regional averages for each session
        const avgSessionCells = dates
          .map((d) => {
            let mSum = 0;
            let aSum = 0;
            let count = 0;

            for (const district of region.districts) {
              const dwd = data.get(district.id);
              const ds = dwd?.daySummaries.find((s) => s.date === d.date);
              if (ds) {
                mSum += ds.morning.goHours;
                aSum += ds.afternoon.goHours;
                count++;
              }
            }

            const mAvg = count > 0 ? (mSum / count).toFixed(1) : "0.0";
            const aAvg = count > 0 ? (aSum / count).toFixed(1) : "0.0";
            return `<Cell ss:StyleID="CellTotal"><Data ss:Type="String">${mAvg}h</Data></Cell>\n        <Cell ss:StyleID="CellTotal"><Data ss:Type="String">${aAvg}h</Data></Cell>`;
          })
          .join("\n        ");

        return `
      <!-- Section Header -->
      <Row ss:Height="26">
        <Cell ss:MergeAcross="${mergeSpan}" ss:StyleID="${region.style}">
          <Data ss:Type="String">${escapeXml(region.label)}</Data>
        </Cell>
      </Row>
      ${rows}
      <!-- Regional Subtotal -->
      <Row ss:Height="24">
        <Cell ss:MergeAcross="2" ss:StyleID="CellTotal"><Data ss:Type="String">TRUNG BÌNH GIỜ BAY ${escapeXml(region.id === "gia_lai" ? "GIA LAI" : "BÌNH ĐỊNH")}</Data></Cell>
        ${avgSessionCells}
        <Cell ss:MergeAcross="2" ss:StyleID="CellTotal"><Data ss:Type="String">Theo ca Sáng / Chiều</Data></Cell>
      </Row>`;
      })
      .join("")}

      <Row ss:Height="12"/>

      <!-- Operational Dispatch Guidelines -->
      <Row ss:Height="22">
        <Cell ss:MergeAcross="${mergeSpan}" ss:StyleID="SubTitle">
          <Data ss:Type="String">HƯỚNG DẪN:</Data>
        </Cell>
      </Row>
      <Row ss:Height="22">
        <Cell ss:MergeAcross="${mergeSpan}" ss:StyleID="CellNormal">
          <Data ss:Type="String">1. Ca Sáng (06h - 12h): Vận tốc gió êm dịu và bức xạ mặt trời tối ưu, ưu tiên thực hiện các tuyến bay 3D độ phân giải cao.</Data>
        </Cell>
      </Row>
      <Row ss:Height="22">
        <Cell ss:MergeAcross="${mergeSpan}" ss:StyleID="CellNormal">
          <Data ss:Type="String">2. Ca Chiều (12h - 18h): Thường phát triển mây đối lưu và dông nhiệt (đặc biệt tại Gia Lai), cần theo dõi sát radar thời tiết trước khi cất cánh.</Data>
        </Cell>
      </Row>
      <Row ss:Height="22">
        <Cell ss:MergeAcross="${mergeSpan}" ss:StyleID="CellNormal">
          <Data ss:Type="String">3. Khi gặp ô màu Đỏ (✕) hoặc Cam: Nghiêm cấm bay tầm xa ngoài tầm nhìn (BVLOS).</Data>
        </Cell>
      </Row>
    </Table>
  </Worksheet>
  `;
}

/**
 * Main Export Function: Export 7-Day Overview Matrix Tab to XML Excel (.xls)
 * Contains ONLY the 7-day matrix worksheet as requested.
 */
export function exportDailyOverviewMatrixToExcel(
  data: Map<string, DistrictWeatherData>,
  thresholds?: FlightThresholds
) {
  if (!data || data.size === 0) {
    alert("Chưa có dữ liệu thời tiết 7 ngày để xuất Excel. Vui lòng chờ tải xong dữ liệu.");
    return;
  }

  const matrixSheetXml = generateDailyMatrixWorksheetXml(data, thresholds);

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
  ${generateDailyExcelStyles()}
  ${matrixSheetXml}
</Workbook>`;

  const todayStr = new Date().toISOString().substring(0, 10).replace(/-/g, "");
  const blob = new Blob([xmlContent], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Ke_hoach_lich_bay_7_ngay_VDCD_${todayStr}.xls`;
  link.click();
  URL.revokeObjectURL(url);
}

