/**
 * Recruiter Dashboard - TalentHR
 * Soft Claymorphism Design
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
  Box,
  Container,
  Typography,
  Grid,
  CardContent,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Chip,
} from "@mui/material";
import { Work, People, Schedule, TrendingUp, MoreVert, Business } from "@mui/icons-material";
import DashboardLayout from "@/components/layout/dashboard-layout";
import JobList from "@/components/recruitment/job-list";
import CandidateList from "@/components/recruitment/candidate-list";
import InterviewList from "@/components/recruitment/interview-list";
import ClayCard from "@/components/ui/clay-card";
import ClayButton from "@/components/ui/clay-button";

export default function RecruiterDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);
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
        }
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

  // Check authentication and role on mount
  useEffect(() => {
    if (authLoading) {
      return; // Still loading, wait
    }

    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }

    // Check if user is recruiter
    if (user.role !== "recruiter") {
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
    <DashboardLayout role="recruiter">
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
              <Work sx={{ fontSize: 40, color: "white" }} />
            </Box>
            <Box>
              <Typography variant="h3" component="h1" fontWeight={800} gutterBottom>
                Recruiter Dashboard
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 500 }}>
                Manage job postings, candidates, and interviews
              </Typography>
            </Box>
          </Box>
        </ClayCard>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { title: "Active Jobs", value: stats.activeJobs, sub: "Open Positions", icon: <Work />, color: "#6c5ce7" },
            { title: "Total Candidates", value: stats.totalCandidates, sub: "In Pipeline", icon: <People />, color: "#fdcb6e" },
            { title: "Interviews", value: stats.interviewsScheduled, sub: "Scheduled", icon: <Schedule />, color: "#00cec9" },
            { title: "Offers Pending", value: stats.offersPending, sub: "Awaiting Response", icon: <TrendingUp />, color: "#55efc4" },
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

        {/* Seed Data Button (Development Only) */}
        <ClayCard
          sx={{
            p: 2,
            mb: 4,
            bgcolor: "#e3f2fd",
            border: "1px solid #90caf9",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ p: 1, bgcolor: "white", borderRadius: 2, color: "info.main" }}>
                <TrendingUp />
              </Box>
              <Typography variant="body2" fontWeight={600} color="info.dark">
                Need sample data? Seed the database with dummy recruitment data.
              </Typography>
            </Box>
            <ClayButton
              variant="contained"
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
              sx={{ bgcolor: "info.main", "&:hover": { bgcolor: "info.dark" } }}
            >
              Seed Dummy Data
            </ClayButton>
          </Box>
        </ClayCard>

        {/* Tabs & Content */}
        <ClayCard sx={{ p: 0, overflow: "hidden" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2, pt: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{
                "& .MuiTabs-indicator": {
                  height: 3,
                  borderRadius: "3px 3px 0 0",
                  bgcolor: "primary.main",
                },
              }}
            >
              <Tab 
                icon={<Work />} 
                iconPosition="start" 
                label="Job Postings" 
                sx={{ fontWeight: 600, minHeight: 60 }} 
              />
              <Tab 
                icon={<People />} 
                iconPosition="start" 
                label="Candidates" 
                sx={{ fontWeight: 600, minHeight: 60 }} 
              />
              <Tab 
                icon={<Schedule />} 
                iconPosition="start" 
                label="Interviews" 
                sx={{ fontWeight: 600, minHeight: 60 }} 
              />
            </Tabs>
          </Box>
          <Box sx={{ p: 3 }}>
            {activeTab === 0 && <JobList onRefresh={fetchStats} />}
            {activeTab === 1 && <CandidateList onRefresh={fetchStats} />}
            {activeTab === 2 && <InterviewList onRefresh={fetchStats} />}
          </Box>
        </ClayCard>
      </Container>
    </DashboardLayout>
  );
}
