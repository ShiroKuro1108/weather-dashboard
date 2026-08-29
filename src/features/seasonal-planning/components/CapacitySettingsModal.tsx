import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Stack,
  Switch,
  FormControlLabel,
  Divider,
  Paper,
  Slider,
  Grid,
} from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { type UAVCapacityConfig, DEFAULT_UAV_CONFIG } from "../types/seasonalTypes";

interface Props {
  open: boolean;
  config: UAVCapacityConfig;
  onSave: (config: UAVCapacityConfig) => void;
  onClose: () => void;
  onReset: () => void;
}

export default function CapacitySettingsModal({
  open,
  config,
  onSave,
  onClose,
  onReset,
}: Props) {
  const [form, setForm] = useState<UAVCapacityConfig>(config);

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  const handleReset = () => {
    setForm(DEFAULT_UAV_CONFIG);
    onReset();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <TuneIcon color="primary" />
        <Typography component="span" variant="h6" sx={{ fontWeight: 700 }}>
          Cấu hình Đội bay & Năng suất Khảo sát UAV
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3} sx={{ py: 1 }}>
          {/* SECTION 1: RESOURCE BIÊN CHẾ */}
          <BoxWrapper title="1. Lực lượng & Biên chế Đội bay">
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Số Đội UAV (UAV_TEAMS)"
                  type="number"
                  size="small"
                  value={form.uavTeams}
                  onChange={(e) => setForm({ ...form, uavTeams: Math.max(1, parseInt(e.target.value) || 1) })}
                  helperText="Mặc định: 3 đội"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Số Phi công (PILOT_COUNT)"
                  type="number"
                  size="small"
                  value={form.pilotCount}
                  onChange={(e) => setForm({ ...form, pilotCount: Math.max(1, parseInt(e.target.value) || 1) })}
                  helperText="Mặc định: 3 phi công"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Số Đội RTK mặt đất (RTK_TEAMS)"
                  type="number"
                  size="small"
                  value={form.rtkTeams}
                  onChange={(e) => setForm({ ...form, rtkTeams: Math.max(1, parseInt(e.target.value) || 1) })}
                  helperText="Mặc định: 4 đội"
                />
              </Grid>
            </Grid>
          </BoxWrapper>

          {/* SECTION 2: ĐỊNH MỨC NĂNG SUẤT HÀNG NGÀY */}
          <BoxWrapper title="2. Định mức Năng suất Khảo sát (1 Đội / Ngày)">
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Mô hình 3D 50m (ha/ngày)"
                  type="number"
                  size="small"
                  value={form.productivity3D50m}
                  onChange={(e) => setForm({ ...form, productivity3D50m: parseFloat(e.target.value) || 0 })}
                  helperText="PRODUCTIVITY_3D_50M = 50.0 ha"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Bản đồ 2D 50m (ha/ngày)"
                  type="number"
                  size="small"
                  value={form.productivity2D50m}
                  onChange={(e) => setForm({ ...form, productivity2D50m: parseFloat(e.target.value) || 0 })}
                  helperText="PRODUCTIVITY_2D_50M = 120.0 ha"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Bản đồ 2D 200m diện rộng (ha/ngày)"
                  type="number"
                  size="small"
                  value={form.productivity2D200m}
                  onChange={(e) => setForm({ ...form, productivity2D200m: parseFloat(e.target.value) || 0 })}
                  helperText="PRODUCTIVITY_2D_200M = 1850.0 ha"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Gói Hỗn hợp HH Tổng (ha/ngày)"
                  type="number"
                  size="small"
                  value={form.productivityHHTotal}
                  onChange={(e) => setForm({ ...form, productivityHHTotal: parseFloat(e.target.value) || 0 })}
                  helperText="PRODUCTIVITY_HH_TOTAL = 100.0 ha (20ha 3D + 80ha 2D)"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 12 }}>
                <TextField
                  fullWidth
                  label="Công suất Đơn vị công việc Ngày (DAILY_CAPACITY_WU)"
                  type="number"
                  size="small"
                  value={form.dailyCapacityWU}
                  onChange={(e) => setForm({ ...form, dailyCapacityWU: parseFloat(e.target.value) || 0 })}
                  helperText="DAILY_CAPACITY_WU = 50.0 WU/ngày / 1 đội"
                />
              </Grid>
            </Grid>
          </BoxWrapper>

          {/* SECTION 3: THỜI GIAN LỊCH SỬ PHÂN TÍCH */}
          <BoxWrapper title="3. Phạm vi Dữ liệu Lịch sử Khí hậu">
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
              Số năm lịch sử tổng hợp từ Open-Meteo Archive API: <strong>{form.historyYears} năm</strong>
            </Typography>
            <Slider
              value={form.historyYears}
              min={1}
              max={5}
              step={1}
              marks={[
                { value: 1, label: "1 năm" },
                { value: 2, label: "2 năm" },
                { value: 3, label: "3 năm (Khuyên dùng)" },
                { value: 4, label: "4 năm" },
                { value: 5, label: "5 năm" },
              ]}
              onChange={(_, v) => setForm({ ...form, historyYears: v as number })}
            />
          </BoxWrapper>

          {/* SECTION 4: CẤU HÌNH GEMINI AI */}
          <BoxWrapper title="4. Tích hợp Trí tuệ Nhân tạo Google Gemini">
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.geminiEnabled}
                    onChange={(e) => setForm({ ...form, geminiEnabled: e.target.checked })}
                    color="primary"
                  />
                }
                label={
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <SmartToyIcon color={form.geminiEnabled ? "primary" : "disabled"} fontSize="small" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Bật Báo cáo Chiến lược Tự động bằng Gemini AI (GEMINI_ENABLED)
                    </Typography>
                  </Stack>
                }
              />

              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Khi tắt: Hệ thống sử dụng Thuật toán Quy tắc Định chuẩn (Heuristic Engine) có sẵn. Khi bật: Gửi thống kê mùa vụ tới Gemini để viết báo cáo điều hành chuyên sâu.
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Gemini Model"
                    size="small"
                    value={form.geminiModel}
                    onChange={(e) => setForm({ ...form, geminiModel: e.target.value })}
                    helperText="Mặc định: gemini-3.6-flash hoặc gemini-2.5-flash"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Gemini API Key"
                    type="password"
                    size="small"
                    value={form.geminiApiKey}
                    onChange={(e) => setForm({ ...form, geminiApiKey: e.target.value })}
                    helperText="Khóa API bảo mật cá nhân"
                  />
                </Grid>
              </Grid>
            </Stack>
          </BoxWrapper>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
        <Button
          startIcon={<RestartAltIcon />}
          color="inherit"
          onClick={handleReset}
          sx={{ textTransform: "none" }}
        >
          Khôi phục mặc định
        </Button>
        <Stack direction="row" spacing={1.5}>
          <Button onClick={onClose} sx={{ textTransform: "none" }}>
            Hủy
          </Button>
          <Button variant="contained" onClick={handleSave} sx={{ textTransform: "none", fontWeight: 600 }}>
            Lưu cấu hình
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

function BoxWrapper({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: "background.default" }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "primary.main", mb: 1.5 }}>
        {title}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {children}
    </Paper>
  );
}
