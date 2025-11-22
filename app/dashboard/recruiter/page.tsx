/**
 * Recruiter Dashboard - TalentHR
 * Dashboard for Recruiters
 */

"use client";

import { useState, useEffect, useCallback } from "react";
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
  Tabs,
  Tab,
} from "@mui/material";
import { Work, People, Schedule, TrendingUp } from "@mui/icons-material";
import DashboardLayout from "@/components/layout/dashboard-layout";
import JobList from "@/components/recruitment/job-list";
import CandidateList from "@/components/recruitment/candidate-list";
import InterviewList from "@/components/recruitment/interview-list";

export default function RecruiterDashboard() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userRole, setUserRole] = useState<string>("");
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalCandidates: 0,
    interviewsScheduled: 0,
    offersPending: 0,
  });

  const fetchStats = useCallback(async () => {
    try {
      // Fetch all jobs (not closed or cancelled)
      const jobsResponse = await fetch("/api/jobs", {
        credentials: "include",
      });
      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        if (jobsData.success) {
          // Count active jobs (published and draft, excluding closed and cancelled)
          const activeJobs =
            jobsData.jobs?.filter(
              (job: any) => job.status === "published" || job.status === "draft"
            ).length || 0;
          setStats((prev) => ({
            ...prev,
            activeJobs,
          }));
        } else {
          console.error("Failed to fetch jobs:", jobsData.message);
        }
      } else {
        console.error(
          "Jobs API error:",
          jobsResponse.status,
          jobsResponse.statusText
        );
      }

      // Fetch candidates
      const candidatesResponse = await fetch("/api/candidates", {
        credentials: "include",
      });
      if (candidatesResponse.ok) {
        const candidatesData = await candidatesResponse.json();
        if (candidatesData.success) {
          setStats((prev) => ({
            ...prev,
            totalCandidates: candidatesData.candidates?.length || 0,
            offersPending:
              candidatesData.candidates?.filter(
                (c: any) => c.status === "offer"
              ).length || 0,
          }));
        }
      }

      // Fetch interviews
      const interviewsResponse = await fetch(
        "/api/interviews?status=scheduled",
        {
          credentials: "include",
        }
      );
      if (interviewsResponse.ok) {
        const interviewsData = await interviewsResponse.json();
        if (interviewsData.success) {
          setStats((prev) => ({
            ...prev,
            interviewsScheduled: interviewsData.interviews?.length || 0,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

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
        fetchStats();
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/login");
      }
    };

    checkAuth();
  }, [router, fetchStats]);

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
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      color="text.secondary"
                      gutterBottom
                      variant="body2"
                    >
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
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      color="text.secondary"
                      gutterBottom
                      variant="body2"
                    >
                      Total Candidates
                    </Typography>
                    <Typography variant="h4">
                      {stats.totalCandidates}
                    </Typography>
                  </Box>
                  <People sx={{ fontSize: 40, color: "info.main" }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      color="text.secondary"
                      gutterBottom
                      variant="body2"
                    >
                      Interviews Scheduled
                    </Typography>
                    <Typography variant="h4">
                      {stats.interviewsScheduled}
                    </Typography>
                  </Box>
                  <Schedule sx={{ fontSize: 40, color: "warning.main" }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      color="text.secondary"
                      gutterBottom
                      variant="body2"
                    >
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

        {/* Seed Data Button (Development Only) */}
        <Paper
          sx={{
            p: 2,
            mb: 3,
            bgcolor: "info.light",
            color: "info.contrastText",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2">
              Need sample data? Click the button below to seed the database with
              dummy recruitment data.
            </Typography>
            <Button
              variant="contained"
              color="inherit"
              onClick={async () => {
                try {
                  const response = await fetch("/api/seed/recruitment", {
                    method: "POST",
                    credentials: "include",
                  });
                  const data = await response.json();
                  if (data.success) {
                    alert(
                      `Successfully seeded:\n- ${data.data.jobs} jobs\n- ${data.data.candidates} candidates\n- ${data.data.interviews} interviews`
                    );
                    fetchStats();
                    window.location.reload();
                  } else {
                    alert(`Error: ${data.message}`);
                  }
                } catch (error) {
                  alert("Failed to seed data. Please try again.");
                }
              }}
              sx={{ ml: 2 }}
            >
              Seed Dummy Data
            </Button>
          </Box>
        </Paper>

        {/* Tabs for different sections */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab icon={<Work />} iconPosition="start" label="Job Postings" />
            <Tab icon={<People />} iconPosition="start" label="Candidates" />
            <Tab icon={<Schedule />} iconPosition="start" label="Interviews" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {activeTab === 0 && <JobList onRefresh={fetchStats} />}
        {activeTab === 1 && <CandidateList onRefresh={fetchStats} />}
        {activeTab === 2 && <InterviewList onRefresh={fetchStats} />}
      </Container>
    </DashboardLayout>
  );
}
