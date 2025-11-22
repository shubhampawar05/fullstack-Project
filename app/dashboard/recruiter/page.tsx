/**
 * Recruiter Dashboard - TalentHR
 * Dashboard for Recruiters
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
  Work,
  People,
  Schedule,
  TrendingUp,
  Add,
} from "@mui/icons-material";
import DashboardLayout from "@/components/layout/dashboard-layout";

export default function RecruiterDashboard() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userRole, setUserRole] = useState<string>("");
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalCandidates: 0,
    interviewsScheduled: 0,
    offersPending: 0,
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

        // Check if user is recruiter
        if (data.user?.role !== "recruiter") {
          router.push(`/dashboard/${data.user?.role || "employee"}`);
          return;
        }

        setUserRole(data.user.role);
        setCheckingAuth(false);
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

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
    <DashboardLayout role="recruiter">
      <Container maxWidth="lg">
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
            Recruiter Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage job postings, candidates, and interviews
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
                      Active Jobs
                    </Typography>
                    <Typography variant="h4">{stats.activeJobs}</Typography>
                  </Box>
                  <Work sx={{ fontSize: 40, color: "primary.main" }} />
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
                      Total Candidates
                    </Typography>
                    <Typography variant="h4">{stats.totalCandidates}</Typography>
                  </Box>
                  <People sx={{ fontSize: 40, color: "info.main" }} />
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
                      Interviews Scheduled
                    </Typography>
                    <Typography variant="h4">{stats.interviewsScheduled}</Typography>
                  </Box>
                  <Schedule sx={{ fontSize: 40, color: "warning.main" }} />
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
                      Offers Pending
                    </Typography>
                    <Typography variant="h4">{stats.offersPending}</Typography>
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
                  sx={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                    },
                  }}
                >
                  Post New Job
                </Button>
                <Button variant="outlined">
                  View Candidates
                </Button>
                <Button variant="outlined">
                  Schedule Interview
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Upcoming Interviews
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                No upcoming interviews scheduled.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </DashboardLayout>
  );
}

