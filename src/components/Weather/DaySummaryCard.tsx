import { Card, CardContent, Typography, Chip, Stack } from "@mui/material";
import AirIcon from "@mui/icons-material/Air";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import type { DaySummary, FlightCondition } from "../../types/weather";

const conditionColors: Record<FlightCondition, string> = {
  GO: "#66bb6a",
  CAUTION: "#ffa726",
  NO_GO: "#f44336",
};

interface Props {
  summary: DaySummary;
  isSelected: boolean;
  onClick: () => void;
}

export default function DaySummaryCard({ summary, isSelected, onClick }: Props) {
  const borderColor = conditionColors[summary.overallCondition];

  return (
    <Card
      onClick={onClick}
      sx={{
        minWidth: 140,
        cursor: "pointer",
        border: (theme) => isSelected ? `2px solid ${borderColor}` : `1px solid ${theme.palette.divider}`,
        boxShadow: isSelected ? `0 0 16px ${borderColor}40` : "none",
        transition: "all 0.2s ease",
        "&:hover": {
          border: `2px solid ${borderColor}`,
          transform: "translateY(-2px)",
          boxShadow: `0 4px 20px ${borderColor}30`,
        },
      }}
    >
      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Stack spacing={0.5} sx={{ alignItems: "center" }}>
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
            {summary.dayOfWeek}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {summary.date.substring(5).replace("-", "/")}
          </Typography>

          <Chip
            label={`${summary.flyableHours}h bay`}
            size="small"
            sx={{
              bgcolor: `${borderColor}20`,
              color: borderColor,
              fontWeight: 700,
              fontSize: "0.75rem",
            }}
          />

          <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.65rem" }}>
            {summary.bestTimeSlot}
          </Typography>

          <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
            <AirIcon sx={{ fontSize: 12, color: "text.secondary" }} />
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {Math.round(summary.avgWindSpeed)}
            </Typography>
            <WaterDropIcon sx={{ fontSize: 12, color: "text.secondary" }} />
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {summary.totalPrecipitation.toFixed(1)}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
