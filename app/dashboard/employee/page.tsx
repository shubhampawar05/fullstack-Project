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
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 4,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 10px 40px rgba(118, 75, 162, 0.3)",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "radial-gradient(circle at top right, rgba(255,255,255,0.2) 0%, transparent 60%)",
            }}
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 3, position: "relative", zIndex: 1 }}>
            <Avatar
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                width: 80,
                height: 80,
                fontSize: 32,
                border: "2px solid rgba(255,255,255,0.5)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              }}
            >
              {authUser?.name?.charAt(0)?.toUpperCase() || authUser?.email?.charAt(0)?.toUpperCase() || "E"}
            </Avatar>
            <Box>
              <Typography variant="h3" component="h1" fontWeight={700} sx={{ letterSpacing: "-1px", mb: 0.5 }}>
                Welcome, {authUser?.name?.split(" ")[0] || "Employee"}!
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                {authUser?.email} • {authUser?.role?.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 4,
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                border: "1px solid rgba(255,255,255,0.5)",
                background: "rgba(255, 255, 255, 0.6)",
                backdropFilter: "blur(12px)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2" fontWeight={500}>
                      Leave Balance
                    </Typography>
                    <Typography variant="h4" fontWeight={700} sx={{ my: 1 }}>{stats.leaveBalance}</Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", bgcolor: "rgba(0,0,0,0.05)", px: 1, py: 0.5, borderRadius: 1 }}>
                      Days Available
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: "rgba(102, 126, 234, 0.1)" }}>
                    <AccountBalance sx={{ fontSize: 32, color: "primary.main" }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 4,
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                border: "1px solid rgba(255,255,255,0.5)",
                background: "rgba(255, 255, 255, 0.6)",
                backdropFilter: "blur(12px)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2" fontWeight={500}>
                      Upcoming Events
                    </Typography>
                    <Typography variant="h4" fontWeight={700} sx={{ my: 1 }}>{stats.upcomingEvents}</Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", bgcolor: "rgba(0,0,0,0.05)", px: 1, py: 0.5, borderRadius: 1 }}>
                      Next 7 Days
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: "rgba(2, 136, 209, 0.1)" }}>
                    <CalendarToday sx={{ fontSize: 32, color: "info.main" }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 4,
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                border: "1px solid rgba(255,255,255,0.5)",
                background: "rgba(255, 255, 255, 0.6)",
                backdropFilter: "blur(12px)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2" fontWeight={500}>
                      Pending Tasks
                    </Typography>
                    <Typography variant="h4" fontWeight={700} sx={{ my: 1 }}>{stats.pendingTasks}</Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", bgcolor: "rgba(0,0,0,0.05)", px: 1, py: 0.5, borderRadius: 1 }}>
                      Action Required
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: "rgba(237, 108, 2, 0.1)" }}>
                    <Assignment sx={{ fontSize: 32, color: "warning.main" }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 4,
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                border: "1px solid rgba(255,255,255,0.5)",
                background: "rgba(255, 255, 255, 0.6)",
                backdropFilter: "blur(12px)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2" fontWeight={500}>
                      Attendance
                    </Typography>
                    <Typography variant="h4" fontWeight={700} sx={{ my: 1 }}>{stats.attendance}%</Typography>
                    <Typography variant="caption" sx={{ color: "success.main", bgcolor: "rgba(46, 125, 50, 0.1)", px: 1, py: 0.5, borderRadius: 1 }}>
                      This Month
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: "rgba(46, 125, 50, 0.1)" }}>
                    <Person sx={{ fontSize: 32, color: "success.main" }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                height: "100%",
                borderRadius: 4,
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                border: "1px solid rgba(255,255,255,0.5)",
                background: "rgba(255, 255, 255, 0.6)",
                backdropFilter: "blur(12px)",
              }}
            >
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Quick Actions
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    boxShadow: "0 4px 12px rgba(118, 75, 162, 0.3)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                      boxShadow: "0 6px 16px rgba(118, 75, 162, 0.4)",
                    },
                  }}
                >
                  Request Leave
                </Button>
                <Button 
                  variant="outlined" 
                  size="large"
                  sx={{ 
                    py: 1.5, 
                    borderRadius: 2,
                    borderColor: "rgba(0,0,0,0.12)",
                    color: "text.primary",
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: "rgba(102, 126, 234, 0.04)",
                    }
                  }}
                >
                  View Profile
                </Button>
                <Button 
                  variant="outlined" 
                  size="large"
                  sx={{ 
                    py: 1.5, 
                    borderRadius: 2,
                    borderColor: "rgba(0,0,0,0.12)",
                    color: "text.primary",
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: "rgba(102, 126, 234, 0.04)",
                    }
                  }}
                >
                  View Payslips
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                height: "100%",
                borderRadius: 4,
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                border: "1px solid rgba(255,255,255,0.5)",
                background: "rgba(255, 255, 255, 0.6)",
                backdropFilter: "blur(12px)",
              }}
            >
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Personal Information
              </Typography>
              <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: "rgba(255,255,255,0.5)", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Full Name
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {authUser?.name || "N/A"}
                  </Typography>
                </Box>
                
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: "rgba(255,255,255,0.5)", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Email Address
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {authUser?.email || "N/A"}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box sx={{ flex: 1, p: 2, borderRadius: 2, bgcolor: "rgba(255,255,255,0.5)", border: "1px solid rgba(0,0,0,0.05)" }}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      Role
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {authUser?.role?.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase()) || "N/A"}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ flex: 1, p: 2, borderRadius: 2, bgcolor: "rgba(255,255,255,0.5)", border: "1px solid rgba(0,0,0,0.05)" }}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      Company
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {authUser?.companyName || "N/A"}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </DashboardLayout>
  );
}

