/**
 * Employee Dashboard - TalentHR
 * Soft Claymorphism Design
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Grid,
  CardContent,
  CircularProgress,
  Avatar,
  Stack,
  IconButton,
  Chip,
} from "@mui/material";
import {
  Person,
  CalendarToday,
  Assignment,
  AccountBalance,
  AccessTime,
  MoreVert,
  ArrowForward,
  Notifications,
} from "@mui/icons-material";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useAuth } from "@/contexts/auth-context";
import ClayCard from "@/components/ui/clay-card";
import ClayButton from "@/components/ui/clay-button";

export default function EmployeeDashboard() {
  const router = useRouter();
  const { user: authUser, loading: authLoading, isAuthenticated } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [stats, setStats] = useState({
    leaveBalance: 12,
    upcomingEvents: 3,
    pendingTasks: 5,
    attendance: 98,
  });

  // Check authentication and role on mount
  useEffect(() => {
    if (authLoading) {
      return; // Still loading, wait
    }

    if (!isAuthenticated || !authUser) {
      router.push("/login");
      return;
    }

    if (authUser.role !== "employee") {
      router.push(`/dashboard/${authUser.role || "admin"}`);
      return;
    }

    // Defer state update to avoid synchronous setState in effect
    setTimeout(() => {
      setCheckingAuth(false);
    }, 0);
  }, [authLoading, isAuthenticated, authUser, router]);

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <DashboardLayout role={(authUser?.role as any) || "employee"}>
      <Container maxWidth="lg" sx={{ pb: 4 }}>
        {/* Header */}
        <ClayCard
          sx={{
            p: 4,
            mb: 4,
            background: "linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)",
            color: "white",
            border: "none",
            boxShadow: "12px 12px 24px rgba(108, 92, 231, 0.25), -12px -12px 24px #ffffff",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Avatar
              sx={{
                bgcolor: "white",
                color: "primary.main",
                width: 80,
                height: 80,
                fontSize: 32,
                fontWeight: 700,
                boxShadow: "4px 4px 8px rgba(0,0,0,0.2)",
              }}
            >
              {authUser?.name?.charAt(0)?.toUpperCase() || authUser?.email?.charAt(0)?.toUpperCase() || "E"}
            </Avatar>
            <Box>
              <Typography variant="h3" component="h1" fontWeight={800} gutterBottom>
                Welcome back, {authUser?.name?.split(" ")[0] || "Employee"}!
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 500 }}>
                {authUser?.role?.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())} • {authUser?.companyName || "TalentHR"}
              </Typography>
            </Box>
          </Box>
        </ClayCard>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { title: "Leave Balance", value: stats.leaveBalance, unit: "Days", icon: <AccountBalance />, color: "#6c5ce7" },
            { title: "Upcoming Events", value: stats.upcomingEvents, unit: "Events", icon: <CalendarToday />, color: "#00cec9" },
            { title: "Pending Tasks", value: stats.pendingTasks, unit: "Tasks", icon: <Assignment />, color: "#fdcb6e" },
            { title: "Attendance", value: stats.attendance, unit: "%", icon: <AccessTime />, color: "#55efc4" },
          ].map((stat, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <ClayCard sx={{ height: "100%" }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 3,
                        bgcolor: `${stat.color}15`,
                        color: stat.color,
                        display: "flex",
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <IconButton size="small">
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </Box>
                  <Typography variant="h3" fontWeight={800} sx={{ mb: 0.5 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    {stat.title}
                  </Typography>
                </CardContent>
              </ClayCard>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={4}>
          {/* Quick Actions */}
          <Grid item xs={12} md={8}>
            <ClayCard sx={{ p: 3, height: "100%" }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                <Typography variant="h5" fontWeight={700}>
                  Quick Actions
                </Typography>
                <IconButton>
                  <MoreVert />
                </IconButton>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <ClayButton
                    variant="contained"
                    fullWidth
                    startIcon={<CalendarToday />}
                    sx={{ 
                      py: 2, 
                      justifyContent: "flex-start",
                      background: "linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)",
                    }}
                  >
                    Request Leave
                  </ClayButton>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ClayButton
                    variant="contained"
                    fullWidth
                    startIcon={<AccessTime />}
                    sx={{ 
                      py: 2, 
                      justifyContent: "flex-start",
                      background: "linear-gradient(135deg, #00cec9 0%, #81ecec 100%)",
                    }}
                  >
                    Clock In / Out
                  </ClayButton>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ClayButton
                    variant="outlined"
                    fullWidth
                    startIcon={<Person />}
                    sx={{ py: 2, justifyContent: "flex-start" }}
                  >
                    View Profile
                  </ClayButton>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ClayButton
                    variant="outlined"
                    fullWidth
                    startIcon={<AccountBalance />}
                    sx={{ py: 2, justifyContent: "flex-start" }}
                  >
                    View Payslips
                  </ClayButton>
                </Grid>
              </Grid>
            </ClayCard>
          </Grid>

          {/* Notifications / Updates */}
          <Grid item xs={12} md={4}>
            <ClayCard sx={{ p: 3, height: "100%" }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                <Typography variant="h5" fontWeight={700}>
                  Updates
                </Typography>
                <Chip label="3 New" size="small" color="error" sx={{ borderRadius: 2 }} />
              </Box>
              <Stack spacing={2}>
                {[
                  { title: "Team Meeting", time: "10:00 AM", type: "meeting" },
                  { title: "Payslip Available", time: "Yesterday", type: "info" },
                  { title: "Holiday Reminder", time: "2 days ago", type: "alert" },
                ].map((item, idx) => (
                  <Box 
                    key={idx}
                    sx={{ 
                      p: 2, 
                      borderRadius: 3, 
                      bgcolor: "#f8faff", 
                      display: "flex", 
                      alignItems: "center", 
                      gap: 2 
                    }}
                  >
                    <Box 
                      sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: "50%", 
                        bgcolor: item.type === "meeting" ? "primary.main" : item.type === "info" ? "info.main" : "warning.main" 
                      }} 
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {item.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.time}
                      </Typography>
                    </Box>
                    <ArrowForward fontSize="small" color="action" />
                  </Box>
                ))}
              </Stack>
            </ClayCard>
          </Grid>
        </Grid>
      </Container>
    </DashboardLayout>
  );
}
