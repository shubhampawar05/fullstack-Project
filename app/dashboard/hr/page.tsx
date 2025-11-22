/**
 * HR Manager Dashboard - TalentHR
 * Dashboard for HR Managers
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Button,
} from "@mui/material";
import {
  People,
  Mail,
  TrendingUp,
  Assignment,
  Add,
} from "@mui/icons-material";
import DashboardLayout from "@/components/layout/dashboard-layout";

export default function HRManagerDashboard() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userRole, setUserRole] = useState<string>("");
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeInvitations: 0,
    pendingTasks: 0,
    recentActivity: 0,
  });

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok || response.status === 401) {
          router.push("/login");
          return;
        }

        const data = await response.json();
        if (!data.success) {
          router.push("/login");
          return;
        }

        // Check if user is hr_manager
        if (data.user?.role !== "hr_manager") {
          router.push(`/dashboard/${data.user?.role || "employee"}`);
          return;
        }

        setUserRole(data.user.role);
        setCheckingAuth(false);
        fetchStats();
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  const fetchStats = async () => {
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
          const pendingInvitations = invitationsData.invitations?.filter(
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
  };

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
    <DashboardLayout role="hr_manager">
      <Container maxWidth="lg">
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
            HR Manager Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage employees, invitations, and HR operations
          </Typography>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      Total Employees
                    </Typography>
                    <Typography variant="h4">{stats.totalEmployees}</Typography>
                  </Box>
                  <People sx={{ fontSize: 40, color: "primary.main" }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      Pending Invitations
                    </Typography>
                    <Typography variant="h4">{stats.activeInvitations}</Typography>
                  </Box>
                  <Mail sx={{ fontSize: 40, color: "warning.main" }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      Pending Tasks
                    </Typography>
                    <Typography variant="h4">{stats.pendingTasks}</Typography>
                  </Box>
                  <Assignment sx={{ fontSize: 40, color: "info.main" }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      Recent Activity
                    </Typography>
                    <Typography variant="h4">{stats.recentActivity}</Typography>
                  </Box>
                  <TrendingUp sx={{ fontSize: 40, color: "success.main" }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => router.push("/dashboard/admin")}
                  sx={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                    },
                  }}
                >
                  Send Invitation
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => router.push("/dashboard/users")}
                >
                  Manage Users
                </Button>
                <Button variant="outlined">
                  View Reports
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                No recent activity to display.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </DashboardLayout>
  );
}

