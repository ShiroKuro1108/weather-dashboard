import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Slider, Typography, Stack, Divider, Box,
} from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import type { FlightThresholds } from "../../types/weather";
import { DEFAULT_THRESHOLDS } from "../../utils/flightCondition";

interface Props {
  open: boolean;
  thresholds: FlightThresholds;
  onSave: (t: FlightThresholds) => void;
  onClose: () => void;
}

function ThresholdSlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>{label}</Typography>
        <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 700 }}>
          {value} {unit}
        </Typography>
      </Stack>
      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(_, v) => onChange(v as number)}
        size="small"
        sx={{ mt: 0.5 }}
      />
    </Box>
  );
}

export default function ThresholdSettings({ open, thresholds, onSave, onClose }: Props) {
  const handleChange = (key: keyof FlightThresholds) => (value: number) => {
    onSave({ ...thresholds, [key]: value });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>⚙️ Ngưỡng Điều Kiện Bay</DialogTitle>
      <DialogContent>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: "block" }}>
          Tuỳ chỉnh ngưỡng Go / Caution / No-Go. Thay đổi tự động áp dụng.
        </Typography>

        <Divider sx={{ mb: 2 }}>💨 Gió</Divider>
        <ThresholdSlider label="Gió tốt (GO ≤)" value={thresholds.windSpeedGo} min={5} max={30} step={1} unit="km/h" onChange={handleChange("windSpeedGo")} />
        <ThresholdSlider label="Gió cảnh báo (CAUTION ≤)" value={thresholds.windSpeedCaution} min={15} max={40} step={1} unit="km/h" onChange={handleChange("windSpeedCaution")} />
        <ThresholdSlider label="Gió giật tối đa" value={thresholds.windGustMax} min={20} max={60} step={1} unit="km/h" onChange={handleChange("windGustMax")} />

        <Divider sx={{ mb: 2, mt: 1 }}>🌧️ Mưa</Divider>
        <ThresholdSlider label="Mưa tốt (GO ≤)" value={thresholds.precipitationGo} min={0} max={3} step={0.1} unit="mm" onChange={handleChange("precipitationGo")} />
        <ThresholdSlider label="Mưa tối đa" value={thresholds.precipitationMax} min={0.5} max={10} step={0.5} unit="mm" onChange={handleChange("precipitationMax")} />
        <ThresholdSlider label="XS Mưa tốt (GO ≤)" value={thresholds.precipProbGo} min={10} max={60} step={5} unit="%" onChange={handleChange("precipProbGo")} />
        <ThresholdSlider label="XS Mưa tối đa" value={thresholds.precipProbMax} min={40} max={100} step={5} unit="%" onChange={handleChange("precipProbMax")} />

        <Divider sx={{ mb: 2, mt: 1 }}>☁️ Mây & Tầm nhìn</Divider>
        <ThresholdSlider label="Mây tốt (GO ≤)" value={thresholds.cloudCoverGo} min={20} max={80} step={5} unit="%" onChange={handleChange("cloudCoverGo")} />
        <ThresholdSlider label="Mây tối đa" value={thresholds.cloudCoverMax} min={50} max={100} step={5} unit="%" onChange={handleChange("cloudCoverMax")} />
        <ThresholdSlider label="Tầm nhìn tối thiểu" value={thresholds.visibilityMin} min={500} max={10000} step={500} unit="m" onChange={handleChange("visibilityMin")} />
      </DialogContent>
      <DialogActions>
        <Button
          startIcon={<RestartAltIcon />}
          onClick={() => onSave({ ...DEFAULT_THRESHOLDS })}
          color="warning"
        >
          Reset mặc định
        </Button>
        <Button onClick={onClose} variant="contained">Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
