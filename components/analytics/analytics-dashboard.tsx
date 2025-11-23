/**
 * Analytics Dashboard Component - Premium UI
 * Features: Charts, KPIs, data visualization
 */

"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  People,
  Work,
  EventNote,
  AttachMoney,
  MoreVert,
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";

interface KPIMetric {
  title: string;
  value: string | number;
  change: number;
  trend: "up" | "down";
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

interface AnalyticsDashboardProps {
  metrics?: KPIMetric[];
}

const defaultMetrics: KPIMetric[] = [
  {
    title: "Total Employees",
    value: 247,
    change: 12.5,
    trend: "up",
    icon: <People sx={{ fontSize: 32 }} />,
    color: "#667eea",
    subtitle: "vs last month",
  },
  {
    title: "Active Recruitments",
    value: 18,
    change: 8.3,
    trend: "up",
    icon: <Work sx={{ fontSize: 32 }} />,
    color: "#f59e0b",
    subtitle: "Open positions",
  },
  {
    title: "Attendance Rate",
    value: "94.2%",
    change: 2.1,
    trend: "up",
    icon: <EventNote sx={{ fontSize: 32 }} />,
    color: "#10b981",
    subtitle: "This month",
  },
  {
    title: "Payroll Cost",
    value: "$1.2M",
    change: -3.4,
    trend: "down",
    icon: <AttachMoney sx={{ fontSize: 32 }} />,
    color: "#8b5cf6",
    subtitle: "Monthly total",
  },
];

export default function AnalyticsDashboard({ metrics = defaultMetrics }: AnalyticsDashboardProps) {
  return (
    <Box>
      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {metrics.map((metric, idx) => (
          <Grid item xs={12} sm={6} lg={3} key={idx}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 4,
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                border: "1px solid rgba(255,255,255,0.6)",
                background: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(12px)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${metric.color}15 0%, ${metric.color}25 100%)`,
                    }}
                  >
                    <Box sx={{ color: metric.color }}>{metric.icon}</Box>
                  </Box>
                  <Chip
                    icon={
                      metric.trend === "up" ? (
                        <ArrowUpward sx={{ fontSize: 16 }} />
                      ) : (
                        <ArrowDownward sx={{ fontSize: 16 }} />
                      )
                    }
                    label={`${metric.change > 0 ? "+" : ""}${metric.change}%`}
                    size="small"
                    sx={{
                      bgcolor: metric.trend === "up" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                      color: metric.trend === "up" ? "#10b981" : "#ef4444",
                      fontWeight: 600,
                      "& .MuiChip-icon": { color: "inherit" },
                    }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom>
                  {metric.title}
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ mb: 0.5 }}>
                  {metric.value}
                </Typography>
                {metric.subtitle && (
                  <Typography variant="caption" color="text.secondary">
                    {metric.subtitle}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Department Performance */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              border: "1px solid rgba(255,255,255,0.6)",
              background: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(12px)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    Department Performance
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Employee productivity by department
                  </Typography>
                </Box>
                <IconButton size="small">
                  <MoreVert />
                </IconButton>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {[
                  { name: "Engineering", employees: 85, productivity: 92, color: "#667eea" },
                  { name: "Sales", employees: 42, productivity: 88, color: "#10b981" },
                  { name: "Marketing", employees: 28, productivity: 85, color: "#f59e0b" },
                  { name: "HR", employees: 15, productivity: 90, color: "#8b5cf6" },
                  { name: "Finance", employees: 22, productivity: 87, color: "#3b82f6" },
                ].map((dept, idx) => (
                  <Box key={idx}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            bgcolor: dept.color,
                            boxShadow: `0 0 10px ${dept.color}50`,
                          }}
                        />
                        <Typography variant="body2" fontWeight={600}>
                          {dept.name}
                        </Typography>
                        <Chip
                          label={`${dept.employees} employees`}
                          size="small"
                          sx={{
                            bgcolor: "rgba(0,0,0,0.05)",
                            fontSize: "0.7rem",
                            height: 20,
                          }}
                        />
                      </Box>
                      <Typography variant="body2" fontWeight={700} sx={{ color: dept.color }}>
                        {dept.productivity}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={dept.productivity}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: "rgba(0,0,0,0.05)",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 5,
                          bgcolor: dept.color,
                          boxShadow: `0 0 10px ${dept.color}50`,
                        },
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Performers */}
        <Grid item xs={12} lg={4}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              border: "1px solid rgba(255,255,255,0.6)",
              background: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(12px)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Top Performers
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 3 }}>
                This month's star employees
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                {[
                  { name: "Sarah Johnson", role: "Senior Developer", score: 98, avatar: "" },
                  { name: "Michael Chen", role: "Sales Manager", score: 96, avatar: "" },
                  { name: "Emily Davis", role: "Marketing Lead", score: 94, avatar: "" },
                  { name: "James Wilson", role: "Product Manager", score: 92, avatar: "" },
                ].map((performer, idx) => (
                  <Box key={idx} sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: idx < 3 ? "primary.main" : "grey.300",
                        color: "white",
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      {idx + 1}
                    </Box>
                    <Avatar sx={{ width: 48, height: 48 }}>{performer.name.charAt(0)}</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {performer.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {performer.role}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${performer.score}`}
                      size="small"
                      sx={{
                        bgcolor: "rgba(255, 193, 7, 0.1)",
                        color: "#f59e0b",
                        fontWeight: 700,
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
