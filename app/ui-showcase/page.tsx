/**
 * Complete TalentHR Dashboard - Full Application Showcase
 * All features with dummy data
 */

"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Badge,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Dashboard,
  People,
  Work,
  CalendarToday,
  Assessment,
  School,
  AttachMoney,
  Settings,
  Notifications,
  Menu as MenuIcon,
  AccountCircle,
  Business,
  PersonAdd,
  TrendingUp,
  CheckCircle,
  Schedule,
  EmojiEvents,
} from "@mui/icons-material";

// Import all our components
import AttendanceClock from "@/components/attendance/attendance-clock";
import AttendanceCalendar from "@/components/attendance/attendance-calendar";
import LeaveRequestForm from "@/components/attendance/leave-request-form";
import LeaveBalanceCards from "@/components/attendance/leave-balance-cards";
import PerformanceReviewCard from "@/components/performance/performance-review-card";
import GoalTrackingCard from "@/components/performance/goal-tracking-card";
import CourseCard from "@/app/learning/course-card";
import AnalyticsDashboard from "@/components/analytics/analytics-dashboard";
import PayslipViewer from "@/app/payroll/payslip-viewer";
import EmployeeSurvey from "@/components/engagement/employee-survey";
import RecognitionCard, { RecognitionLeaderboard } from "@/components/engagement/recognition-card";
import EmployeeList from "@/components/employees/employee-list";
import DepartmentsList from "@/components/departments/departments-list";
import RecruitmentDashboard from "@/components/recruitment/recruitment-dashboard";
import LearningManagement from "@/app/learning/learning-management";
import PayrollDashboard from "@/app/payroll/payroll-dashboard";
import SettingsPage from "@/components/settings/settings-page";



export default function CompleteDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [leaveFormOpen, setLeaveFormOpen] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <Dashboard /> },
    { id: "employees", label: "Employees", icon: <People /> },
    { id: "departments", label: "Departments", icon: <Business /> },
    { id: "recruitment", label: "Recruitment", icon: <Work /> },
    { id: "attendance", label: "Attendance", icon: <CalendarToday /> },
    { id: "performance", label: "Performance", icon: <TrendingUp /> },
    { id: "learning", label: "Learning & Development", icon: <School /> },
    { id: "payroll", label: "Payroll", icon: <AttachMoney /> },
    { id: "analytics", label: "Analytics", icon: <Assessment /> },
    { id: "settings", label: "Settings", icon: <Settings /> },
  ];

  // Dummy data
  const stats = {
    totalEmployees: 247,
    activeEmployees: 235,
    onLeave: 8,
    newHires: 12,
    openPositions: 18,
    candidates: 156,
    attendanceRate: 94.2,
    avgPerformance: 4.3,
  };

  const recentActivities = [
    { type: "join", name: "Priya Sharma", action: "joined as Senior Developer", time: "2 hours ago", avatar: "" },
    { type: "leave", name: "Amit Kumar", action: "requested 3 days leave", time: "4 hours ago", avatar: "" },
    { type: "hire", name: "Sneha Patel", action: "moved to Offer stage", time: "5 hours ago", avatar: "" },
    { type: "review", name: "Vikram Singh", action: "completed Q4 review", time: "1 day ago", avatar: "" },
  ];

  const upcomingInterviews = [
    { candidate: "Rahul Verma", position: "Frontend Developer", time: "Today, 2:00 PM", interviewer: "Sarah Johnson" },
    { candidate: "Anita Desai", position: "Product Manager", time: "Today, 4:30 PM", interviewer: "Michael Chen" },
    { candidate: "Karan Mehta", position: "UI/UX Designer", time: "Tomorrow, 10:00 AM", interviewer: "Emily Davis" },
  ];

  const pendingLeaves = [
    { employee: "Rajesh Kumar", type: "Sick Leave", days: 2, from: "Nov 25", to: "Nov 26" },
    { employee: "Meera Patel", type: "Vacation", days: 5, from: "Dec 1", to: "Dec 5" },
    { employee: "Arjun Singh", type: "Personal", days: 1, from: "Nov 28", to: "Nov 28" },
  ];

  const topPerformers = [
    { name: "Sarah Johnson", role: "Team Lead", score: 4.9, avatar: "" },
    { name: "Michael Chen", role: "Senior Developer", score: 4.8, avatar: "" },
    { name: "Emily Davis", role: "Product Manager", score: 4.7, avatar: "" },
  ];

  const drawer = (
    <Box sx={{ width: 280, height: "100%", bgcolor: "#1a1a2e", color: "white" }}>
      <Box sx={{ p: 3, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <Typography variant="h5" fontWeight={700} sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          TalentHR
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          Human Resources Management
        </Typography>
      </Box>
      <List sx={{ px: 2, py: 2 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.id}
            onClick={() => {
              setActiveSection(item.id);
              setMobileOpen(false);
            }}
            sx={{
              borderRadius: 2,
              mb: 1,
              bgcolor: activeSection === item.id ? "rgba(102, 126, 234, 0.2)" : "transparent",
              color: activeSection === item.id ? "#667eea" : "rgba(255,255,255,0.7)",
              "&:hover": {
                bgcolor: "rgba(102, 126, 234, 0.1)",
                color: "#667eea",
              },
            }}
          >
            <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  const renderDashboard = () => (
    <Box>
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: "Total Employees", value: stats.totalEmployees, change: "+12%", icon: <People />, color: "#667eea" },
          { title: "Open Positions", value: stats.openPositions, change: "+3", icon: <Work />, color: "#f59e0b" },
          { title: "Attendance Rate", value: `${stats.attendanceRate}%`, change: "+2.1%", icon: <CheckCircle />, color: "#10b981" },
          { title: "Avg Performance", value: stats.avgPerformance, change: "+0.3", icon: <EmojiEvents />, color: "#8b5cf6" },
        ].map((stat, idx) => (
          <Grid item xs={12} sm={6} lg={3} key={idx}>
            <Card elevation={0} sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", transition: "all 0.3s", "&:hover": { transform: "translateY(-8px)", boxShadow: "0 12px 40px rgba(0,0,0,0.15)" } }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: 3, background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}25 100%)` }}>
                    <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                  </Box>
                  <Chip label={stat.change} size="small" sx={{ bgcolor: "rgba(16, 185, 129, 0.1)", color: "#10b981", fontWeight: 600 }} />
                </Box>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>{stat.title}</Typography>
                <Typography variant="h3" fontWeight={700}>{stat.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Activity */}
        <Grid item xs={12} lg={6}>
          <Card elevation={0} sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Recent Activity</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                {recentActivities.map((activity, idx) => (
                  <Box key={idx} sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <Avatar sx={{ width: 48, height: 48 }}>{activity.name.charAt(0)}</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={600}>{activity.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{activity.action}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">{activity.time}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Interviews */}
        <Grid item xs={12} lg={6}>
          <Card elevation={0} sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Upcoming Interviews</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                {upcomingInterviews.map((interview, idx) => (
                  <Box key={idx} sx={{ p: 2, borderRadius: 2, bgcolor: "rgba(102, 126, 234, 0.05)", border: "1px solid rgba(102, 126, 234, 0.1)" }}>
                    <Typography variant="body2" fontWeight={600}>{interview.candidate}</Typography>
                    <Typography variant="caption" color="text.secondary">{interview.position}</Typography>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                      <Typography variant="caption" fontWeight={600}>{interview.time}</Typography>
                      <Typography variant="caption" color="text.secondary">with {interview.interviewer}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Leave Requests */}
        <Grid item xs={12} lg={6}>
          <Card elevation={0} sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)" }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>Pending Leaves</Typography>
                <Chip label={`${pendingLeaves.length} Pending`} color="warning" size="small" />
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {pendingLeaves.map((leave, idx) => (
                  <Box key={idx} sx={{ p: 2, borderRadius: 2, bgcolor: "rgba(245, 158, 11, 0.05)", border: "1px solid rgba(245, 158, 11, 0.1)" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="body2" fontWeight={600}>{leave.employee}</Typography>
                      <Chip label={leave.type} size="small" sx={{ bgcolor: "rgba(245, 158, 11, 0.1)", color: "#f59e0b", fontSize: "0.7rem" }} />
                    </Box>
                    <Typography variant="caption" color="text.secondary">{leave.from} - {leave.to} ({leave.days} days)</Typography>
                    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                      <Button size="small" variant="contained" sx={{ borderRadius: 1, bgcolor: "#10b981", fontSize: "0.7rem" }}>Approve</Button>
                      <Button size="small" variant="outlined" sx={{ borderRadius: 1, fontSize: "0.7rem" }}>Reject</Button>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Performers */}
        <Grid item xs={12} lg={6}>
          <Card elevation={0} sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Top Performers</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                {topPerformers.map((performer, idx) => (
                  <Box key={idx} sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: idx < 3 ? "#fbbf24" : "grey.300", color: "white", fontWeight: 700 }}>{idx + 1}</Box>
                    <Avatar sx={{ width: 48, height: 48 }}>{performer.name.charAt(0)}</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={600}>{performer.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{performer.role}</Typography>
                    </Box>
                    <Chip label={`${performer.score} ⭐`} size="small" sx={{ bgcolor: "rgba(255, 193, 7, 0.1)", color: "#f59e0b", fontWeight: 600 }} />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f5f7fa" }}>
      {/* Sidebar - Desktop */}
      <Box sx={{ display: { xs: "none", md: "block" }, width: 280, flexShrink: 0 }}>
        {drawer}
      </Box>

      {/* Sidebar - Mobile */}
      <Drawer anchor="left" open={mobileOpen} onClose={() => setMobileOpen(false)} sx={{ display: { xs: "block", md: "none" } }}>
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top Bar */}
        <AppBar position="static" elevation={0} sx={{ bgcolor: "white", color: "text.primary", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
          <Toolbar>
            <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 2, display: { md: "none" } }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
              {menuItems.find(item => item.id === activeSection)?.label || "Dashboard"}
            </Typography>
            <IconButton>
              <Badge badgeContent={4} color="error">
                <Notifications />
              </Badge>
            </IconButton>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <AccountCircle />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem>Profile</MenuItem>
              <MenuItem>Settings</MenuItem>
              <MenuItem>Logout</MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Content Area */}
        <Box sx={{ flex: 1, p: 3, overflow: "auto" }}>
          <Container maxWidth="xl">
            {activeSection === "dashboard" && renderDashboard()}
            {activeSection === "employees" && <EmployeeList />}
            {activeSection === "departments" && <DepartmentsList />}
            {activeSection === "recruitment" && <RecruitmentDashboard />}
            {activeSection === "attendance" && (
              <Grid container spacing={3}>
                <Grid item xs={12} lg={6}><AttendanceClock employeeName="John Doe" /></Grid>
                <Grid item xs={12}><LeaveBalanceCards /></Grid>
                <Grid item xs={12}><AttendanceCalendar attendanceData={[]} /></Grid>
              </Grid>
            )}
            {activeSection === "performance" && (
              <Grid container spacing={3}>
                <Grid item xs={12} lg={6}>
                  <PerformanceReviewCard 
                    employeeName="Jane Smith" 
                    position="Senior Developer" 
                    department="Engineering" 
                    reviewPeriod="Q4 2024" 
                    overallRating={4.5} 
                    previousRating={4.2}
                    metrics={[
                      { category: "Technical Skills", score: 9, maxScore: 10, feedback: "Excellent" },
                      { category: "Communication", score: 8, maxScore: 10, feedback: "Great" }
                    ]} 
                    status="completed" 
                  />
                </Grid>
                <Grid item xs={12} lg={6}>
                  <GoalTrackingCard 
                    goal={{
                      id: "1",
                      title: "Improve Code Quality",
                      description: "Reduce technical debt",
                      category: "individual",
                      progress: 75,
                      target: 100,
                      unit: "%",
                      startDate: "2024-01-01",
                      endDate: "2024-12-31",
                      status: "on-track",
                      owner: { name: "Jane Smith", avatar: "" },
                      collaborators: [],
                      milestones: [
                        { title: "Setup testing", completed: true, dueDate: "2024-03-31" },
                        { title: "Code review", completed: false, dueDate: "2024-06-30" }
                      ]
                    }} 
                  />
                </Grid>
              </Grid>
            )}
            {activeSection === "learning" && <LearningManagement />}
            {activeSection === "payroll" && <PayrollDashboard />}
            {activeSection === "analytics" && <AnalyticsDashboard />}
            {activeSection === "settings" && <SettingsPage />}
          </Container>
        </Box>
      </Box>
    </Box>
  );
}
