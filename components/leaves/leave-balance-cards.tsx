/**
 * Leave Balance Cards - TalentHR
 * Display leave balances with progress indicators
 */

"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  LinearProgress,
  Chip,
} from "@mui/material";
import { BeachAccess, Sick, Event } from "@mui/icons-material";

export default function LeaveBalanceCards() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [balances, setBalances] = useState<any[]>([]);

  useEffect(() => {
    fetchBalances();
  }, []);

  const fetchBalances = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/leaves/balance", {
        credentials: "include",
      });
      const data = await response.json();

      if (!data.success) {
        setError(data.message);
        return;
      }

      setBalances(data.balances || []);
    } catch (err) {
      setError("Failed to load leave balances");
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (code: string) => {
    if (code.includes("SL") || code.includes("SICK")) return <Sick />;
    if (code.includes("VL") || code.includes("VAC")) return <BeachAccess />;
    return <Event />;
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (balances.length === 0) {
    return (
      <Alert severity="info">
        No leave types configured. Contact HR to set up leave policies.
      </Alert>
    );
  }

  return (
    <Grid container spacing={3}>
      {balances.map((balance) => {
        const usagePercentage = (balance.usedDays / balance.totalDays) * 100;
        const pendingPercentage = (balance.pendingDays / balance.totalDays) * 100;
        const availablePercentage = (balance.availableDays / balance.totalDays) * 100;

        return (
          <Grid item xs={12} sm={6} md={4} key={balance.id}>
            <Paper
              sx={{
                p: 3,
                height: "100%",
                borderLeft: `4px solid ${balance.leaveType.color}`,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Box
                  sx={{
                    mr: 2,
                    color: balance.leaveType.color,
                  }}
                >
                  {getIcon(balance.leaveType.code)}
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" fontWeight={600}>
                    {balance.leaveType.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {balance.leaveType.code}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Available
                  </Typography>
                  <Typography variant="h5" fontWeight={600} color="primary">
                    {balance.availableDays}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={availablePercentage}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#e0e0e0",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: balance.leaveType.color,
                    },
                  }}
                />
              </Box>

              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">
                    Total
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {balance.totalDays}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">
                    Used
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="error">
                    {balance.usedDays}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">
                    Pending
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="warning.main">
                    {balance.pendingDays}
                  </Typography>
                </Grid>
              </Grid>

              {balance.carriedForward > 0 && (
                <Chip
                  label={`+${balance.carriedForward} carried forward`}
                  size="small"
                  sx={{ mt: 2 }}
                  color="info"
                />
              )}
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
}
