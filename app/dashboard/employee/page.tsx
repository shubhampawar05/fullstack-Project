/**
 * Employee Dashboard - TalentHR
 * Dashboard for Employees
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
  Avatar,
} from "@mui/material";
import {
  Person,
  CalendarToday,
  Assignment,
  AccountBalance,
} from "@mui/icons-material";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useAuth } from "@/contexts/auth-context";

export default function EmployeeDashboard() {
  const router = useRouter();
  const { user: authUser, loading: authLoading, isAuthenticated } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [stats, setStats] = useState({
    leaveBalance: 0,
    upcomingEvents: 0,
    pendingTasks: 0,
    attendance: 0,
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

    // Check if user is employee
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
      <Container maxWidth="lg">
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: "primary.main",
                width: 64,
                height: 64,
                fontSize: 24,
              }}
            >
              {authUser?.name?.charAt(0)?.toUpperCase() || authUser?.email?.charAt(0)?.toUpperCase() || "E"}
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" fontWeight={600}>
                Welcome, {authUser?.name || "Employee"}!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {authUser?.email}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      Leave Balance
                    </Typography>
                    <Typography variant="h4">{stats.leaveBalance}</Typography>
                  </Box>
                  <AccountBalance sx={{ fontSize: 40, color: "primary.main" }} />
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
                      Upcoming Events
                    </Typography>
                    <Typography variant="h4">{stats.upcomingEvents}</Typography>
                  </Box>
                  <CalendarToday sx={{ fontSize: 40, color: "info.main" }} />
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
                  <Assignment sx={{ fontSize: 40, color: "warning.main" }} />
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
                      Attendance
                    </Typography>
                    <Typography variant="h4">{stats.attendance}%</Typography>
                  </Box>
                  <Person sx={{ fontSize: 40, color: "success.main" }} />
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
                  sx={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                    },
                  }}
                >
                  Request Leave
                </Button>
                <Button variant="outlined">
                  View Profile
                </Button>
                <Button variant="outlined">
                  View Payslips
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Name:</strong> {authUser?.name || "N/A"}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Email:</strong> {authUser?.email || "N/A"}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Role:</strong> {authUser?.role?.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase()) || "N/A"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Company:</strong> {authUser?.companyName || "N/A"}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </DashboardLayout>
  );
}

