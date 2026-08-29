import { Box, Tooltip } from "@mui/material";
import type { FlightCondition, SessionSummary } from "../../types/weather";

const conditionConfig: Record<FlightCondition, { bg: string; label: string; emoji: string }> = {
  GO: { bg: "#1b5e20", label: "Bay được", emoji: "🟢" },
  CAUTION: { bg: "#e65100", label: "Cẩn thận", emoji: "🟡" },
  NO_GO: { bg: "#b71c1c", label: "Không bay", emoji: "🔴" },
};

interface Props {
  session: SessionSummary;
  onClick: () => void;
  isSelected: boolean;
}

export default function MatrixCell({ session, onClick, isSelected }: Props) {
  const cfg = conditionConfig[session.condition];

  return (
    <Tooltip
      title={`${session.session === "morning" ? "Sáng" : "Chiều"}: ${session.reason}`}
      arrow
      placement="top"
    >
      <Box
        onClick={onClick}
        sx={{
          width: 40,
          height: 32,
          bgcolor: cfg.bg,
          borderRadius: 0.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontSize: 11,
          fontWeight: 700,
          color: "#fff",
          opacity: isSelected ? 1 : 0.85,
          border: isSelected ? "2px solid #fff" : "1px solid rgba(255,255,255,0.1)",
          transition: "all 0.15s ease",
          "&:hover": {
            opacity: 1,
            transform: "scale(1.1)",
            zIndex: 2,
            boxShadow: `0 0 8px ${cfg.bg}`,
          },
        }}
      >
        {session.goHours > 0 ? `${session.goHours}h` : "✕"}
      </Box>
    </Tooltip>
  );
}
