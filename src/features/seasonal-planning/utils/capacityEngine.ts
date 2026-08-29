import type {
  UAVCapacityConfig,
  MonthlyWeatherStat,
} from "../types/seasonalTypes";

export type FlightSurveyTaskType = "WORK_UNITS" | "3D_50M" | "2D_50M" | "2D_200M" | "HH_COMBO";

export const TASK_DEFINITIONS: {
  type: FlightSurveyTaskType;
  label: string;
  unit: string;
  description: string;
}[] = [
  {
    type: "WORK_UNITS",
    label: "Đơn vị công việc (Work Units)",
    unit: "WU",
    description: "Đơn vị tổng hợp quy đổi khối lượng nhiệm vụ đo đạc tiêu chuẩn.",
  },
  {
    type: "3D_50M",
    label: "Mô hình 3D (Độ cao 50m)",
    unit: "ha",
    description: "Khảo sát địa hình chi tiết 3D độ phân giải cao ở độ cao 50m.",
  },
  {
    type: "2D_50M",
    label: "Bản đồ 2D trực giao (Độ cao 50m)",
    unit: "ha",
    description: "Bản đồ trực giao 2D chi tiết ranh giới thửa đất ở độ cao 50m.",
  },
  {
    type: "2D_200M",
    label: "Bản đồ 2D diện rộng (Độ cao 200m)",
    unit: "ha",
    description: "Bản đồ trực giao 2D diện tích lớn toàn cảnh ở độ cao 200m.",
  },
  {
    type: "HH_COMBO",
    label: "Hỗn hợp 2D + 3D (20ha 3D + 80ha 2D)",
    unit: "ha",
    description: "Gói khảo sát kết hợp: 20 ha mô hình 3D 50m + 80 ha bản đồ 2D 50m.",
  },
];

export function calculateMonthlyCapacities(
  stat: MonthlyWeatherStat,
  config: UAVCapacityConfig
) {
  const dryDays = stat.dryDaysCount;
  const teams = config.uavTeams;

  return [
    {
      taskType: "WORK_UNITS",
      taskLabel: "Đơn vị công việc (WU)",
      dailyRatePerTeam: config.dailyCapacityWU,
      monthlyTotal: Math.round(dryDays * config.dailyCapacityWU * teams),
      unit: "WU",
    },
    {
      taskType: "3D_50M",
      taskLabel: "3D 50m",
      dailyRatePerTeam: config.productivity3D50m,
      monthlyTotal: Math.round(dryDays * config.productivity3D50m * teams),
      unit: "ha",
    },
    {
      taskType: "2D_50M",
      taskLabel: "2D 50m",
      dailyRatePerTeam: config.productivity2D50m,
      monthlyTotal: Math.round(dryDays * config.productivity2D50m * teams),
      unit: "ha",
    },
    {
      taskType: "2D_200M",
      taskLabel: "2D 200m",
      dailyRatePerTeam: config.productivity2D200m,
      monthlyTotal: Math.round(dryDays * config.productivity2D200m * teams),
      unit: "ha",
    },
    {
      taskType: "HH_COMBO",
      taskLabel: "Hỗn hợp HH (2D+3D)",
      dailyRatePerTeam: config.productivityHHTotal,
      monthlyTotal: Math.round(dryDays * config.productivityHHTotal * teams),
      unit: "ha",
    },
  ];
}
