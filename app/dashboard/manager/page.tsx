/**
 * Manager Dashboard - TalentHR
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
  Stack,
  IconButton,
  Chip,
} from "@mui/material";
import {
  Group,
  Assignment,
  CalendarToday,
  TrendingUp,
  MoreVert,
  ArrowForward,
  SupervisorAccount,
} from "@mui/icons-material";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useAuth } from "@/contexts/auth-context";
import ClayCard from "@/components/ui/clay-card";
import ClayButton from "@/components/ui/clay-button";

export default function ManagerDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [stats, setStats] = useState({
    teamMembers: 8,
    pendingLeaveRequests: 2,
    upcomingReviews: 3,
    teamPerformance: 92,
  });

  // Check authentication and role on mount
  useEffect(() => {
    if (authLoading) {
      return; // Still loading, wait
    }

    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }

    // Check if user is manager
    if (user.role !== "manager") {
      router.push(`/dashboard/${user.role || "employee"}`);
      return;
    }

    // Defer state update to avoid synchronous setState in effect
    setTimeout(() => {
      setCheckingAuth(false);
    }, 0);
  }, [authLoading, isAuthenticated, user, router]);

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
    <DashboardLayout role={(user?.role as any) || "manager"}>
      <Container maxWidth="xl" sx={{ pb: 4 }}>
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
            <Box
              sx={{
                p: 2,
                bgcolor: "rgba(255,255,255,0.2)",
                borderRadius: 4,
                backdropFilter: "blur(10px)",
              }}
            >
              <SupervisorAccount sx={{ fontSize: 40, color: "white" }} />
            </Box>
            <Box>
              <Typography variant="h3" component="h1" fontWeight={800} gutterBottom>
                Manager Dashboard
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 500 }}>
                Manage your team, leave requests, and performance reviews
              </Typography>
            </Box>
          </Box>
        </ClayCard>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { title: "Team Members", value: stats.teamMembers, sub: "Direct Reports", icon: <Group />, color: "#6c5ce7" },
            { title: "Leave Requests", value: stats.pendingLeaveRequests, sub: "Pending Approval", icon: <CalendarToday />, color: "#fdcb6e" },
            { title: "Upcoming Reviews", value: stats.upcomingReviews, sub: "This Month", icon: <Assignment />, color: "#00cec9" },
            { title: "Team Performance", value: `${stats.teamPerformance}%`, sub: "Average Score", icon: <TrendingUp />, color: "#55efc4" },
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
                  <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom>
                    {stat.title}
                  </Typography>
                  <Chip
                    label={stat.sub}
                    size="small"
                    sx={{
                      bgcolor: `${stat.color}15`,
                      color: stat.color,
                      fontWeight: 700,
                      height: 24
                    }}
                  />
                </CardContent>
              </ClayCard>
            </Grid>
          ))}
        </Grid>

        {/* Quick Actions & Team Overview */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <ClayCard sx={{ p: 3, height: "100%" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: "#f0f4f8", color: "primary.main" }}>
                  <Assignment />
                </Box>
                <Typography variant="h6" fontWeight={700}>
                  Quick Actions
                </Typography>
              </Box>
              <Stack spacing={2}>
                <ClayButton
                  variant="contained"
                  fullWidth
                  startIcon={<Group />}
                  sx={{ 
                    py: 2, 
                    justifyContent: "flex-start",
                    background: "linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)",
                  }}
                >
                  View Team Members
                </ClayButton>
                <ClayButton
                  variant="outlined"
                  fullWidth
                  startIcon={<CalendarToday />}
                  sx={{ py: 2, justifyContent: "flex-start" }}
                >
                  Review Leave Requests
                </ClayButton>
                <ClayButton
                  variant="outlined"
                  fullWidth
                  startIcon={<TrendingUp />}
                  sx={{ py: 2, justifyContent: "flex-start" }}
                >
                  Generate Performance Reports
                </ClayButton>
              </Stack>
            </ClayCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <ClayCard sx={{ p: 3, height: "100%" }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                <Typography variant="h6" fontWeight={700}>
                  Team Overview
                </Typography>
                <ClayButton variant="text" size="small">View All</ClayButton>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 200, opacity: 0.5 }}>
                <Group sx={{ fontSize: 48, mb: 2, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">
                  Team management features coming soon.
                </Typography>
              </Box>
            </ClayCard>
          </Grid>
        </Grid>
      </Container>
    </DashboardLayout>
  );
}
