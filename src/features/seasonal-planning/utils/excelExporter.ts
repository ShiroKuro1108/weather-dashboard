import type { LocationMonthlyReport } from "../types/seasonalTypes";

/**
 * Escape XML special characters
 */
function escapeXml(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return "";
  return String(val)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Clean sheet name for Excel (max 31 chars, no invalid characters)
 */
function sanitizeSheetName(name: string): string {
  return name.replace(/[\\/?*[\]:]/g, "").trim().substring(0, 30);
}

/**
 * Shorten season label for summary tables so it never overflows
 */
function getShortSeasonLabel(seasonName: string, rainMm: number): string {
  if (seasonName.includes("bão") || rainMm >= 200) return `${rainMm} mm (Mưa bão)`;
  if (seasonName.includes("mưa") || rainMm >= 90) return `${rainMm} mm (Mùa mưa)`;
  if (seasonName.includes("Giao mùa")) return `${rainMm} mm (Giao mùa)`;
  return `${rainMm} mm (Mùa khô)`;
}

/**
 * Generate XML Styles block for Excel
 */
function generateExcelStyles(): string {
  return `
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Center"/>
      <Borders/>
      <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#000000"/>
      <Interior/>
      <NumberFormat/>
      <Protection/>
    </Style>
    <Style ss:ID="MainTitle">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Font ss:FontName="Segoe UI" ss:Size="14" ss:Bold="1" ss:Color="#1A365D"/>
    </Style>
    <Style ss:ID="SubTitle">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Font ss:FontName="Segoe UI" ss:Size="11" ss:Bold="1" ss:Color="#2B6CB0"/>
    </Style>
    <Style ss:ID="MetaLabel">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#4A5568"/>
    </Style>
    <Style ss:ID="MetaVal">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#1A202C"/>
    </Style>
    <Style ss:ID="TableHeader">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
      </Borders>
      <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#2B6CB0" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="CellNormal">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center" ss:WrapText="1"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
      </Borders>
      <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#2D3748"/>
    </Style>
    <Style ss:ID="CellCenter">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
      </Borders>
      <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#2D3748"/>
    </Style>
    <Style ss:ID="CellNumber">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
      </Borders>
      <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#2D3748"/>
    </Style>
    <Style ss:ID="CellDry">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
      </Borders>
      <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#22543D"/>
      <Interior ss:Color="#C6F6D5" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="CellRain">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
      </Borders>
      <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#2B6CB0"/>
      <Interior ss:Color="#BEE3F8" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="CellStorm">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
      </Borders>
      <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#9B2C2C"/>
      <Interior ss:Color="#FED7D7" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="CellTransition">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
      </Borders>
      <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#234E52"/>
      <Interior ss:Color="#B2F5EA" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="CellTotal">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#2B6CB0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
      </Borders>
      <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#1A365D"/>
      <Interior ss:Color="#EDF2F7" ss:Pattern="Solid"/>
    </Style>
  </Styles>
  `;
}

/**
 * Generate XML Worksheet for a single district with spacious formatting
 */
function generateDistrictWorksheetXml(report: LocationMonthlyReport, sheetName?: string): string {
  const name = sanitizeSheetName(sheetName || report.location.name);
  const now = new Date();
  const dateStr = now.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const totalDryDays = Math.round(report.monthlyStats.reduce((s, m) => s + m.dryDaysCount, 0));
  const totalWU = Math.round(report.monthlyStats.reduce((s, m) => s + m.estimatedWU, 0));
  const avgTempYear = Math.round((report.monthlyStats.reduce((s, m) => s + m.avgTemp, 0) / 12) * 10) / 10;
  const avgWindYear = Math.round((report.monthlyStats.reduce((s, m) => s + m.avgWindSpeed, 0) / 12) * 10) / 10;
  const avgSunYear = Math.round((report.monthlyStats.reduce((s, m) => s + m.avgSunshineHours, 0) / 12) * 10) / 10;

  return `
  <Worksheet ss:Name="${escapeXml(name)}">
    <Table ss:DefaultRowHeight="26">
      <!-- Spacious, explicit column widths -->
      <Column ss:Width="80"/>  <!-- Tháng -->
      <Column ss:Width="130"/> <!-- Đặc trưng mùa vụ -->
      <Column ss:Width="110"/> <!-- Nhiệt độ TB -->
      <Column ss:Width="120"/> <!-- Dải Min - Max -->
      <Column ss:Width="120"/> <!-- Lượng mưa mm -->
      <Column ss:Width="105"/> <!-- Số ngày mưa -->
      <Column ss:Width="110"/> <!-- Số ngày khô ráo -->
      <Column ss:Width="110"/> <!-- Gió TB -->
      <Column ss:Width="115"/> <!-- Gió giật -->
      <Column ss:Width="115"/> <!-- Giờ nắng/ngày -->
      <Column ss:Width="360"/> <!-- Nhận định thời tiết & Bay -->
      <Column ss:Width="175"/> <!-- Khuyến nghị chế độ bay -->
      <Column ss:Width="115"/> <!-- Sản lượng WU -->

      <!-- Header Title Rows -->
      <Row ss:Height="26">
        <Cell ss:MergeAcross="12" ss:StyleID="MainTitle">
          <Data ss:Type="String">BÁO CÁO SỐ LIỆU THỜI TIẾT KHÍ HẬU &amp; KẾ HOẠCH BAY KHẢO SÁT UAV (12 THÁNG)</Data>
        </Cell>
      </Row>
      <Row ss:Height="22">
        <Cell ss:MergeAcross="12" ss:StyleID="SubTitle">
          <Data ss:Type="String">ĐỊA BÀN: ${escapeXml(report.location.name.toUpperCase())} (${escapeXml(report.location.province.toUpperCase())})</Data>
        </Cell>
      </Row>
      <Row ss:Height="8"/>

      <!-- Metadata block -->
      <Row ss:Height="22">
        <Cell ss:StyleID="MetaLabel"><Data ss:Type="String">Địa bàn:</Data></Cell>
        <Cell ss:StyleID="MetaVal"><Data ss:Type="String">${escapeXml(report.location.name)}</Data></Cell>
        <Cell ss:StyleID="MetaLabel"><Data ss:Type="String">Thuộc tỉnh:</Data></Cell>
        <Cell ss:StyleID="MetaVal"><Data ss:Type="String">${escapeXml(report.location.province)}</Data></Cell>
        <Cell ss:StyleID="MetaLabel"><Data ss:Type="String">Lực lượng:</Data></Cell>
        <Cell ss:MergeAcross="2" ss:StyleID="MetaVal"><Data ss:Type="String">3 Đội UAV (Bay) + 4 Đội RTK (Mặt đất)</Data></Cell>
        <Cell ss:StyleID="MetaLabel"><Data ss:Type="String">Ngày xuất:</Data></Cell>
        <Cell ss:MergeAcross="3" ss:StyleID="MetaVal"><Data ss:Type="String">${escapeXml(dateStr)}</Data></Cell>
      </Row>
      <Row ss:Height="22">
        <Cell ss:StyleID="MetaLabel"><Data ss:Type="String">Tiểu vùng:</Data></Cell>
        <Cell ss:MergeAcross="3" ss:StyleID="MetaVal"><Data ss:Type="String">${escapeXml(report.location.description)}</Data></Cell>
        <Cell ss:StyleID="MetaLabel"><Data ss:Type="String">Nguồn dữ liệu:</Data></Cell>
        <Cell ss:MergeAcross="6" ss:StyleID="MetaVal"><Data ss:Type="String">Quy chuẩn Khí hậu QCVN 02:2022/BXD &amp; Open-Meteo ERA5 (Chuỗi 3 năm)</Data></Cell>
      </Row>
      <Row ss:Height="12"/>

      <!-- Table Header -->
      <Row ss:Height="30">
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Tháng</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Đặc trưng mùa vụ</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Nhiệt độ TB (°C)</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Dải Min - Max (°C)</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Lượng mưa (mm)</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Số ngày mưa (ngày)</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Ngày khô ráo (ngày)</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Gió TB (km/h)</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Gió giật max (km/h)</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Giờ nắng (giờ/ngày)</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Nhận định Thời tiết &amp; Khả năng Bay</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Khuyến nghị chế độ bay</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Mục tiêu (WU)</Data></Cell>
      </Row>

      <!-- 12 Month Rows -->
      ${report.monthlyStats
        .map((s) => {
          const isStorm = s.seasonName.includes("bão") || s.precipitationSum >= 200;
          const isRain = s.seasonName.includes("mưa") || s.precipitationSum >= 90;
          const isTrans = s.seasonName.includes("Giao mùa");
          const styleSeason = isStorm ? "CellStorm" : isRain ? "CellRain" : isTrans ? "CellTransition" : "CellDry";
          const paceText =
            s.flightPace === "RAPID"
              ? "Bay nhiều / Tối đa"
              : s.flightPace === "NORMAL"
              ? "Bay đều đặn"
              : s.flightPace === "SLOW"
              ? "Bay ít / Ca sáng"
              : "Cấm bay / Hạn chế";

          return `
      <Row ss:Height="26">
        <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${escapeXml(s.monthName)}</Data></Cell>
        <Cell ss:StyleID="${styleSeason}"><Data ss:Type="String">${escapeXml(s.seasonName)}</Data></Cell>
        <Cell ss:StyleID="CellNumber"><Data ss:Type="Number">${s.avgTemp}</Data></Cell>
        <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${s.avgTempMin} - ${s.avgTempMax}°C</Data></Cell>
        <Cell ss:StyleID="CellNumber"><Data ss:Type="Number">${s.precipitationSum}</Data></Cell>
        <Cell ss:StyleID="CellCenter"><Data ss:Type="Number">${s.rainyDaysCount}</Data></Cell>
        <Cell ss:StyleID="CellCenter"><Data ss:Type="Number">${s.dryDaysCount}</Data></Cell>
        <Cell ss:StyleID="CellCenter"><Data ss:Type="Number">${s.avgWindSpeed}</Data></Cell>
        <Cell ss:StyleID="CellCenter"><Data ss:Type="Number">${s.maxWindGust}</Data></Cell>
        <Cell ss:StyleID="CellCenter"><Data ss:Type="Number">${s.avgSunshineHours}</Data></Cell>
        <Cell ss:StyleID="CellNormal"><Data ss:Type="String">${escapeXml(s.flightAssessment)}</Data></Cell>
        <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${escapeXml(paceText)}</Data></Cell>
        <Cell ss:StyleID="CellNumber"><Data ss:Type="Number">${s.estimatedWU}</Data></Cell>
      </Row>`;
        })
        .join("")}

      <!-- Annual Totals Row -->
      <Row ss:Height="28">
        <Cell ss:StyleID="CellTotal"><Data ss:Type="String">TỔNG KẾT</Data></Cell>
        <Cell ss:StyleID="CellTotal"><Data ss:Type="String">CẢ NĂM</Data></Cell>
        <Cell ss:StyleID="CellTotal"><Data ss:Type="Number">${avgTempYear}</Data></Cell>
        <Cell ss:StyleID="CellTotal"><Data ss:Type="String">—</Data></Cell>
        <Cell ss:StyleID="CellTotal"><Data ss:Type="Number">${report.annualRainfall}</Data></Cell>
        <Cell ss:StyleID="CellTotal"><Data ss:Type="Number">${report.annualRainyDays}</Data></Cell>
        <Cell ss:StyleID="CellTotal"><Data ss:Type="Number">${totalDryDays}</Data></Cell>
        <Cell ss:StyleID="CellTotal"><Data ss:Type="Number">${avgWindYear}</Data></Cell>
        <Cell ss:StyleID="CellTotal"><Data ss:Type="String">—</Data></Cell>
        <Cell ss:StyleID="CellTotal"><Data ss:Type="Number">${avgSunYear}</Data></Cell>
        <Cell ss:StyleID="CellTotal"><Data ss:Type="String">Đạt điều kiện bay khảo sát: ${totalDryDays} ngày / 365 ngày</Data></Cell>
        <Cell ss:StyleID="CellTotal"><Data ss:Type="String">HOÀN THÀNH KẾ HOẠCH</Data></Cell>
        <Cell ss:StyleID="CellTotal"><Data ss:Type="Number">${totalWU}</Data></Cell>
      </Row>

      <Row ss:Height="14"/>

      <!-- Strategic Directives -->
      <Row ss:Height="22">
        <Cell ss:MergeAcross="12" ss:StyleID="SubTitle"><Data ss:Type="String">CHỈ ĐẠO CHIẾN LƯỢC ĐIỀU PHỐI ĐỘI BAY UAV:</Data></Cell>
      </Row>
      <Row ss:Height="24">
        <Cell ss:MergeAcross="12" ss:StyleID="CellNormal">
          <Data ss:Type="String">1. Thời kỳ bay cao điểm: Bố trí toàn lực lượng 3 Đội UAV bay tăng tốc tối đa sản lượng 3D 50m và 2D 50m trong các tháng mùa khô (${report.location.province === "Bình Định" ? "Tháng 1 - Tháng 8" : "Tháng 11 - Tháng 4"}).</Data>
        </Cell>
      </Row>
      <Row ss:Height="24">
        <Cell ss:MergeAcross="12" ss:StyleID="CellNormal">
          <Data ss:Type="String">2. Thời kỳ phòng ngừa rủi ro: ${report.location.province === "Bình Định" ? "Tháng 10 - Tháng 11 mưa bão miền Trung, gió giật mạnh -> Cấm bay ven biển, bảo dưỡng trang thiết bị và xử lý bình sai ảnh." : "Tháng 6 - Tháng 8 mưa dầm Tây Nguyên -> Tranh thủ bay ca sáng sớm (06h-10h), hoàn thành bay trước dông chiều."}</Data>
        </Cell>
      </Row>
      <Row ss:Height="24">
        <Cell ss:MergeAcross="12" ss:StyleID="CellNormal">
          <Data ss:Type="String">3. Phối hợp mặt đất RTK: 4 Đội RTK đo trước mốc khống chế tọa độ 3-5 ngày và kiểm tra bãi cất hạ cánh an toàn trước mỗi ca bay.</Data>
        </Cell>
      </Row>
    </Table>
  </Worksheet>
  `;
}

/**
 * Generate XML Worksheet for the 28-District Overview Matrix (Clean, no text crowding)
 */
function generateAllDistrictsSummaryWorksheetXml(reports: LocationMonthlyReport[]): string {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return `
  <Worksheet ss:Name="Tổng hợp 28 Huyện">
    <Table ss:DefaultRowHeight="26">
      <Column ss:Width="45"/>  <!-- STT -->
      <Column ss:Width="160"/> <!-- Tên huyện -->
      <Column ss:Width="120"/> <!-- Tỉnh -->
      <Column ss:Width="110"/> <!-- Tổng mưa năm -->
      <Column ss:Width="95"/>  <!-- Số ngày mưa -->
      <Column ss:Width="105"/> <!-- Ngày khô ráo -->
      <!-- 12 Columns for Month Stats (Clean 110pt width per month) -->
      ${months.map(() => `<Column ss:Width="120"/>`).join("\n      ")}

      <Row ss:Height="26">
        <Cell ss:MergeAcross="17" ss:StyleID="MainTitle">
          <Data ss:Type="String">BÁO CÁO TỔNG HỢP KHÍ HẬU &amp; MÙA VỤ TOÀN BỘ 28 HUYỆN (GIA LAI &amp; BÌNH ĐỊNH)</Data>
        </Cell>
      </Row>
      <Row ss:Height="20">
        <Cell ss:MergeAcross="17" ss:StyleID="SubTitle">
          <Data ss:Type="String">BẢNG ĐỐI CHIẾU ĐA ĐỊA BÀN PHỤC VỤ ĐIỀU PHỐI TỔNG THỂ DỰ ÁN KHẢO SÁT UAV</Data>
        </Cell>
      </Row>
      <Row ss:Height="8"/>

      <!-- Headers -->
      <Row ss:Height="30">
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">STT</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Địa bàn (Huyện/TX/TP)</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Tỉnh / Khu vực</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Tổng mưa năm (mm)</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Số ngày mưa (ngày)</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Ngày khô ráo (ngày)</Data></Cell>
        ${months.map((m) => `<Cell ss:StyleID="TableHeader"><Data ss:Type="String">Tháng ${m}</Data></Cell>`).join("\n        ")}
      </Row>

      <!-- District Rows -->
      ${reports
        .map((r, idx) => {
          const totalDry = Math.round(r.monthlyStats.reduce((s, m) => s + m.dryDaysCount, 0));

          const monthCells = r.monthlyStats
            .map((s) => {
              const isStorm = s.seasonName.includes("bão") || s.precipitationSum >= 200;
              const isRain = s.seasonName.includes("mưa") || s.precipitationSum >= 90;
              const isTrans = s.seasonName.includes("Giao mùa");
              const styleSeason = isStorm ? "CellStorm" : isRain ? "CellRain" : isTrans ? "CellTransition" : "CellDry";
              const shortValText = getShortSeasonLabel(s.seasonName, s.precipitationSum);

              return `<Cell ss:StyleID="${styleSeason}"><Data ss:Type="String">${escapeXml(shortValText)}</Data></Cell>`;
            })
            .join("\n        ");

          return `
      <Row ss:Height="26">
        <Cell ss:StyleID="CellCenter"><Data ss:Type="Number">${idx + 1}</Data></Cell>
        <Cell ss:StyleID="CellNormal"><Data ss:Type="String">${escapeXml(r.location.name)}</Data></Cell>
        <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${escapeXml(r.location.province)}</Data></Cell>
        <Cell ss:StyleID="CellNumber"><Data ss:Type="Number">${r.annualRainfall}</Data></Cell>
        <Cell ss:StyleID="CellCenter"><Data ss:Type="Number">${r.annualRainyDays}</Data></Cell>
        <Cell ss:StyleID="CellCenter"><Data ss:Type="Number">${totalDry}</Data></Cell>
        ${monthCells}
      </Row>`;
        })
        .join("")}
    </Table>
  </Worksheet>
  `;
}

/**
 * Export a single district to native XML Spreadsheet (.xls)
 * Features auto-width, text-wrap, full UTF-8 encoding, and professional colors.
 */
export function exportDistrictMonthlyReportToExcel(report: LocationMonthlyReport) {
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
  ${generateExcelStyles()}
  ${generateDistrictWorksheetXml(report, report.location.name)}
</Workbook>`;

  const blob = new Blob([xmlContent], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Bao_cao_thoi_tiet_${report.location.id}_12_thang.xls`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Export ALL 28 districts to a single Excel Workbook (.xls) with 29 TABS:
 * - Tab 1: "Tổng hợp 28 Huyện"
 * - Tab 2..29: 28 individual tabs for every single district with full 12-month details!
 */
export function exportAllDistrictsSummaryToExcel(reports: LocationMonthlyReport[]) {
  const summarySheetXml = generateAllDistrictsSummaryWorksheetXml(reports);
  const individualSheetsXml = reports
    .map((r) => generateDistrictWorksheetXml(r, r.location.name))
    .join("\n");

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
  ${generateExcelStyles()}
  ${summarySheetXml}
  ${individualSheetsXml}
</Workbook>`;

  const blob = new Blob([xmlContent], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Bao_cao_tong_hop_28_huyen_GiaLai_BinhDinh_29_Tabs.xls`;
  link.click();
  URL.revokeObjectURL(url);
}
