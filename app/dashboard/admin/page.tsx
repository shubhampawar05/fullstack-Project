/**
 * Company Admin Dashboard - TalentHR
 * Professional, Minimal, and Premium UI
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
  Divider,
  Stack,
  useTheme,
} from "@mui/material";
import {
  People,
  TrendingUp,
  Work,
  EventNote,
  CheckCircle,
  Cancel,
  ArrowUpward,
  ArrowDownward,
  MoreVert,
  Notifications,
  AccessTime,
  AttachMoney,
  Description,
  MeetingRoom,
  HelpOutline,
  Cake,
  Event,
  EmojiEvents,
  ChevronRight,
  Add,
  Circle,
} from "@mui/icons-material";
import DashboardLayout from "@/components/layout/dashboard-layout";
import {
  dummyEmployees,
  dummyLeaves,
  dummyJobs,
  dummyCandidates,
  getAttendanceStats,
} from "@/utils/dummyData";

// Minimal Card Component for consistency
const MinimalCard = ({ children, sx = {}, ...props }: any) => (
  <Card
    elevation={0}
    sx={{
      height: "100%",
      borderRadius: 3,
      border: "1px solid",
      borderColor: "divider",
      background: "white",
      boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
      transition: "all 0.2s ease-in-out",
      "&:hover": {
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        borderColor: "rgba(0,0,0,0.08)",
      },
      ...sx,
    }}
    {...props}
  >
    {children}
  </Card>
);

export default function AdminDashboard() {
  const router = useRouter();
  const theme = useTheme();
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

  // Recent activities - Refined for minimalism
  const recentActivities = [
    { type: 'join', name: 'Priya Sharma', action: 'joined as Senior Developer', time: '2h ago', avatar: dummyEmployees[1].avatar, color: "primary.main" },
    { type: 'leave', name: 'Amit Kumar', action: 'requested sick leave', time: '4h ago', avatar: dummyEmployees[2].avatar, color: "warning.main" },
    { type: 'hire', name: 'Sneha Patel', action: 'moved to Offer stage', time: '5h ago', avatar: dummyCandidates[0].avatar, color: "success.main" },
    { type: 'review', name: 'Vikram Singh', action: 'completed Q4 review', time: '1d ago', avatar: dummyEmployees[3].avatar, color: "info.main" },
  ];

  // Top performers
  const topPerformers = dummyEmployees
    .filter(e => e.status === 'Active')
    .sort((a, b) => b.performance - a.performance)
    .slice(0, 5);

  // Pending leaves
  const pendingLeaveRequests = dummyLeaves
    .filter(l => l.status === 'Pending')
    .slice(0, 4);

  // Active jobs with candidates
  const activeJobsWithCandidates = dummyJobs
    .filter(j => j.status === 'Active')
    .slice(0, 3)
    .map(job => ({
      ...job,
      candidates: dummyCandidates.filter(c => c.jobId === job.id).length,
    }));

  // Quick actions - Refined
  const quickActions = [
    { icon: <AccessTime fontSize="small" />, label: "Clock In", color: "#667eea", action: "clock" },
    { icon: <EventNote fontSize="small" />, label: "Leaves", color: "#f59e0b", action: "leaves" },
    { icon: <AttachMoney fontSize="small" />, label: "Payroll", color: "#10b981", action: "payroll" },
    { icon: <Description fontSize="small" />, label: "Reports", color: "#8b5cf6", action: "reports" },
    { icon: <MeetingRoom fontSize="small" />, label: "Meeting", color: "#3b82f6", action: "meeting" },
    { icon: <HelpOutline fontSize="small" />, label: "Support", color: "#ec4899", action: "support" },
  ];

  // Upcoming events
  const upcomingEvents = [
    { type: "birthday", title: "Priya's Birthday", date: "Today", icon: <Cake fontSize="small" />, color: "#ec4899" },
    { type: "meeting", title: "All Hands Meeting", date: "Nov 25, 10:00 AM", icon: <MeetingRoom fontSize="small" />, color: "#667eea" },
    { type: "holiday", title: "Thanksgiving Day", date: "Nov 28", icon: <Event fontSize="small" />, color: "#f59e0b" },
  ];

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
        {/* Hero Header - Kept as requested but refined */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            mb: 4,
            borderRadius: 4,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 20px 40px -10px rgba(118, 75, 162, 0.4)",
          }}
        >
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="h3" fontWeight={800} gutterBottom sx={{ letterSpacing: "-0.5px" }}>
                  Welcome back, Admin! 👋
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, mb: 3, maxWidth: 600 }}>
                  Here's what's happening with your organization today. You have {stats.pendingLeaves} pending requests.
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <Chip
                    label={`${stats.activeEmployees} Active Employees`}
                    sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "white", fontWeight: 600, backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                  <Chip
                    label={`${stats.activeJobs} Open Positions`}
                    sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "white", fontWeight: 600, backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </Stack>
              </Box>
              <Box sx={{ display: { xs: "none", md: "block" } }}>
                <AvatarGroup max={4} sx={{ "& .MuiAvatar-root": { border: "3px solid rgba(255,255,255,0.2)", width: 60, height: 60, fontSize: 20 } }}>
                  {topPerformers.map((emp, idx) => (
                    <Avatar key={idx} src={emp.avatar} alt={emp.firstName} />
                  ))}
                </AvatarGroup>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Key Metrics - Refined */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            {
              title: "Total Employees",
              value: stats.totalEmployees,
              change: "+12%",
              trend: "up",
              icon: <People sx={{ fontSize: 28 }} />,
              color: "#667eea",
              subtitle: "vs last month",
            },
            {
              title: "Attendance Rate",
              value: `${Math.round((attendanceStats.present / attendanceStats.totalDays) * 100)}%`,
              change: "+5%",
              trend: "up",
              icon: <CheckCircle sx={{ fontSize: 28 }} />,
              color: "#10b981",
              subtitle: "vs last month",
            },
            {
              title: "Active Recruitments",
              value: stats.activeJobs,
              change: "+3",
              trend: "up",
              icon: <Work sx={{ fontSize: 28 }} />,
              color: "#f59e0b",
              subtitle: "new positions",
            },
            {
              title: "Pending Leaves",
              value: stats.pendingLeaves,
              change: "-2",
              trend: "down",
              icon: <EventNote sx={{ fontSize: 28 }} />,
              color: "#ef4444",
              subtitle: "requests",
            },
          ].map((metric, idx) => (
            <Grid item xs={12} sm={6} lg={3} key={idx}>
              <MinimalCard>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    <Box
                      sx={{
                        p: 1.2,
                        borderRadius: 2,
                        bgcolor: `${metric.color}10`,
                        color: metric.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {metric.icon}
                    </Box>
                    <Chip
                      icon={metric.trend === "up" ? <ArrowUpward sx={{ fontSize: 14 }} /> : <ArrowDownward sx={{ fontSize: 14 }} />}
                      label={metric.change}
                      size="small"
                      sx={{
                        bgcolor: metric.trend === "up" ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)",
                        color: metric.trend === "up" ? "#10b981" : "#ef4444",
                        fontWeight: 600,
                        height: 24,
                        "& .MuiChip-icon": { color: "inherit", fontSize: 14 },
                      }}
                    />
                  </Box>
                  <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5, color: "text.primary" }}>
                    {metric.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    {metric.title}
                  </Typography>
                </CardContent>
              </MinimalCard>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {/* Quick Actions - Clean & Minimal */}
          <Grid item xs={12}>
            <MinimalCard sx={{ p: 1 }}>
              <Grid container spacing={1}>
                {quickActions.map((item, idx) => (
                  <Grid item xs={6} sm={4} md={2} key={idx}>
                    <Button
                      fullWidth
                      onClick={() => console.log(item.action)}
                      sx={{
                        flexDirection: "row",
                        gap: 1.5,
                        py: 1.5,
                        px: 2,
                        borderRadius: 2,
                        color: "text.secondary",
                        justifyContent: "flex-start",
                        "&:hover": {
                          bgcolor: `${item.color}08`,
                          color: item.color,
                        },
                      }}
                    >
                      <Box sx={{ color: item.color, display: "flex" }}>{item.icon}</Box>
                      <Typography variant="body2" fontWeight={600}>
                        {item.label}
                      </Typography>
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </MinimalCard>
          </Grid>

          {/* Recent Activity - Redesigned as Timeline */}
          <Grid item xs={12} lg={4}>
            <MinimalCard>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                  <Typography variant="h6" fontWeight={700}>
                    Recent Activity
                  </Typography>
                  <Button size="small" endIcon={<ChevronRight />} sx={{ color: "text.secondary" }}>
                    View All
                  </Button>
                </Box>
                <Stack spacing={0}>
                  {recentActivities.map((activity, idx) => (
                    <Box key={idx} sx={{ position: "relative", pb: idx === recentActivities.length - 1 ? 0 : 3, pl: 3 }}>
                      {/* Timeline Line */}
                      {idx !== recentActivities.length - 1 && (
                        <Box
                          sx={{
                            position: "absolute",
                            left: 5,
                            top: 24,
                            bottom: 0,
                            width: 2,
                            bgcolor: "grey.100",
                          }}
                        />
                      )}
                      {/* Timeline Dot */}
                      <Circle
                        sx={{
                          position: "absolute",
                          left: 0,
                          top: 6,
                          fontSize: 12,
                          color: activity.color,
                          bgcolor: "white",
                          zIndex: 1,
                        }}
                      />
                      <Box>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          <Box component="span" fontWeight={600}>
                            {activity.name}
                          </Box>{" "}
                          <Box component="span" color="text.secondary">
                            {activity.action}
                          </Box>
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                          {activity.time}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </MinimalCard>
          </Grid>

          {/* Pending Leave Requests - Redesigned as Clean List */}
          <Grid item xs={12} lg={8}>
            <MinimalCard>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                  <Typography variant="h6" fontWeight={700}>
                    Pending Leaves
                  </Typography>
                  <Chip label={`${stats.pendingLeaves} New`} color="error" size="small" sx={{ height: 24, fontWeight: 600 }} />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {pendingLeaveRequests.map((leave, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: 2,
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        transition: "all 0.2s",
                        "&:hover": {
                          borderColor: "primary.main",
                          bgcolor: "primary.50",
                        },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar src={dummyEmployees.find(e => e.id === leave.employeeId)?.avatar} sx={{ width: 40, height: 40 }} />
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {leave.employeeName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {leave.leaveType} • {leave.days} day{leave.days > 1 ? 's' : ''}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
                          <Typography variant="caption" display="block" color="text.secondary">
                            Duration
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {new Date(leave.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(leave.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1}>
                          <IconButton size="small" sx={{ color: "success.main", bgcolor: "success.50", "&:hover": { bgcolor: "success.100" } }}>
                            <CheckCircle fontSize="small" />
                          </IconButton>
                          <IconButton size="small" sx={{ color: "error.main", bgcolor: "error.50", "&:hover": { bgcolor: "error.100" } }}>
                            <Cancel fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Box>
                    </Box>
                  ))}
                </Box>
                <Button fullWidth sx={{ mt: 2, color: "text.secondary" }}>
                  View All Requests
                </Button>
              </CardContent>
            </MinimalCard>
          </Grid>

          {/* Active Recruitments - Simplified */}
          <Grid item xs={12} lg={8}>
            <MinimalCard>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                  <Typography variant="h6" fontWeight={700}>
                    Active Recruitments
                  </Typography>
                  <Button startIcon={<Add />} variant="contained" size="small" sx={{ borderRadius: 2, textTransform: "none" }}>
                    Post Job
                  </Button>
                </Box>
                <Grid container spacing={2}>
                  {activeJobsWithCandidates.map((job, idx) => (
                    <Grid item xs={12} md={4} key={idx}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: "divider",
                          height: "100%",
                        }}
                      >
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                          <Typography variant="subtitle2" fontWeight={700}>
                            {job.title}
                          </Typography>
                          <Chip label={job.department} size="small" sx={{ height: 20, fontSize: 10, bgcolor: "grey.100" }} />
                        </Box>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                          {job.location} • {job.type}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <AvatarGroup max={3} sx={{ "& .MuiAvatar-root": { width: 24, height: 24, fontSize: 12 } }}>
                            {dummyCandidates.filter(c => c.jobId === job.id).map((c, i) => (
                              <Avatar key={i} src={c.avatar} />
                            ))}
                          </AvatarGroup>
                          <Typography variant="caption" fontWeight={600} color="primary">
                            {job.candidates} Applicants
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </MinimalCard>
          </Grid>

          {/* Upcoming Events - Minimal List */}
          <Grid item xs={12} lg={4}>
            <MinimalCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Upcoming Events
                </Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  {upcomingEvents.map((event, idx) => (
                    <Box key={idx} sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: `${event.color}10`,
                          color: event.color,
                        }}
                      >
                        {event.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {event.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {event.date}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </MinimalCard>
          </Grid>
        </Grid>
      </Container>
    </DashboardLayout>
  );
}
