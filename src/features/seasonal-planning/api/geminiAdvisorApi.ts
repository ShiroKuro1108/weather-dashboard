import type {
  UAVCapacityConfig,
  LocationMonthlyReport,
  SeasonalStrategicPlan,
} from "../types/seasonalTypes";

export interface GeminiStrategicReportResponse {
  executiveBrief: string;
  quarterlyRecommendations: {
    quarter: string;
    focusArea: string;
    weatherSummary: string;
    uavTeamDeployment: string;
    rtkDeployment: string;
  }[];
  contingencyPlan: string;
  generatedBy: "gemini-ai" | "heuristic-engine";
}

export async function generateStrategicAIReport(
  reports: LocationMonthlyReport[],
  plan: SeasonalStrategicPlan,
  config: UAVCapacityConfig
): Promise<GeminiStrategicReportResponse> {
  if (!config.geminiEnabled || !config.geminiApiKey || config.geminiApiKey.trim() === "") {
    return generateFallbackHeuristicReport(reports, plan, config);
  }

  const model = config.geminiModel || "gemini-3.6-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.geminiApiKey}`;

  const locationsSummary = reports.map((r) => ({
    name: r.location.name,
    zone: r.location.zoneLabel,
    annualRainfallMm: r.annualRainfall,
    annualRainyDays: r.annualRainyDays,
    monthlyWeather: r.monthlyStats.map((s) => ({
      month: s.monthName,
      rainMm: s.precipitationSum,
      rainDays: s.rainyDaysCount,
      windKmH: s.avgWindSpeed,
      sunHours: s.avgSunshineHours,
      pace: s.flightPace,
    })),
  }));

  const promptText = `
Bạn là Trưởng ban Kế hoạch & Điều hành Bay Khảo sát Trắc địa UAV tại Việt Nam.
Hãy lập Báo cáo Chiến lược Điều hành Bay & Báo cáo Số liệu Thời tiết 12 Tháng dựa trên các thông số sau:

1. Lực lượng & Năng lực:
- 3 Đội bay UAV, 3 Phi công, 4 Đội RTK mặt đất
- Định mức: 3D 50m = ${config.productivity3D50m} ha/ngày, 2D 50m = ${config.productivity2D50m} ha/ngày, 2D 200m = ${config.productivity2D200m} ha/ngày, HH = ${config.productivityHHTotal} ha/ngày, Daily WU = ${config.dailyCapacityWU} WU/ngày.

2. Số liệu Khí hậu Lịch sử từng tháng:
${JSON.stringify(locationsSummary, null, 2)}

Yêu cầu trả về JSON hợp lệ theo schema (không bọc markdown):
{
  "executiveBrief": "Tổng quan chỉ đạo...",
  "quarterlyRecommendations": [
    {
      "quarter": "Quý 1 (Tháng 1-3)",
      "focusArea": "Địa bàn...",
      "weatherSummary": "Số liệu thời tiết...",
      "uavTeamDeployment": "Phân bổ 3 đội UAV...",
      "rtkDeployment": "Phân bổ 4 đội RTK..."
    },
    {
      "quarter": "Quý 2 (Tháng 4-6)",
      "focusArea": "...",
      "weatherSummary": "...",
      "uavTeamDeployment": "...",
      "rtkDeployment": "..."
    },
    {
      "quarter": "Quý 3 (Tháng 7-9)",
      "focusArea": "...",
      "weatherSummary": "...",
      "uavTeamDeployment": "...",
      "rtkDeployment": "..."
    },
    {
      "quarter": "Quý 4 (Tháng 10-12)",
      "focusArea": "...",
      "weatherSummary": "...",
      "uavTeamDeployment": "...",
      "rtkDeployment": "..."
    }
  ],
  "contingencyPlan": "Phương án dự phòng..."
}
`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      return generateFallbackHeuristicReport(reports, plan, config);
    }

    const resJson = await response.json();
    const rawContent = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawContent) {
      return generateFallbackHeuristicReport(reports, plan, config);
    }

    const parsed = JSON.parse(rawContent);
    return {
      ...parsed,
      generatedBy: "gemini-ai",
    };
  } catch {
    return generateFallbackHeuristicReport(reports, plan, config);
  }
}

function generateFallbackHeuristicReport(
  _reports: LocationMonthlyReport[],
  _plan: SeasonalStrategicPlan,
  config: UAVCapacityConfig
): GeminiStrategicReportResponse {
  return {
    executiveBrief: `Báo cáo chiến lược điều hành bay 12 tháng xây dựng dựa trên số liệu thời tiết khí hậu thực tế và tính tương phản theo mùa giữa Khu vực Gia Lai (Pleiku, An Khê, Ayun Pa) và Khu vực Bình Định (Quy Nhơn, Phù Cát, Hoài Nhơn). Biên chế ${config.uavTeams} Đội UAV và ${config.rtkTeams} Đội RTK được điều phối linh hoạt theo chu kỳ thời tiết để đạt hiệu quả cao nhất.`,
    quarterlyRecommendations: [
      {
        quarter: "Quý 1 (Tháng 1 - 3)",
        focusArea: "Khu vực Gia Lai (Pleiku, An Khê) & Khu vực Bình Định",
        weatherSummary: "Mùa khô rực rỡ, mưa rất ít (<25mm/tháng, 1-3 ngày mưa), nắng 8-9h/ngày, gió êm 14-16 km/h.",
        uavTeamDeployment: "2 Đội UAV tại Gia Lai (nắng đẹp, gió êm), 1 Đội UAV tại Bình Định để bay các khu đô thị.",
        rtkDeployment: "4 Đội RTK đo trước mốc khống chế và kiểm tra ranh thửa.",
      },
      {
        quarter: "Quý 2 (Tháng 4 - 6)",
        focusArea: "Khu vực Bình Định (Quy Nhơn, Phù Cát) & Khu vực Gia Lai",
        weatherSummary: "Bình Định nhiều nắng (8-9h/ngày, mưa <40mm); Gia Lai bắt đầu có mưa dông đầu mùa sau 14h.",
        uavTeamDeployment: "2 Đội UAV tại Bình Định tăng tốc độ bay; 1 Đội UAV tại Gia Lai bay ca sáng trước 11h.",
        rtkDeployment: "2 Đội RTK tại Bình Định, 2 Đội RTK tại Gia Lai.",
      },
      {
        quarter: "Quý 3 (Tháng 7 - 9)",
        focusArea: "Trọng tâm tối đa: Khu vực Bình Định (Quy Nhơn, Phù Cát)",
        weatherSummary: "Bình Định khô ráo nhiều nắng (mưa <50mm, 4-5 ngày mưa); Gia Lai mưa dầm cao điểm (240-280mm, 19-22 ngày mưa).",
        uavTeamDeployment: "Dồn toàn bộ 3 Đội UAV về Bình Định để bay nhiều, tốc độ nhanh. Tại Gia Lai duy trì bay chậm ca sáng.",
        rtkDeployment: "3 Đội RTK tại Bình Định hỗ trợ bay, 1 Đội RTK đo bổ sung tại Gia Lai trong các ngày tạnh ráo.",
      },
      {
        quarter: "Quý 4 (Tháng 10 - 12)",
        focusArea: "Trọng tâm tối đa: Khu vực Gia Lai (Pleiku, An Khê, Ayun Pa)",
        weatherSummary: "Bình Định mưa bão lớn (310-360mm, gió giật 38-42 km/h); Gia Lai bước vào mùa khô nắng ráo.",
        uavTeamDeployment: "Rút toàn bộ 3 Đội UAV lên Gia Lai bay dồn dập. Tuyệt đối hạn chế bay tại Bình Định ven biển.",
        rtkDeployment: "4 Đội RTK tập trung tại Gia Lai phục vụ nghiệm thu sản phẩm.",
      },
    ],
    contingencyPlan: "Trong các đợt mưa bão tại Bình Định hoặc mưa dầm Gia Lai, toàn bộ phi công chuyển sang xử lý dữ liệu bình sai ảnh nội nghiệp và kiểm tra bảo dưỡng thiết bị bay.",
    generatedBy: "heuristic-engine",
  };
}
