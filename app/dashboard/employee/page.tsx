/**
 * Employee Dashboard - TalentHR
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
  Chip,
  LinearProgress,
  IconButton,
  Divider,
  Stack,
  useTheme,
} from "@mui/material";
import {
  AccessTime,
  EventNote,
  TrendingUp,
  Notifications,
  CalendarToday,
  CheckCircle,
  Schedule,
  Group,
  EmojiEvents,
  Celebration,
  ArrowForward,
  PlayArrow,
  Stop,
  Cancel,
  MoreVert,
} from "@mui/icons-material";
import DashboardLayout from "@/components/layout/dashboard-layout";
import {
  dummyEmployees,
  dummyLeaves,
  dummyGoals,
  getAttendanceStats,
  leaveBalances,
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

export default function EmployeeDashboard() {
  const router = useRouter();
  const theme = useTheme();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Simulate current employee (in real app, this would come from auth)
  const currentEmployee = dummyEmployees[4]; // Random employee
  const attendanceStats = getAttendanceStats(currentEmployee.id);
  const employeeLeaveBalance = leaveBalances.find(lb => lb.employeeId === currentEmployee.id);
  const myGoals = dummyGoals.filter(g => g.employeeId === currentEmployee.id).slice(0, 3);
  const myLeaves = dummyLeaves.filter(l => l.employeeId === currentEmployee.id).slice(0, 3);
  const teamMembers = dummyEmployees
    .filter(e => e.department === currentEmployee.department && e.id !== currentEmployee.id)
    .slice(0, 6);

  // Upcoming events (dummy data)
  const upcomingEvents = [
    { title: "Team Standup", time: "10:00 AM", type: "Meeting", color: "#667eea" },
    { title: "Project Review", time: "2:00 PM", type: "Meeting", color: "#f59e0b" },
    { title: "Diwali Holiday", time: "Nov 12", type: "Holiday", color: "#10b981" },
  ];

  // Recent announcements
  const announcements = [
    { title: "New Office Policy Update", date: "2 days ago", priority: "high" },
    { title: "Team Building Event Next Week", date: "3 days ago", priority: "medium" },
    { title: "Q4 Goals Published", date: "1 week ago", priority: "low" },
  ];

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  const greeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <DashboardLayout role="employee">
      <Container maxWidth="xl" sx={{ pb: 4 }}>
        {/* Welcome Header - Consistent Style */}
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
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                <Avatar
                  src={currentEmployee.avatar}
                  sx={{ width: 80, height: 80, border: "4px solid rgba(255,255,255,0.3)" }}
                />
                <Box>
                  <Typography variant="h3" fontWeight={800} gutterBottom sx={{ letterSpacing: "-0.5px" }}>
                    {greeting()}, {currentEmployee.firstName}! 👋
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, mb: 2 }}>
                    {currentEmployee.position} • {currentEmployee.department}
                  </Typography>
                  <Stack direction="row" spacing={1.5}>
                    <Chip
                      icon={<CalendarToday sx={{ fontSize: 16 }} />}
                      label={currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                      sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "white", fontWeight: 600, backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.1)" }}
                    />
                    <Chip
                      icon={<AccessTime sx={{ fontSize: 16 }} />}
                      label={currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "white", fontWeight: 600, backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.1)" }}
                    />
                  </Stack>
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          {/* Quick Clock In/Out - Clean Design */}
          <Grid item xs={12} md={4}>
            <MinimalCard>
              <CardContent sx={{ p: 3, textAlign: "center", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    bgcolor: isClockedIn ? "error.50" : "primary.50",
                    color: isClockedIn ? "error.main" : "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                    transition: "all 0.3s ease",
                  }}
                >
                  {isClockedIn ? (
                    <Stop sx={{ fontSize: 40 }} />
                  ) : (
                    <PlayArrow sx={{ fontSize: 40 }} />
                  )}
                </Box>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  {isClockedIn ? "Clock Out" : "Clock In"}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {isClockedIn ? "You are currently clocked in" : "Ready to start your day?"}
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  color={isClockedIn ? "error" : "primary"}
                  onClick={() => setIsClockedIn(!isClockedIn)}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    boxShadow: "none",
                    fontWeight: 600,
                  }}
                >
                  {isClockedIn ? "Stop Work" : "Start Work"}
                </Button>
                {isClockedIn && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: "success.50", borderRadius: 2, color: "success.700" }}>
                    <Typography variant="caption" fontWeight={600} display="block">
                      SESSION DURATION
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      02:30:45
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </MinimalCard>
          </Grid>

          {/* Leave Balance - Simplified Cards */}
          <Grid item xs={12} md={8}>
            <MinimalCard>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                  <Typography variant="h6" fontWeight={700}>
                    Leave Balance
                  </Typography>
                  <Button variant="outlined" size="small" sx={{ borderRadius: 2 }}>
                    Request Leave
                  </Button>
                </Box>
                <Grid container spacing={2}>
                  {[
                    { type: "Casual Leave", ...employeeLeaveBalance?.casual, color: "#667eea" },
                    { type: "Sick Leave", ...employeeLeaveBalance?.sick, color: "#f59e0b" },
                    { type: "Earned Leave", ...employeeLeaveBalance?.earned, color: "#10b981" },
                  ].map((leave, idx) => (
                    <Grid item xs={12} sm={4} key={idx}>
                      <Box
                        sx={{
                          p: 2.5,
                          borderRadius: 3,
                          border: "1px solid",
                          borderColor: "divider",
                          height: "100%",
                          transition: "all 0.2s",
                          "&:hover": {
                            borderColor: leave.color,
                            bgcolor: `${leave.color}05`,
                          },
                        }}
                      >
                        <Typography variant="subtitle2" color="text.secondary" fontWeight={600} gutterBottom>
                          {leave.type}
                        </Typography>
                        <Typography variant="h3" fontWeight={700} sx={{ color: leave.color, mb: 2 }}>
                          {leave.remaining}
                        </Typography>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Used: {leave.used}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Total: {leave.total}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={((leave.used || 0) / (leave.total || 1)) * 100}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: "grey.100",
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 3,
                              bgcolor: leave.color,
                            },
                          }}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </MinimalCard>
          </Grid>

          {/* My Goals - Clean List */}
          <Grid item xs={12} lg={6}>
            <MinimalCard>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: "warning.50", color: "warning.main" }}>
                      <EmojiEvents fontSize="small" />
                    </Box>
                    <Typography variant="h6" fontWeight={700}>
                      My Goals
                    </Typography>
                  </Box>
                  <Button size="small" endIcon={<ArrowForward />} sx={{ color: "text.secondary" }}>
                    View All
                  </Button>
                </Box>
                <Stack spacing={3}>
                  {myGoals.map((goal, idx) => (
                    <Box key={idx}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {goal.title}
                        </Typography>
                        <Typography variant="subtitle2" fontWeight={700} color={goal.progress === 100 ? "success.main" : "primary.main"}>
                          {goal.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={goal.progress}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: "grey.100",
                          mb: 1,
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 4,
                            background: goal.progress === 100
                              ? "linear-gradient(90deg, #10b981 0%, #059669 100%)"
                              : "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                          },
                        }}
                      />
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Chip
                          label={goal.priority}
                          size="small"
                          sx={{ 
                            height: 20, 
                            fontSize: 10, 
                            fontWeight: 600,
                            bgcolor: goal.priority === "High" ? "error.50" : goal.priority === "Medium" ? "warning.50" : "grey.100",
                            color: goal.priority === "High" ? "error.main" : goal.priority === "Medium" ? "warning.main" : "text.secondary"
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Due {new Date(goal.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </MinimalCard>
          </Grid>

          {/* Upcoming Events & Announcements - Split */}
          <Grid item xs={12} lg={6}>
            <Stack spacing={3} sx={{ height: "100%" }}>
              {/* Events */}
              <MinimalCard sx={{ flex: 1 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6" fontWeight={700}>
                      Upcoming Events
                    </Typography>
                    <IconButton size="small">
                      <CalendarToday fontSize="small" />
                    </IconButton>
                  </Box>
                  <Stack spacing={2}>
                    {upcomingEvents.map((event, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: "grey.50",
                        }}
                      >
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            bgcolor: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: event.color,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                            fontWeight: 700,
                            fontSize: 12,
                          }}
                        >
                          {idx + 12}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {event.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {event.time} • {event.type}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </MinimalCard>

              {/* Announcements */}
              <MinimalCard sx={{ flex: 1 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6" fontWeight={700}>
                      Announcements
                    </Typography>
                    <Button size="small" sx={{ minWidth: 0, p: 0.5 }}>
                      See All
                    </Button>
                  </Box>
                  <Stack spacing={2}>
                    {announcements.slice(0, 2).map((announcement, idx) => (
                      <Box key={idx}>
                         <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                           <Typography variant="subtitle2" fontWeight={600}>
                             {announcement.title}
                           </Typography>
                           {announcement.priority === "high" && (
                             <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "error.main", mt: 0.5 }} />
                           )}
                         </Box>
                         <Typography variant="caption" color="text.secondary">
                           {announcement.date}
                         </Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </MinimalCard>
            </Stack>
          </Grid>

          {/* Team Members - Grid */}
          <Grid item xs={12} lg={6}>
            <MinimalCard>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: "primary.50", color: "primary.main" }}>
                      <Group fontSize="small" />
                    </Box>
                    <Typography variant="h6" fontWeight={700}>
                      My Team
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ bgcolor: "grey.100", px: 1, py: 0.5, borderRadius: 1, fontWeight: 600 }}>
                    {currentEmployee.department}
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  {teamMembers.map((member, idx) => (
                    <Grid item xs={6} sm={4} key={idx}>
                      <Box
                        sx={{
                          textAlign: "center",
                          p: 2,
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: "divider",
                          transition: "all 0.2s",
                          "&:hover": {
                            borderColor: "primary.main",
                            transform: "translateY(-2px)",
                          },
                        }}
                      >
                        <Avatar
                          src={member.avatar}
                          sx={{ width: 48, height: 48, margin: "0 auto 8px" }}
                        />
                        <Typography variant="subtitle2" fontWeight={600} noWrap>
                          {member.firstName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap display="block">
                          {member.position}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </MinimalCard>
          </Grid>

          {/* Attendance Summary - Stats Row */}
          <Grid item xs={12} lg={6}>
            <MinimalCard>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                  <Typography variant="h6" fontWeight={700}>
                    Attendance Overview
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    This Month
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  {[
                    { label: "Present", value: attendanceStats.present, color: "#10b981", icon: <CheckCircle fontSize="small" /> },
                    { label: "Late", value: attendanceStats.late, color: "#f59e0b", icon: <Schedule fontSize="small" /> },
                    { label: "Absent", value: attendanceStats.absent, color: "#ef4444", icon: <Cancel fontSize="small" /> },
                    { label: "Avg Hrs", value: attendanceStats.avgWorkHours.toFixed(1), color: "#667eea", icon: <AccessTime fontSize="small" /> },
                  ].map((stat, idx) => (
                    <Grid item xs={6} sm={6} key={idx}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: "grey.50",
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <Box sx={{ color: stat.color, display: "flex" }}>{stat.icon}</Box>
                        <Box>
                          <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1 }}>
                            {stat.value}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            {stat.label}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </MinimalCard>
          </Grid>
        </Grid>
      </Container>
    </DashboardLayout>
  );
}
