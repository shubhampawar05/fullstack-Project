/**
 * Company Admin Dashboard - TalentHR
 * Modern, premium UI with dummy data showcase
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
  AvatarGroup,
  LinearProgress,
  Chip,
  IconButton,
} from "@mui/material";
import {
  People,
  TrendingUp,
  Work,
  EventNote,
  CalendarToday,
  CheckCircle,
  Schedule,
  Cancel,
  ArrowUpward,
  ArrowDownward,
  MoreVert,
  Notifications,
} from "@mui/icons-material";
import DashboardLayout from "@/components/layout/dashboard-layout";
import {
  dummyEmployees,
  dummyLeaves,
  dummyJobs,
  dummyCandidates,
  getAttendanceStats,
} from "@/utils/dummyData";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Calculate stats from dummy data
  const stats = {
    totalEmployees: dummyEmployees.length,
    activeEmployees: dummyEmployees.filter(e => e.status === 'Active').length,
    onLeave: dummyEmployees.filter(e => e.status === 'On Leave').length,
    activeJobs: dummyJobs.filter(j => j.status === 'Active').length,
    totalCandidates: dummyCandidates.length,
    pendingLeaves: dummyLeaves.filter(l => l.status === 'Pending').length,
    approvedLeaves: dummyLeaves.filter(l => l.status === 'Approved').length,
  };

  const attendanceStats = getAttendanceStats();

  // Recent activities
  const recentActivities = [
    { type: 'join', name: 'Priya Sharma', action: 'joined the company', time: '2 hours ago', avatar: dummyEmployees[1].avatar },
    { type: 'leave', name: 'Amit Kumar', action: 'requested leave', time: '4 hours ago', avatar: dummyEmployees[2].avatar },
    { type: 'hire', name: 'Sneha Patel', action: 'moved to Offer stage', time: '5 hours ago', avatar: dummyCandidates[0].avatar },
    { type: 'review', name: 'Vikram Singh', action: 'completed performance review', time: '1 day ago', avatar: dummyEmployees[3].avatar },
  ];

  // Top performers
  const topPerformers = dummyEmployees
    .filter(e => e.status === 'Active')
    .sort((a, b) => b.performance - a.performance)
    .slice(0, 5);

  // Pending leaves
  const pendingLeaveRequests = dummyLeaves
    .filter(l => l.status === 'Pending')
    .slice(0, 5);

  // Active jobs with candidates
  const activeJobsWithCandidates = dummyJobs
    .filter(j => j.status === 'Active')
    .slice(0, 4)
    .map(job => ({
      ...job,
      candidates: dummyCandidates.filter(c => c.jobId === job.id).length,
    }));

  // Check authentication
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }

    if (user.role !== "company_admin") {
      router.push(`/dashboard/${user.role || "employee"}`);
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

  return (
    <DashboardLayout role="company_admin">
      <Container maxWidth="xl" sx={{ pb: 4 }}>
        {/* Hero Header */}
        <Paper
          elevation={0}
          sx={{
            p: 5,
            mb: 4,
            borderRadius: 4,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(118, 75, 162, 0.4)",
          }}
        >
          {/* Animated background elements */}
          <Box
            sx={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)",
              animation: "pulse 4s ease-in-out infinite",
              "@keyframes pulse": {
                "0%, 100%": { transform: "scale(1)", opacity: 0.5 },
                "50%": { transform: "scale(1.1)", opacity: 0.8 },
              },
            }}
          />
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="h3" fontWeight={700} gutterBottom sx={{ letterSpacing: "-1px" }}>
                  Welcome back, Admin! 👋
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 400, mb: 3 }}>
                  Here's what's happening with your organization today
                </Typography>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <Chip
                    label={`${stats.activeEmployees} Active Employees`}
                    sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 600 }}
                  />
                  <Chip
                    label={`${stats.activeJobs} Open Positions`}
                    sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 600 }}
                  />
                  <Chip
                    label={`${stats.pendingLeaves} Pending Approvals`}
                    sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 600 }}
                  />
                </Box>
              </Box>
              <Box sx={{ display: { xs: "none", md: "block" } }}>
                <AvatarGroup max={5} sx={{ "& .MuiAvatar-root": { border: "3px solid white", width: 56, height: 56 } }}>
                  {topPerformers.map((emp, idx) => (
                    <Avatar key={idx} src={emp.avatar} alt={emp.firstName} />
                  ))}
                </AvatarGroup>
                <Typography variant="caption" sx={{ display: "block", textAlign: "center", mt: 1, opacity: 0.9 }}>
                  Top Performers
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            {
              title: "Total Employees",
              value: stats.totalEmployees,
              change: "+12%",
              trend: "up",
              icon: <People sx={{ fontSize: 40 }} />,
              color: "#667eea",
              subtitle: `${stats.activeEmployees} active`,
            },
            {
              title: "Attendance Rate",
              value: `${Math.round((attendanceStats.present / attendanceStats.totalDays) * 100)}%`,
              change: "+5%",
              trend: "up",
              icon: <CheckCircle sx={{ fontSize: 40 }} />,
              color: "#10b981",
              subtitle: "This month",
            },
            {
              title: "Active Recruitments",
              value: stats.activeJobs,
              change: "+3",
              trend: "up",
              icon: <Work sx={{ fontSize: 40 }} />,
              color: "#f59e0b",
              subtitle: `${stats.totalCandidates} candidates`,
            },
            {
              title: "Pending Leaves",
              value: stats.pendingLeaves,
              change: "-2",
              trend: "down",
              icon: <EventNote sx={{ fontSize: 40 }} />,
              color: "#ef4444",
              subtitle: "Needs approval",
            },
          ].map((metric, idx) => (
            <Grid item xs={12} sm={6} lg={3} key={idx}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  borderRadius: 4,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  border: "1px solid rgba(255,255,255,0.6)",
                  background: "rgba(255, 255, 255, 0.7)",
                  backdropFilter: "blur(12px)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${metric.color}15 0%, ${metric.color}25 100%)`,
                      }}
                    >
                      <Box sx={{ color: metric.color }}>{metric.icon}</Box>
                    </Box>
                    <Chip
                      icon={metric.trend === "up" ? <ArrowUpward sx={{ fontSize: 16 }} /> : <ArrowDownward sx={{ fontSize: 16 }} />}
                      label={metric.change}
                      size="small"
                      sx={{
                        bgcolor: metric.trend === "up" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                        color: metric.trend === "up" ? "#10b981" : "#ef4444",
                        fontWeight: 600,
                        "& .MuiChip-icon": { color: "inherit" },
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom>
                    {metric.title}
                  </Typography>
                  <Typography variant="h3" fontWeight={700} sx={{ mb: 0.5 }}>
                    {metric.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {metric.subtitle}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {/* Recent Activity */}
          <Grid item xs={12} lg={6}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
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
                    Recent Activity
                  </Typography>
                  <IconButton size="small">
                    <Notifications />
                  </IconButton>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  {recentActivities.map((activity, idx) => (
                    <Box key={idx} sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                      <Avatar src={activity.avatar} sx={{ width: 48, height: 48, border: "2px solid #f0f0f0" }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {activity.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {activity.action}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                        {activity.time}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Button fullWidth variant="outlined" sx={{ mt: 3, borderRadius: 2 }}>
                  View All Activity
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Pending Leave Requests */}
          <Grid item xs={12} lg={6}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
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
                    Pending Leave Requests
                  </Typography>
                  <Chip label={`${stats.pendingLeaves} Pending`} color="warning" size="small" />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  {pendingLeaveRequests.map((leave, idx) => (
                    <Box key={idx}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {leave.employeeName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {leave.leaveType} • {leave.days} day{leave.days > 1 ? 's' : ''}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <IconButton size="small" color="success" sx={{ bgcolor: "rgba(16, 185, 129, 0.1)" }}>
                            <CheckCircle fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" sx={{ bgcolor: "rgba(239, 68, 68, 0.1)" }}>
                            <Cancel fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                      </Typography>
                      {idx < pendingLeaveRequests.length - 1 && <Box sx={{ height: 1, bgcolor: "divider", mt: 2 }} />}
                    </Box>
                  ))}
                </Box>
                <Button fullWidth variant="outlined" sx={{ mt: 3, borderRadius: 2 }}>
                  View All Requests
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Active Recruitments */}
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
                    Active Recruitments
                  </Typography>
                  <Button variant="contained" size="small" sx={{ borderRadius: 2 }}>
                    Post New Job
                  </Button>
                </Box>
                <Grid container spacing={2}>
                  {activeJobsWithCandidates.map((job, idx) => (
                    <Grid item xs={12} sm={6} lg={3} key={idx}>
                      <Card
                        elevation={0}
                        sx={{
                          p: 2.5,
                          borderRadius: 3,
                          border: "1px solid rgba(0,0,0,0.08)",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                          },
                        }}
                      >
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 2 }}>
                          <Chip label={job.department} size="small" color="primary" variant="outlined" />
                          <IconButton size="small">
                            <MoreVert fontSize="small" />
                          </IconButton>
                        </Box>
                        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                          {job.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                          {job.location} • {job.type}
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Applicants
                            </Typography>
                            <Typography variant="caption" fontWeight={600}>
                              {job.candidates}/{job.applicants}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(job.candidates / job.applicants) * 100}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Box>
                        <Button fullWidth variant="outlined" size="small" sx={{ borderRadius: 2 }}>
                          View Pipeline
                        </Button>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Top Performers */}
          <Grid item xs={12} lg={6}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 4,
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                border: "1px solid rgba(255,255,255,0.6)",
                background: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(12px)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Top Performers
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 3 }}>
                  Based on performance ratings
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  {topPerformers.map((emp, idx) => (
                    <Box key={idx} sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: idx < 3 ? "primary.main" : "grey.300",
                          color: "white",
                          fontWeight: 700,
                          fontSize: 14,
                        }}
                      >
                        {idx + 1}
                      </Box>
                      <Avatar src={emp.avatar} sx={{ width: 48, height: 48 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {emp.firstName} {emp.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {emp.position} • {emp.department}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${emp.performance.toFixed(1)} ⭐`}
                        size="small"
                        sx={{ bgcolor: "rgba(255, 193, 7, 0.1)", color: "#f59e0b", fontWeight: 600 }}
                      />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Stats */}
          <Grid item xs={12} lg={6}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 4,
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                border: "1px solid rgba(255,255,255,0.6)",
                background: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(12px)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Department Overview
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 3 }}>
                  Employee distribution across departments
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {Object.entries(
                    dummyEmployees.reduce((acc, emp) => {
                      acc[emp.department] = (acc[emp.department] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  )
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 6)
                    .map(([dept, count], idx) => (
                      <Box key={idx}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                          <Typography variant="body2" fontWeight={600}>
                            {dept}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {count} employees
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(count / stats.totalEmployees) * 100}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: "rgba(0,0,0,0.05)",
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 4,
                              background: `linear-gradient(90deg, #667eea ${idx * 10}%, #764ba2 100%)`,
                            },
                          }}
                        />
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
