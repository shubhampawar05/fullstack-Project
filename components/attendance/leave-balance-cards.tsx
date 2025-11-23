/**
 * Leave Balance Cards - Premium UI
 * Features: Progress indicators, animations, color-coded leave types
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
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Info,
  TrendingUp,
  TrendingDown,
  EventAvailable,
} from "@mui/icons-material";

interface LeaveBalance {
  type: string;
  label: string;
  icon: string;
  color: string;
  total: number;
  used: number;
  pending: number;
  available: number;
}

interface LeaveBalanceCardsProps {
  balances?: LeaveBalance[];
}

const defaultBalances: LeaveBalance[] = [
  {
    type: "sick",
    label: "Sick Leave",
    icon: "🤒",
    color: "#ef4444",
    total: 12,
    used: 3,
    pending: 1,
    available: 8,
  },
  {
    type: "vacation",
    label: "Vacation",
    icon: "🏖️",
    color: "#3b82f6",
    total: 20,
    used: 8,
    pending: 2,
    available: 10,
  },
  {
    type: "personal",
    label: "Personal Leave",
    icon: "👤",
    color: "#8b5cf6",
    total: 10,
    used: 2,
    pending: 0,
    available: 8,
  },
  {
    type: "maternity",
    label: "Maternity Leave",
    icon: "👶",
    color: "#ec4899",
    total: 180,
    used: 0,
    pending: 0,
    available: 180,
  },
];

export default function LeaveBalanceCards({ balances = defaultBalances }: LeaveBalanceCardsProps) {
  const getUsagePercentage = (balance: LeaveBalance) => {
    return (balance.used / balance.total) * 100;
  };

  const getPendingPercentage = (balance: LeaveBalance) => {
    return (balance.pending / balance.total) * 100;
  };

  const getAvailablePercentage = (balance: LeaveBalance) => {
    return (balance.available / balance.total) * 100;
  };

  return (
    <Grid container spacing={3}>
      {balances.map((balance, idx) => (
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
              {/* Header */}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 3 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2rem",
                    background: `linear-gradient(135deg, ${balance.color}15 0%, ${balance.color}25 100%)`,
                    border: `2px solid ${balance.color}30`,
                  }}
                >
                  {balance.icon}
                </Box>
                <Tooltip title="Leave policy information">
                  <IconButton size="small">
                    <Info fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Leave Type */}
              <Typography variant="h6" fontWeight={700} gutterBottom>
                {balance.label}
              </Typography>

              {/* Available Days - Large Display */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h2" fontWeight={700} sx={{ color: balance.color }}>
                  {balance.available}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Days Available
                </Typography>
              </Box>

              {/* Progress Bar */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Usage
                  </Typography>
                  <Typography variant="caption" fontWeight={600}>
                    {balance.used}/{balance.total}
                  </Typography>
                </Box>
                <Box sx={{ position: "relative", height: 8, borderRadius: 4, bgcolor: "rgba(0,0,0,0.05)" }}>
                  {/* Used portion */}
                  <LinearProgress
                    variant="determinate"
                    value={getUsagePercentage(balance)}
                    sx={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      borderRadius: 4,
                      bgcolor: "transparent",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 4,
                        bgcolor: balance.color,
                      },
                    }}
                  />
                  {/* Pending portion */}
                  {balance.pending > 0 && (
                    <Box
                      sx={{
                        position: "absolute",
                        left: `${getUsagePercentage(balance)}%`,
                        width: `${getPendingPercentage(balance)}%`,
                        height: "100%",
                        borderRadius: 4,
                        bgcolor: `${balance.color}50`,
                      }}
                    />
                  )}
                </Box>
              </Box>

              {/* Stats */}
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip
                  label={`${balance.used} Used`}
                  size="small"
                  sx={{
                    bgcolor: `${balance.color}15`,
                    color: balance.color,
                    fontWeight: 600,
                    fontSize: "0.7rem",
                  }}
                />
                {balance.pending > 0 && (
                  <Chip
                    label={`${balance.pending} Pending`}
                    size="small"
                    sx={{
                      bgcolor: "#f59e0b15",
                      color: "#f59e0b",
                      fontWeight: 600,
                      fontSize: "0.7rem",
                    }}
                  />
                )}
                <Chip
                  label={`${balance.total} Total`}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.7rem",
                  }}
                />
              </Box>

              {/* Trend Indicator */}
              {balance.used > 0 && (
                <Box
                  sx={{
                    mt: 2,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: balance.used > balance.total * 0.7 ? "#fef3c7" : "#d1fae5",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  {balance.used > balance.total * 0.7 ? (
                    <TrendingUp sx={{ fontSize: 16, color: "#f59e0b" }} />
                  ) : (
                    <EventAvailable sx={{ fontSize: 16, color: "#10b981" }} />
                  )}
                  <Typography
                    variant="caption"
                    sx={{
                      color: balance.used > balance.total * 0.7 ? "#f59e0b" : "#10b981",
                      fontWeight: 600,
                    }}
                  >
                    {balance.used > balance.total * 0.7
                      ? "High usage - plan ahead"
                      : "Good balance remaining"}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
