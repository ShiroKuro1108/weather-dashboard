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
  Chip,
  Box,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import ShieldIcon from "@mui/icons-material/Shield";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import type { SeasonalStrategicPlan } from "../types/seasonalTypes";

interface Props {
  plan: SeasonalStrategicPlan;
}

const PACE_CONFIG: Record<
  string,
  { label: string; color: "success" | "info" | "warning" | "error" }
> = {
  RAPID: { label: "Bay nhiều / Nhanh", color: "success" },
  NORMAL: { label: "Bay đều đặn", color: "info" },
  SLOW: { label: "Bay ít / Chậm", color: "warning" },
  RESTRICTED: { label: "Hạn chế / Cấm bay", color: "error" },
};

export default function ScheduleTimeline({ plan }: Props) {
  return (
    <Stack spacing={3}>
      {/* Top Banner KPI Cards */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: "background.paper" }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <FlightTakeoffIcon color="primary" sx={{ fontSize: 32 }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "primary.main" }}>
                    {plan.totalAnnualWU.toLocaleString()} WU
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Tổng sản lượng kế hoạch cả năm ({plan.config.uavTeams} Đội UAV)
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: "background.paper" }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <ShieldIcon color="warning" sx={{ fontSize: 32 }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "warning.main" }}>
                    {plan.config.uavTeams} Đội UAV / {plan.config.rtkTeams} RTK
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Lực lượng điều phối đồng bộ liên vùng
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: "background.paper" }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <CalendarMonthIcon color="info" sx={{ fontSize: 32 }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "info.main" }}>
                    12 Tháng Chi Tiết
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Lịch trình khả quan tối ưu theo diễn biến thời tiết
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Schedule Table */}
      <Paper sx={{ borderRadius: 2, overflow: "hidden", bgcolor: "background.paper" }}>
        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Lịch trình Bay Khả quan 12 Tháng & Phân bổ 3 Đội UAV / 4 Đội RTK
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Tự động luân chuyển địa bàn tối ưu năng suất (Tháng 5-8 dồn Duyên hải, Tháng 10-11 rút lên Tây Nguyên)
          </Typography>
        </Box>

        <TableContainer sx={{ maxHeight: 600 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: "action.hover" }}>
                <TableCell sx={{ fontWeight: 700, width: 80 }}>Tháng</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Địa bàn Trọng điểm</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Phân bổ Đội</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Ngày khô ráo</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Ngày mưa</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Chế độ bay</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Mục tiêu WU</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">2D 50m (ha)</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">3D 50m (ha)</TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 260 }}>Chỉ đạo & Khuyến nghị Lịch trình</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {plan.schedules.map((item) => {
                const paceInfo = PACE_CONFIG[item.pace] || PACE_CONFIG.NORMAL;
                const isHighlightSummer = item.month >= 6 && item.month <= 8;
                const isHighlightWinter = item.month >= 10 && item.month <= 11;

                return (
                  <TableRow
                    key={item.month}
                    hover
                    sx={{
                      bgcolor: isHighlightSummer
                        ? "rgba(33, 150, 243, 0.05)"
                        : isHighlightWinter
                        ? "rgba(255, 152, 0, 0.05)"
                        : "transparent",
                    }}
                  >
                    <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>
                      {item.monthName}
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {item.primaryLocationName}
                      </Typography>
                      {item.secondaryLocationName && (
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          Phụ cận: {item.secondaryLocationName}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell align="center">
                      <Chip
                        size="small"
                        label={`${item.allocatedUavTeams} UAV / ${item.allocatedRtkTeams} RTK`}
                        variant="outlined"
                        color="primary"
                        sx={{ fontWeight: 600, fontSize: "0.72rem" }}
                      />
                    </TableCell>

                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#81c784" }}>
                        {item.dryDays} ngày
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: 600, color: item.rainyDays >= 12 ? "error.main" : "text.secondary" }}>
                        {item.rainyDays} ngày
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Chip
                        size="small"
                        label={paceInfo.label}
                        color={paceInfo.color}
                        sx={{ fontWeight: 700, fontSize: "0.7rem" }}
                      />
                    </TableCell>

                    <TableCell align="right" sx={{ fontWeight: 700, color: "primary.light" }}>
                      {item.targetWU.toLocaleString()}
                    </TableCell>

                    <TableCell align="right">
                      {item.target2D50mHa.toLocaleString()}
                    </TableCell>

                    <TableCell align="right">
                      {item.target3D50mHa.toLocaleString()}
                    </TableCell>

                    <TableCell>
                      <Typography variant="caption" sx={{ color: "text.primary", lineHeight: 1.35, display: "block" }}>
                        {item.scheduleRecommendation}
                      </Typography>
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
