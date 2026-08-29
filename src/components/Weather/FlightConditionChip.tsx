import { Chip } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import CancelIcon from "@mui/icons-material/Cancel";
import type { FlightCondition } from "../../types/weather";

const CONFIG: Record<FlightCondition, { label: string; color: "success" | "warning" | "error"; icon: React.ReactElement }> = {
  GO: { label: "Bay được", color: "success", icon: <CheckCircleIcon /> },
  CAUTION: { label: "Cẩn thận", color: "warning", icon: <WarningIcon /> },
  NO_GO: { label: "Không bay", color: "error", icon: <CancelIcon /> },
};

interface Props {
  condition: FlightCondition;
  size?: "small" | "medium";
}

export default function FlightConditionChip({ condition, size = "small" }: Props) {
  const cfg = CONFIG[condition];
  return (
    <Chip
      label={cfg.label}
      color={cfg.color}
      icon={cfg.icon}
      size={size}
      variant="filled"
    />
  );
}
