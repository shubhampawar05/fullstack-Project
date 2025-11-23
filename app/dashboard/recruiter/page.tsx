/**
 * Recruitment Dashboard - TalentHR
 * Modern recruitment management with job postings and candidate pipeline
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
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
  Chip,
  IconButton,
  LinearProgress,
  AvatarGroup,
  Divider,
} from "@mui/material";
import {
  Work,
  People,
  TrendingUp,
  Add,
  LocationOn,
  AccessTime,
  AttachMoney,
  MoreVert,
  Visibility,
  Edit,
  Share,
  Star,
  Schedule,
  CheckCircle,
} from "@mui/icons-material";
import DashboardLayout from "@/components/layout/dashboard-layout";
import {
  dummyJobs,
  dummyCandidates,
} from "@/utils/dummyData";

export default function RecruitmentDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [selectedTab, setSelectedTab] = useState<"active" | "closed" | "draft">("active");

  // Filter jobs by status
  const activeJobs = dummyJobs.filter(j => j.status === 'Active');
  const closedJobs = dummyJobs.filter(j => j.status === 'Closed');
  const draftJobs = dummyJobs.filter(j => j.status === 'Draft');

  const displayedJobs = selectedTab === 'active' ? activeJobs : selectedTab === 'closed' ? closedJobs : draftJobs;

  // Calculate stats
  const stats = {
    totalJobs: activeJobs.length,
    totalCandidates: dummyCandidates.length,
    inInterview: dummyCandidates.filter(c => c.stage === 'Interview').length,
    offered: dummyCandidates.filter(c => c.stage === 'Offer').length,
  };

  // Candidate pipeline stages
  const pipelineStages = [
    { name: 'Applied', count: dummyCandidates.filter(c => c.stage === 'Applied').length, color: '#6b7280' },
    { name: 'Screening', count: dummyCandidates.filter(c => c.stage === 'Screening').length, color: '#3b82f6' },
    { name: 'Interview', count: dummyCandidates.filter(c => c.stage === 'Interview').length, color: '#f59e0b' },
    { name: 'Offer', count: dummyCandidates.filter(c => c.stage === 'Offer').length, color: '#10b981' },
    { name: 'Hired', count: dummyCandidates.filter(c => c.stage === 'Hired').length, color: '#667eea' },
  ];

  // Recent candidates
  const recentCandidates = dummyCandidates
    .sort((a, b) => new Date(b.appliedOn).getTime() - new Date(a.appliedOn).getTime())
    .slice(0, 5);

  // Check authentication
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

  const getStageColor = (stage: string) => {
    const stageObj = pipelineStages.find(s => s.name === stage);
    return stageObj?.color || '#6b7280';
  };

  return (
    <DashboardLayout role="recruiter">
      <Container maxWidth="xl" sx={{ pb: 4 }}>
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
            boxShadow: "0 20px 60px rgba(118, 75, 162, 0.4)",
          }}
        >
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
              <Box>
                <Typography variant="h4" fontWeight={700} gutterBottom sx={{ letterSpacing: "-0.5px" }}>
                  Recruitment Management
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.95, mb: 2 }}>
                  Manage job postings and track candidate pipeline
                </Typography>
                <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                  <Chip
                    label={`${stats.totalJobs} Active Jobs`}
                    sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 600 }}
                  />
                  <Chip
                    label={`${stats.totalCandidates} Total Candidates`}
                    sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 600 }}
                  />
                  <Chip
                    label={`${stats.inInterview} In Interview`}
                    sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 600 }}
                  />
                </Box>
              </Box>
              <Button
                variant="contained"
                size="large"
                startIcon={<Add />}
                sx={{
                  bgcolor: "white",
                  color: "primary.main",
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.9)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                  },
                }}
              >
                Post New Job
              </Button>
            </Box>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              {[
                { label: "Active Jobs", value: stats.totalJobs, icon: <Work />, color: "#667eea", change: "+3" },
                { label: "Total Candidates", value: stats.totalCandidates, icon: <People />, color: "#10b981", change: "+24" },
                { label: "In Interview", value: stats.inInterview, icon: <Schedule />, color: "#f59e0b", change: "+5" },
                { label: "Offers Made", value: stats.offered, icon: <CheckCircle />, color: "#ef4444", change: "+2" },
              ].map((stat, idx) => (
                <Grid item xs={12} sm={6} md={3} key={idx}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                      border: "1px solid rgba(255,255,255,0.6)",
                      background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)`,
                      backdropFilter: "blur(12px)",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: `0 8px 24px ${stat.color}30`,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            {stat.label}
                          </Typography>
                          <Typography variant="h4" fontWeight={700} sx={{ color: stat.color, my: 0.5 }}>
                            {stat.value}
                          </Typography>
                          <Chip
                            label={stat.change}
                            size="small"
                            sx={{
                              bgcolor: `${stat.color}20`,
                              color: stat.color,
                              fontWeight: 600,
                              height: 20,
                              fontSize: 11,
                            }}
                          />
                        </Box>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: `${stat.color}20`,
                            color: stat.color,
                          }}
                        >
                          {stat.icon}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Candidate Pipeline */}
          <Grid item xs={12}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                border: "1px solid rgba(255,255,255,0.6)",
                background: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(12px)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Candidate Pipeline
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {pipelineStages.map((stage, idx) => (
                    <Grid item xs={12} sm={6} md={2.4} key={idx}>
                      <Box
                        sx={{
                          p: 2.5,
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${stage.color}15 0%, ${stage.color}05 100%)`,
                          border: `2px solid ${stage.color}30`,
                          textAlign: "center",
                          position: "relative",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: `0 8px 24px ${stage.color}40`,
                          },
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: "block", mb: 1 }}>
                          {stage.name}
                        </Typography>
                        <Typography variant="h3" fontWeight={700} sx={{ color: stage.color }}>
                          {stage.count}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          candidates
                        </Typography>
                        {idx < pipelineStages.length - 1 && (
                          <Box
                            sx={{
                              position: "absolute",
                              right: -16,
                              top: "50%",
                              transform: "translateY(-50%)",
                              fontSize: 24,
                              color: "text.secondary",
                              display: { xs: "none", md: "block" },
                            }}
                          >
                            →
                          </Box>
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Job Listings */}
          <Grid item xs={12}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                border: "1px solid rgba(255,255,255,0.6)",
                background: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(12px)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                  <Typography variant="h6" fontWeight={700}>
                    Job Postings
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {["active", "closed", "draft"].map((tab) => (
                      <Chip
                        key={tab}
                        label={tab.charAt(0).toUpperCase() + tab.slice(1)}
                        onClick={() => setSelectedTab(tab as any)}
                        variant={selectedTab === tab ? "filled" : "outlined"}
                        color={selectedTab === tab ? "primary" : "default"}
                        sx={{ fontWeight: 600, textTransform: "capitalize" }}
                      />
                    ))}
                  </Box>
                </Box>
                <Grid container spacing={2}>
                  {displayedJobs.map((job, idx) => (
                    <Grid item xs={12} sm={6} lg={4} key={idx}>
                      <Card
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          border: "1px solid rgba(0,0,0,0.08)",
                          background: "white",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            transform: "translateY(-6px)",
                            boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                            borderColor: "primary.main",
                          },
                        }}
                      >
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 2 }}>
                          <Chip
                            label={job.department}
                            size="small"
                            sx={{
                              bgcolor: "rgba(102, 126, 234, 0.1)",
                              color: "#667eea",
                              fontWeight: 600,
                            }}
                          />
                          <IconButton size="small">
                            <MoreVert fontSize="small" />
                          </IconButton>
                        </Box>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                          {job.title}
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <LocationOn sx={{ fontSize: 16, color: "text.secondary" }} />
                            <Typography variant="caption" color="text.secondary">
                              {job.location}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <AccessTime sx={{ fontSize: 16, color: "text.secondary" }} />
                            <Typography variant="caption" color="text.secondary">
                              {job.type} • {job.experience}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <AttachMoney sx={{ fontSize: 16, color: "text.secondary" }} />
                            <Typography variant="caption" color="text.secondary">
                              {job.salary}
                            </Typography>
                          </Box>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Applicants
                            </Typography>
                            <Typography variant="h6" fontWeight={700} color="primary">
                              {job.applicants}
                            </Typography>
                          </Box>
                          <AvatarGroup max={3} sx={{ "& .MuiAvatar-root": { width: 32, height: 32, fontSize: 14 } }}>
                            {dummyCandidates
                              .filter(c => c.jobId === job.id)
                              .slice(0, 3)
                              .map((candidate, i) => (
                                <Avatar key={i} src={candidate.avatar} />
                              ))}
                          </AvatarGroup>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(job.applicants / 50) * 100}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            mb: 2,
                            bgcolor: "rgba(0,0,0,0.05)",
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 3,
                              background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                            },
                          }}
                        />
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Button
                            variant="contained"
                            size="small"
                            fullWidth
                            startIcon={<Visibility />}
                            sx={{ borderRadius: 2 }}
                          >
                            View
                          </Button>
                          <IconButton size="small" sx={{ border: "1px solid rgba(0,0,0,0.1)" }}>
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton size="small" sx={{ border: "1px solid rgba(0,0,0,0.1)" }}>
                            <Share fontSize="small" />
                          </IconButton>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Candidates */}
          <Grid item xs={12}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                border: "1px solid rgba(255,255,255,0.6)",
                background: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(12px)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Recent Candidates
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                  {recentCandidates.map((candidate, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        border: "1px solid rgba(0,0,0,0.08)",
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          transform: "translateX(4px)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        },
                      }}
                    >
                      <Avatar src={candidate.avatar} sx={{ width: 56, height: 56, border: "3px solid #f0f0f0" }} />
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                          <Typography variant="body1" fontWeight={700}>
                            {candidate.name}
                          </Typography>
                          {candidate.rating && (
                            <Chip
                              icon={<Star sx={{ fontSize: 14 }} />}
                              label={candidate.rating.toFixed(1)}
                              size="small"
                              sx={{
                                bgcolor: "rgba(255, 193, 7, 0.1)",
                                color: "#f59e0b",
                                fontWeight: 600,
                                height: 20,
                              }}
                            />
                          )}
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                          {candidate.currentRole} at {candidate.currentCompany} • {candidate.experience} years exp
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Applied: {new Date(candidate.appliedOn).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Chip
                          label={candidate.stage}
                          size="small"
                          sx={{
                            bgcolor: `${getStageColor(candidate.stage)}20`,
                            color: getStageColor(candidate.stage),
                            fontWeight: 600,
                            mb: 1,
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                          {candidate.expectedSalary}
                        </Typography>
                      </Box>
                      <Button variant="outlined" size="small" sx={{ borderRadius: 2 }}>
                        View Profile
                      </Button>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </DashboardLayout>
  );
}
