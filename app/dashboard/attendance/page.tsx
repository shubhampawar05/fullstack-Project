/**
 * Attendance Dashboard - TalentHR
 * Redesigned with better UI and proper calendar data
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  Schedule,
  TrendingUp,
  AccessTime,
  CalendarMonth,
  EventNote,
} from "@mui/icons-material";
import DashboardLayout from "@/components/layout/dashboard-layout";
import AttendanceClock from "@/components/attendance/attendance-clock";
import AttendanceCalendar from "@/components/attendance/attendance-calendar";
import LeaveBalanceCards from "@/components/attendance/leave-balance-cards";
import LeaveRequestForm from "@/components/attendance/leave-request-form";
import { useAuth } from "@/contexts/auth-context";

export default function AttendancePage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);

  // Generate realistic attendance data for the current month
  const generateAttendanceData = () => {
    const data = [];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dayOfWeek = date.getDay();
      
      // Skip future dates
      if (date > today) continue;

      // Weekend
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        data.push({
          date,
          status: "weekend" as const,
        });
        continue;
      }

      // Random attendance pattern
      const rand = Math.random();
      if (rand > 0.9) {
        data.push({
          date,
          status: "absent" as const,
        });
      } else if (rand > 0.85) {
        data.push({
          date,
          status: "leave" as const,
        });
      } else if (rand > 0.75) {
        data.push({
          date,
          status: "late" as const,
          clockIn: "09:30 AM",
          clockOut: "06:15 PM",
          workHours: 8.75,
        });
      } else {
        data.push({
          date,
          status: "present" as const,
          clockIn: "09:00 AM",
          clockOut: "06:00 PM",
          workHours: 9,
        });
      }
    }

    return data;
  };

  const attendanceData = generateAttendanceData();

  // Calculate stats
  const stats = {
    present: attendanceData.filter(d => d.status === "present").length,
    absent: attendanceData.filter(d => d.status === "absent").length,
    late: attendanceData.filter(d => d.status === "late").length,
    leaves: attendanceData.filter(d => d.status === "leave").length,
    avgHours: 8.5,
    totalWorkingDays: attendanceData.filter(d => d.status !== "weekend").length,
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }
    setTimeout(() => setCheckingAuth(false), 0);
  }, [authLoading, isAuthenticated, user, router]);

  if (checkingAuth) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <DashboardLayout role={(user?.role as any) || "employee"}>
      <Container maxWidth="xl" sx={{ pb: 4 }}>
        {/* Hero Header */}
        <Paper
          elevation={0}
          sx={{
            p: 5,
            mb: 4,
            borderRadius: 4,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(118, 75, 162, 0.4)",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)",
              animation: "pulse 4s ease-in-out infinite",
              "@keyframes pulse": {
                "0%, 100%": { transform: "scale(1)", opacity: 0.5 },
                "50%": { transform: "scale(1.1)", opacity: 0.8 },
              },
            }}
          />
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="h3" fontWeight={700} gutterBottom sx={{ letterSpacing: "-1px" }}>
                  Attendance & Time Tracking
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 400, mb: 3 }}>
                  Track your attendance, working hours, and manage leaves
                </Typography>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <Chip label={`${stats.present} Days Present`} sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 600 }} />
                  <Chip label={`${stats.leaves} Leaves`} sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 600 }} />
                  <Chip label={`${stats.avgHours} Avg Hours`} sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 600 }} />
                </Box>
              </Box>
              <Button
                variant="contained"
                startIcon={<EventNote />}
                onClick={() => setLeaveDialogOpen(true)}
                sx={{
                  bgcolor: "white",
                  color: "#667eea",
                  fontWeight: 600,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                }}
              >
                Request Leave
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { title: "Days Present", value: stats.present, icon: <CheckCircle />, color: "#10b981", subtitle: "This month" },
            { title: "Days Absent", value: stats.absent, icon: <Cancel />, color: "#ef4444", subtitle: "This month" },
            { title: "Late Arrivals", value: stats.late, icon: <Schedule />, color: "#f59e0b", subtitle: "This month" },
            { title: "Leaves Taken", value: stats.leaves, icon: <CalendarMonth />, color: "#8b5cf6", subtitle: "This month" },
          ].map((stat, idx) => (
            <Grid item xs={12} sm={6} lg={3} key={idx}>
              <Card elevation={0} sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", background: "rgba(255, 255, 255, 0.7)", backdropFilter: "blur(12px)", transition: "all 0.3s", "&:hover": { transform: "translateY(-8px)" } }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: 3, background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}25 100%)` }}>
                      <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>{stat.title}</Typography>
                  <Typography variant="h3" fontWeight={700}>{stat.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{stat.subtitle}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {/* Attendance Clock */}
          <Grid item xs={12} lg={4}>
            <AttendanceClock employeeName={user?.firstName || "User"} />
          </Grid>

          {/* Leave Balance */}
          <Grid item xs={12} lg={8}>
            <LeaveBalanceCards />
          </Grid>

          {/* Attendance Calendar */}
          <Grid item xs={12}>
            <AttendanceCalendar 
              attendanceData={attendanceData}
              onDateClick={(date) => console.log("Date clicked:", date)}
            />
          </Grid>
        </Grid>

        {/* Leave Request Dialog */}
        <LeaveRequestForm
          open={leaveDialogOpen}
          onClose={() => setLeaveDialogOpen(false)}
          onSubmit={(data) => {
            console.log("Leave request:", data);
            setLeaveDialogOpen(false);
          }}
        />
      </Container>
    </DashboardLayout>
  );
}
