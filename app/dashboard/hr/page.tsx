/**
 * HR Manager Dashboard - TalentHR
 * Soft Claymorphism Design
 */

"use client";

import { useState, useEffect, useCallback } from "react";
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
  People,
  Mail,
  TrendingUp,
  Assignment,
  Add,
  MoreVert,
  ArrowForward,
  Business,
} from "@mui/icons-material";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useAuth } from "@/contexts/auth-context";
import ClayCard from "@/components/ui/clay-card";
import ClayButton from "@/components/ui/clay-button";

export default function HRManagerDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeInvitations: 0,
    pendingTasks: 5,
    recentActivity: 12,
  });

  const fetchStats = useCallback(async () => {
    try {
      // Fetch users count
      const usersResponse = await fetch("/api/users?status=active", {
        credentials: "include",
      });
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        if (usersData.success) {
          setStats((prev) => ({
            ...prev,
            totalEmployees: usersData.total || 0,
          }));
        }
      }

      // Fetch invitations count
      const invitationsResponse = await fetch("/api/invitations", {
        credentials: "include",
      });
      if (invitationsResponse.ok) {
        const invitationsData = await invitationsResponse.json();
        if (invitationsData.success) {
          const pendingInvitations =
            invitationsData.invitations?.filter(
              (inv: any) => inv.status === "pending"
            ).length || 0;
          setStats((prev) => ({
            ...prev,
            activeInvitations: pendingInvitations,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  // Check authentication and role on mount
  useEffect(() => {
    if (authLoading) {
      return; // Still loading, wait
    }

    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }

    // Check if user is hr_manager
    if (user.role !== "hr_manager") {
      router.push(`/dashboard/${user.role || "employee"}`);
      return;
    }

    // Defer state update to avoid synchronous setState in effect
    setTimeout(() => {
      setCheckingAuth(false);
      fetchStats();
    }, 0);
  }, [authLoading, isAuthenticated, user, router, fetchStats]);

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
    <DashboardLayout role={(user?.role as any) || "hr_manager"}>
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
              <Business sx={{ fontSize: 40, color: "white" }} />
            </Box>
            <Box>
              <Typography variant="h3" component="h1" fontWeight={800} gutterBottom>
                HR Dashboard
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 500 }}>
                Manage employees, invitations, and HR operations
              </Typography>
            </Box>
          </Box>
        </ClayCard>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { title: "Total Employees", value: stats.totalEmployees, sub: "Active Staff", icon: <People />, color: "#6c5ce7" },
            { title: "Pending Invites", value: stats.activeInvitations, sub: "Awaiting Response", icon: <Mail />, color: "#fdcb6e" },
            { title: "Pending Tasks", value: stats.pendingTasks, sub: "To Review", icon: <Assignment />, color: "#00cec9" },
            { title: "Recent Activity", value: stats.recentActivity, sub: "This Week", icon: <TrendingUp />, color: "#55efc4" },
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

        {/* Quick Actions & Activity */}
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
                  startIcon={<Add />}
                  onClick={() => router.push("/dashboard/invitations")}
                  sx={{ 
                    py: 2, 
                    justifyContent: "flex-start",
                    background: "linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)",
                  }}
                >
                  Send New Invitation
                </ClayButton>
                <ClayButton
                  variant="outlined"
                  fullWidth
                  startIcon={<People />}
                  onClick={() => router.push("/dashboard/users")}
                  sx={{ py: 2, justifyContent: "flex-start" }}
                >
                  Manage Users
                </ClayButton>
                <ClayButton
                  variant="outlined"
                  fullWidth
                  startIcon={<Assignment />}
                  sx={{ py: 2, justifyContent: "flex-start" }}
                >
                  View Reports
                </ClayButton>
              </Stack>
            </ClayCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <ClayCard sx={{ p: 3, height: "100%" }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                <Typography variant="h6" fontWeight={700}>
                  Recent Activity
                </Typography>
                <ClayButton variant="text" size="small">View All</ClayButton>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 200, opacity: 0.5 }}>
                <Assignment sx={{ fontSize: 48, mb: 2, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">
                  No recent activity to display.
                </Typography>
              </Box>
            </ClayCard>
          </Grid>
        </Grid>
      </Container>
    </DashboardLayout>
  );
}
