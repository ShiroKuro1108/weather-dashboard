import type {
  UAVCapacityConfig,
  LocationMonthlyReport,
  MonthlyScheduleItem,
  SeasonalStrategicPlan,
} from "../types/seasonalTypes";

const MONTH_NAMES = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
  "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8",
  "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

const PACE_LABELS: Record<string, string> = {
  RAPID: "Bay nhiều / Nhanh",
  NORMAL: "Bay đều đặn",
  SLOW: "Bay ít / Chậm",
  RESTRICTED: "Hạn chế / Cấm bay",
};

export function generateStrategicSchedule(
  reports: LocationMonthlyReport[],
  config: UAVCapacityConfig
): SeasonalStrategicPlan {
  const currentYear = new Date().getFullYear();
  const schedules: MonthlyScheduleItem[] = [];

  if (reports.length === 0) {
    return {
      year: currentYear,
      config,
      schedules: [],
      totalAnnualWU: 0,
      executiveSummary: "Chưa có dữ liệu khí hậu để lập lịch trình.",
      keyInsights: [],
    };
  }

  for (let m = 1; m <= 12; m++) {
    // Find best location for this month (highest dry days / least rain)
    const ranked = reports
      .map((r) => {
        const stat = r.monthlyStats.find((s) => s.month === m);
        return {
          location: r.location,
          stat: stat ?? r.monthlyStats[0],
        };
      })
      .sort((a, b) => {
        // More dry days and less precipitation is better for flight ops
        if (b.stat.dryDaysCount !== a.stat.dryDaysCount) {
          return b.stat.dryDaysCount - a.stat.dryDaysCount;
        }
        return a.stat.precipitationSum - b.stat.precipitationSum;
      });

    const best = ranked[0];
    const secondBest = ranked.length > 1 ? ranked[1] : undefined;

    const dryDays = best.stat.dryDaysCount;
    const rainyDays = best.stat.rainyDaysCount;
    const pace = best.stat.flightPace;
    const paceLabel = PACE_LABELS[pace] || "Bình thường";

    // Targets calculated based on dry workable days
    const targetWU = Math.round(dryDays * config.dailyCapacityWU * config.uavTeams);
    const target2D50mHa = Math.round(dryDays * config.productivity2D50m * config.uavTeams);
    const target3D50mHa = Math.round(dryDays * config.productivity3D50m * config.uavTeams);
    const target2D200mHa = Math.round(dryDays * config.productivity2D200m * config.uavTeams);
    const targetHHHa = Math.round(dryDays * config.productivityHHTotal * config.uavTeams);

    let scheduleRec = "";
    let weatherConditionNote = `Lượng mưa TB: ${best.stat.precipitationSum} mm (${rainyDays} ngày mưa), Gió TB: ${best.stat.avgWindSpeed} km/h, ${best.stat.avgSunshineHours} h nắng/ngày.`;

    if (m >= 5 && m <= 8) {
      scheduleRec = `Khu vực Gia Lai (Pleiku/Chư Sê) mưa dầm nhiều -> Bay ít, chậm; Khu vực Bình Định (${best.location.name}) nắng ráo -> Dồn 3 Đội UAV về Bình Định tăng tốc tối đa.`;
    } else if (m >= 10 && m <= 11) {
      scheduleRec = `Khu vực Bình Định (${best.location.name}) mưa bão lớn -> Cấm bay ven biển; Khu vực Gia Lai bắt đầu mùa khô -> Chuyển 3 Đội UAV lên Gia Lai bay dồn dập.`;
    } else if (m >= 1 && m <= 4) {
      scheduleRec = `Mùa khô rực rỡ, trời quang mây tạnh toàn vùng -> Duy trì 3 Đội UAV phân bổ đồng đều, bay tối đa năng suất 3D 50m và 2D 50m.`;
    } else {
      scheduleRec = `${best.stat.flightAssessment} Tập trung trọng tâm tại ${best.location.name}.`;
    }

    schedules.push({
      month: m,
      monthName: MONTH_NAMES[m - 1],
      primaryLocationId: best.location.id,
      primaryLocationName: best.location.name,
      secondaryLocationId: secondBest?.location.id,
      secondaryLocationName: secondBest?.location.name,
      allocatedUavTeams: config.uavTeams,
      allocatedRtkTeams: config.rtkTeams,
      dryDays,
      rainyDays,
      pace,
      paceLabel,
      targetWU,
      target2D50mHa,
      target3D50mHa,
      target2D200mHa,
      targetHHHa,
      weatherConditionNote,
      scheduleRecommendation: scheduleRec,
    });
  }

  const totalAnnualWU = schedules.reduce((s, item) => s + item.targetWU, 0);

  const executiveSummary = `Kế hoạch lịch trình bay khả quan 12 tháng xây dựng trên cơ sở số liệu thời tiết khí hậu thực tế và sự tương phản mùa vụ giữa Khu vực Gia Lai (Pleiku, An Khê, Ayun Pa) và Khu vực Bình Định (Quy Nhơn, Phù Cát, Hoài Nhơn).`;

  const keyInsights = [
    "Tháng 5 - Tháng 8: Khu vực Gia Lai mưa nhiều (195-280mm, 16-22 ngày mưa) -> Bay ít, chậm; Khu vực Bình Định nắng nhiều (35-50mm, 4-5 ngày mưa) -> Dồn 3 đội UAV về Bình Định tăng tốc độ bay.",
    "Tháng 10 - Tháng 11: Khu vực Bình Định mưa bão lớn (310-360mm, 17-19 ngày mưa, gió giật 38-42 km/h) -> Cấm bay ven biển; chuyển 3 đội UAV lên Gia Lai vào mùa khô.",
    "Tháng 12 - Tháng 4: Mùa khô toàn vùng (mưa dưới 30mm, 1-3 ngày mưa, 8-9h nắng/ngày) -> Điều kiện bay hoàn hảo, đẩy mạnh toàn bộ các gói 3D 50m và 2D 50m.",
    "Đội mặt đất RTK (4 đội) hoạt động trước 3-5 ngày đo mốc tọa độ và hỗ trợ kiểm tra thời tiết thực địa tại bãi cất hạ cánh.",
  ];

  return {
    year: currentYear,
    config,
    schedules,
    totalAnnualWU,
    executiveSummary,
    keyInsights,
  };
}
