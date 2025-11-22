"use client";

import { useEffect, useState } from "react";
import { Grid, Card, CardContent, Typography, Box, Skeleton } from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { useAuth } from "@/contexts/auth-context";

export default function AttendanceStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    avgHours: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        // Calculate date range for current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

        const res = await fetch(
            `/api/attendance?startDate=${startOfMonth}&endDate=${endOfMonth}&employeeId=${user.employeeId}`
        );
        const data = await res.json();

        if (data.success) {
          const records = data.data;
          
          // Filter for current user if needed (API might return team data for managers)
          const myRecords = records.filter((r: any) => 
            r.employeeId?.userId?._id === user._id || 
            r.employeeId?.userId === user._id ||
            r.employeeId === user.employeeId // Fallback
          );

          const present = myRecords.filter((r: any) => r.status === "Present" || r.status === "Late" || r.status === "Half-day").length;
          const late = myRecords.filter((r: any) => r.status === "Late").length;
          // Absent calculation is tricky without a schedule. For now, we just count explicit "Absent" records if any.
          // Real systems generate "Absent" records for missing days. We'll assume 0 for now or count explicit ones.
          const absent = myRecords.filter((r: any) => r.status === "Absent").length;

          const totalMinutes = myRecords.reduce((acc: number, curr: any) => acc + (curr.workDuration || 0), 0);
          const avgMinutes = present > 0 ? totalMinutes / present : 0;
          const avgHours = Math.round((avgMinutes / 60) * 10) / 10;

          setStats({
            present,
            absent,
            late,
            avgHours,
          });
        }
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const statCards = [
    {
      title: "Present Days",
      value: stats.present,
      icon: <CheckCircleIcon sx={{ fontSize: 40, color: "success.main", opacity: 0.8 }} />,
      color: "success.main",
      subtitle: "This Month",
    },
    {
      title: "Average Hours",
      value: `${stats.avgHours}h`,
      icon: <AccessTimeIcon sx={{ fontSize: 40, color: "primary.main", opacity: 0.8 }} />,
      color: "primary.main",
      subtitle: "Per Day",
    },
    {
      title: "Late Arrivals",
      value: stats.late,
      icon: <WarningIcon sx={{ fontSize: 40, color: "warning.main", opacity: 0.8 }} />,
      color: "warning.main",
      subtitle: "This Month",
    },
    {
      title: "Absent Days",
      value: stats.absent,
      icon: <CancelIcon sx={{ fontSize: 40, color: "error.main", opacity: 0.8 }} />,
      color: "error.main",
      subtitle: "This Month",
    },
  ];

  return (
    <Grid container spacing={3}>
      {statCards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card
            elevation={0}
            sx={{
              height: "100%",
              borderRadius: 4,
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              border: "1px solid rgba(255,255,255,0.5)",
              background: "rgba(255, 255, 255, 0.6)",
              backdropFilter: "blur(12px)",
              transition: "transform 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2" fontWeight={500}>
                    {card.title}
                  </Typography>
                  {loading ? (
                    <Skeleton variant="text" width={60} height={40} />
                  ) : (
                    <Typography variant="h4" fontWeight="bold" sx={{ color: card.color, my: 1 }}>
                      {card.value}
                    </Typography>
                  )}
                  <Typography variant="caption" sx={{ color: "text.secondary", bgcolor: "rgba(0,0,0,0.04)", px: 1, py: 0.5, borderRadius: 1 }}>
                    {card.subtitle}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: `${card.color}15` }}>
                  {card.icon}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
