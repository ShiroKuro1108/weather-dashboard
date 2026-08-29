import { useState } from "react";
import {
  Paper,
  Typography,
  Stack,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TextField,
  Chip,
  Box,
  Grid,
  Card,
  CardContent,
  MenuItem,
} from "@mui/material";
import CalculateIcon from "@mui/icons-material/Calculate";
import AssessmentIcon from "@mui/icons-material/Assessment";
import type {
  UAVCapacityConfig,
  LocationMonthlyReport,
} from "../types/seasonalTypes";

interface Props {
  report: LocationMonthlyReport;
  config: UAVCapacityConfig;
}

export default function ProductivityBreakdown({ report, config }: Props) {
  const [projectTarget, setProjectTarget] = useState<number>(1000);
  const [taskType, setTaskType] = useState<string>("2D_50M");

  const TASK_DEFS = [
    { type: "WORK_UNITS", label: "Đơn vị công việc (WU)", rate: config.dailyCapacityWU, unit: "WU" },
    { type: "3D_50M", label: "Mô hình 3D (Độ cao 50m)", rate: config.productivity3D50m, unit: "ha" },
    { type: "2D_50M", label: "Bản đồ 2D trực giao (Độ cao 50m)", rate: config.productivity2D50m, unit: "ha" },
    { type: "2D_200M", label: "Bản đồ 2D diện rộng (Độ cao 200m)", rate: config.productivity2D200m, unit: "ha" },
    { type: "HH_COMBO", label: "Gói Hỗn hợp 2D+3D (20ha 3D + 80ha 2D)", rate: config.productivityHHTotal, unit: "ha" },
  ];

  const currentTask = TASK_DEFS.find((t) => t.type === taskType) || TASK_DEFS[2];
  const teamDailyOutput = currentTask.rate * config.uavTeams;
  const daysNeeded = Math.ceil(projectTarget / Math.max(1, teamDailyOutput));

  return (
    <Stack spacing={3}>
      {/* 5 KPI Cards for Task Types */}
      <Grid container spacing={2}>
        {TASK_DEFS.map((def) => {
          const annualOutput = report.monthlyStats.reduce(
            (s, m) => s + Math.round(m.dryDaysCount * def.rate * config.uavTeams),
            0
          );
          return (
            <Grid key={def.type} size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: "background.paper", height: "100%" }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                    {def.label}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "primary.main", my: 0.5 }}>
                    {annualOutput.toLocaleString()} {def.unit}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "success.main", fontWeight: 600 }}>
                    {def.rate * config.uavTeams} {def.unit}/ngày ({config.uavTeams} đội)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Interactive Project Feasibility Estimator */}
      <Paper sx={{ p: 2.5, borderRadius: 2, bgcolor: "background.paper" }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 2 }}>
          <CalculateIcon color="primary" />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Công cụ Ước tính Tiến độ Khảo sát theo Dự án ({config.uavTeams} Đội UAV / {config.pilotCount} Phi công)
          </Typography>
        </Stack>

        <Grid container spacing={2} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Loại hình nhiệm vụ"
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
            >
              {TASK_DEFS.map((def) => (
                <MenuItem key={def.type} value={def.type}>
                  {def.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label={`Quy mô khối lượng (${currentTask.unit})`}
              value={projectTarget}
              onChange={(e) => setProjectTarget(Math.max(1, parseFloat(e.target.value) || 1))}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper sx={{ p: 1.5, bgcolor: "rgba(102, 187, 106, 0.12)", borderRadius: 1.5, textAlign: "center" }}>
              <Typography variant="caption" sx={{ color: "#81c784", fontWeight: 700, display: "block" }}>
                Thời gian ước tính hoàn thành:
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#81c784" }}>
                {daysNeeded} ngày bay thực tế
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Monthly Output Table */}
      <Paper sx={{ borderRadius: 2, overflow: "hidden", bgcolor: "background.paper" }}>
        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <AssessmentIcon color="primary" fontSize="small" />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Bảng Ước tính Sản lượng Từng Tháng tại {report.location.name}
            </Typography>
          </Stack>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "action.hover" }}>
                <TableCell sx={{ fontWeight: 700 }}>Tháng</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Mùa vụ</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Ngày khô ráo</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Ngày mưa</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">3D 50m (ha)</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">2D 50m (ha)</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">2D 200m (ha)</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">HH Tổng (ha)</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Tổng WU</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {report.monthlyStats.map((s) => {
                const total3D = Math.round(s.dryDaysCount * config.productivity3D50m * config.uavTeams);
                const total2D = Math.round(s.dryDaysCount * config.productivity2D50m * config.uavTeams);
                const total2D200m = Math.round(s.dryDaysCount * config.productivity2D200m * config.uavTeams);
                const totalHH = Math.round(s.dryDaysCount * config.productivityHHTotal * config.uavTeams);
                const totalWU = Math.round(s.dryDaysCount * config.dailyCapacityWU * config.uavTeams);

                return (
                  <TableRow key={s.month} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{s.monthName}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={s.seasonName}
                        sx={{ fontSize: "0.72rem" }}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: "#81c784" }}>
                      {s.dryDaysCount} ngày
                    </TableCell>
                    <TableCell align="center" sx={{ color: s.rainyDaysCount >= 15 ? "error.main" : "text.secondary" }}>
                      {s.rainyDaysCount} ngày
                    </TableCell>
                    <TableCell align="right">{total3D.toLocaleString()}</TableCell>
                    <TableCell align="right">{total2D.toLocaleString()}</TableCell>
                    <TableCell align="right">{total2D200m.toLocaleString()}</TableCell>
                    <TableCell align="right">{totalHH.toLocaleString()}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: "primary.light" }}>
                      {totalWU.toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Stack>
  );
}
