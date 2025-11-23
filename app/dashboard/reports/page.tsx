/**
 * Reports & Analytics Page - TalentHR
 * Dashboard for viewing analytics and reports
 */

"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Assessment,
  People,
  TrendingUp,
  BeachAccess,
  CheckCircle,
  Schedule,
  Star,
} from "@mui/icons-material";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useAuth } from "@/contexts/auth-context";

export default function ReportsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [overview, setOverview] = useState<any>(null);
  const [attendance, setAttendance] = useState<any>(null);
  const [leaves, setLeaves] = useState<any>(null);
  const [performance, setPerformance] = useState<any>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [overviewRes, attendanceRes, leavesRes, performanceRes] = await Promise.all([
        fetch("/api/reports/overview", { credentials: "include" }),
        fetch("/api/reports/attendance", { credentials: "include" }),
        fetch("/api/reports/leaves", { credentials: "include" }),
        fetch("/api/reports/performance", { credentials: "include" }),
      ]);

      const [overviewData, attendanceData, leavesData, performanceData] = await Promise.all([
        overviewRes.json(),
        attendanceRes.json(),
        leavesRes.json(),
        performanceRes.json(),
      ]);

      if (overviewData.success) setOverview(overviewData.stats);
      if (attendanceData.success) setAttendance(attendanceData.report);
      if (leavesData.success) setLeaves(leavesData.report);
      if (performanceData.success) setPerformance(performanceData.report);
    } catch (err) {
      setError("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
    <Card sx={{ height: "100%", borderLeft: `4px solid ${color}` }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h6" color="text.secondary">{title}</Typography>
          <Box sx={{ color }}>{icon}</Box>
        </Box>
        <Typography variant="h3" fontWeight={600} sx={{ mb: 1 }}>{value}</Typography>
        {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <DashboardLayout role={(user?.role as any) || "employee"}>
        <Container maxWidth="xl">
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        </Container>
      </DashboardLayout>
    );
  }

  const isAdminOrHR = user?.role === "company_admin" || user?.role === "hr_manager";

  return (
    <DashboardLayout role={(user?.role as any) || "employee"}>
      <Container maxWidth="xl">
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Assessment sx={{ fontSize: 40 }} color="primary" />
            <Box>
              <Typography variant="h4" component="h1" fontWeight={600}>
                Reports & Analytics
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Insights and metrics across all modules
              </Typography>
            </Box>
          </Box>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* Overview Section */}
        {overview && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Overview</Typography>
            <Grid container spacing={3}>
              {isAdminOrHR ? (
                <>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                      title="Total Employees"
                      value={overview.totalEmployees}
                      icon={<People />}
                      color="#667eea"
                      subtitle={`${overview.activeEmployees} active`}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                      title="Departments"
                      value={overview.totalDepartments}
                      icon={<People />}
                      color="#764ba2"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                      title="Active Jobs"
                      value={overview.activeJobs}
                      icon={<Schedule />}
                      color="#f093fb"
                      subtitle={`${overview.totalCandidates} candidates`}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                      title="Pending Leaves"
                      value={overview.pendingLeaves}
                      icon={<BeachAccess />}
                      color="#f5576c"
                    />
                  </Grid>
                </>
              ) : (
                <>
                  <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                      title="My Goals"
                      value={overview.myGoals}
                      icon={<TrendingUp />}
                      color="#667eea"
                      subtitle={`${overview.completedGoals} completed`}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                      title="Goal Completion"
                      value={`${overview.goalsCompletionRate}%`}
                      icon={<CheckCircle />}
                      color="#4caf50"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                      title="Pending Leaves"
                      value={overview.pendingLeaves}
                      icon={<BeachAccess />}
                      color="#f5576c"
                      subtitle={`${overview.myLeaves} total`}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        )}

        {/* Attendance Section */}
        {attendance && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Attendance ({new Date().toLocaleString('default', { month: 'long', year: 'numeric' })})
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Attendance Rate"
                  value={`${attendance.attendanceRate}%`}
                  icon={<CheckCircle />}
                  color="#4caf50"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Present Days"
                  value={attendance.presentDays}
                  icon={<CheckCircle />}
                  color="#2196f3"
                  subtitle={`${attendance.totalDays} total days`}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Avg Work Hours"
                  value={attendance.avgWorkHours}
                  icon={<Schedule />}
                  color="#ff9800"
                  subtitle="per day"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Late Days"
                  value={attendance.lateDays}
                  icon={<Schedule />}
                  color="#f44336"
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Leave Section */}
        {leaves && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Leave Requests ({new Date().getFullYear()})
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Requests"
                  value={leaves.totalRequests}
                  icon={<BeachAccess />}
                  color="#667eea"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Approved"
                  value={leaves.approvedRequests}
                  icon={<CheckCircle />}
                  color="#4caf50"
                  subtitle={`${leaves.approvalRate}% approval rate`}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Pending"
                  value={leaves.pendingRequests}
                  icon={<Schedule />}
                  color="#ff9800"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Rejected"
                  value={leaves.rejectedRequests}
                  icon={<BeachAccess />}
                  color="#f44336"
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Performance Section */}
        {performance && (
          <Box>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Performance</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Goals"
                  value={performance.goals.total}
                  icon={<TrendingUp />}
                  color="#667eea"
                  subtitle={`${performance.goals.completed} completed`}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Completion Rate"
                  value={`${performance.goals.completionRate}%`}
                  icon={<CheckCircle />}
                  color="#4caf50"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Avg Progress"
                  value={`${performance.goals.avgProgress}%`}
                  icon={<TrendingUp />}
                  color="#2196f3"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Avg Review Rating"
                  value={performance.reviews.avgRating}
                  icon={<Star />}
                  color="#ff9800"
                  subtitle={`${performance.reviews.total} reviews`}
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </Container>
    </DashboardLayout>
  );
}
