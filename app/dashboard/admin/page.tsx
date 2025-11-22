/**
 * Company Admin Dashboard - TalentHR
 * Comprehensive dashboard with all admin features
 */

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Divider,
  Chip,
} from "@mui/material";
import {
  Business,
  People,
  Mail,
  Settings,
  TrendingUp,
  Assignment,
  AccountBalance,
  Assessment,
  Work,
  Group,
  Add,
  ArrowForward,
} from "@mui/icons-material";
import DashboardLayout from "@/components/layout/dashboard-layout";
import UserList from "@/components/users/user-list";
import CompanySettingsForm from "@/components/company/company-settings-form";
import EmployeeList from "@/components/employees/employee-list";
import JobList from "@/components/recruitment/job-list";
import CandidateList from "@/components/recruitment/candidate-list";
import InterviewList from "@/components/recruitment/interview-list";

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingInvitations: 0,
    totalInvitations: 0,
    activeEmployees: 0,
    totalDepartments: 0,
    activeJobs: 0,
    totalCandidates: 0,
  });
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [refreshKey, setRefreshKey] = useState(0);

  // Check URL params to set active section
  useEffect(() => {
    const section = searchParams.get("section");
    if (section && ["users", "settings", "employees", "recruitment"].includes(section)) {
      setTimeout(() => {
        setActiveSection(section);
      }, 0);
    }
  }, [searchParams]);

  const fetchCompany = async () => {
    try {
      const response = await fetch("/api/company", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCompany(data.company);
        }
      }
    } catch (error) {
      console.error("Error fetching company:", error);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch users
      const usersResponse = await fetch("/api/users", {
        credentials: "include",
      });
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        if (usersData.success) {
          const users = usersData.users || [];
          setStats((prev) => ({
            ...prev,
            totalUsers: users.length,
            activeUsers: users.filter((u: any) => u.status === "active").length,
            activeEmployees: users.filter(
              (u: any) => u.role === "employee" && u.status === "active"
            ).length,
          }));
        }
      }

      // Fetch invitations
      const invitationsResponse = await fetch("/api/invitations", {
        credentials: "include",
      });
      if (invitationsResponse.ok) {
        const invitationsData = await invitationsResponse.json();
        if (invitationsData.success) {
          const invitations = invitationsData.invitations || [];
          setStats((prev) => ({
            ...prev,
            totalInvitations: invitations.length,
            pendingInvitations: invitations.filter(
              (inv: any) => inv.status === "pending"
            ).length,
          }));
        }
      }

      // Fetch all jobs (not closed or cancelled)
      const jobsResponse = await fetch("/api/jobs", {
        credentials: "include",
      });
      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        if (jobsData.success) {
          // Count active jobs (published and draft, excluding closed and cancelled)
          const activeJobs = jobsData.jobs?.filter(
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
        console.error("Jobs API error:", jobsResponse.status, jobsResponse.statusText);
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
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Check URL params to set active section
  useEffect(() => {
    const section = searchParams.get("section");
    if (section && ["users", "settings", "employees", "recruitment"].includes(section)) {
      setTimeout(() => {
        setActiveSection(section);
      }, 0);
    }
  }, [searchParams]);

  // Check authentication and role on mount
  useEffect(() => {
    if (authLoading) {
      return; // Still loading, wait
    }

    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }

    // Check if user is company_admin
    if (user.role !== "company_admin") {
      router.push(`/dashboard/${user.role || "employee"}`);
      return;
    }

    // Defer state update to avoid synchronous setState in effect
    setTimeout(() => {
      setCheckingAuth(false);
      fetchCompany();
      fetchStats();
    }, 0);
  }, [authLoading, isAuthenticated, user, router]);

  const handleUserSuccess = () => {
    fetchStats();
  };

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
    <DashboardLayout role="company_admin">
      <Container maxWidth="xl">
        {/* Header */}
        <Paper
          sx={{
            p: 3,
            mb: 3,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography
                variant="h4"
                component="h1"
                fontWeight={600}
                gutterBottom
              >
                Company Admin Dashboard
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {company?.name || "Your Company"} • Manage all aspects of your
                organization
              </Typography>
            </Box>
            <Business sx={{ fontSize: 64, opacity: 0.3 }} />
          </Box>
        </Paper>

        {/* Seed Data Button (Development Only) */}
        {activeSection === "overview" && (
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
        )}

        {/* Overview Section */}
        {activeSection === "overview" && (
          <>
            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: "100%" }}>
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
                          Total Users
                        </Typography>
                        <Typography variant="h4">{stats.totalUsers}</Typography>
                        <Typography variant="caption" color="success.main">
                          {stats.activeUsers} active
                        </Typography>
                      </Box>
                      <People
                        sx={{
                          fontSize: 48,
                          color: "primary.main",
                          opacity: 0.7,
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: "100%" }}>
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
                          Pending Invitations
                        </Typography>
                        <Typography variant="h4">
                          {stats.pendingInvitations}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {stats.totalInvitations} total
                        </Typography>
                      </Box>
                      <Mail
                        sx={{
                          fontSize: 48,
                          color: "warning.main",
                          opacity: 0.7,
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: "100%" }}>
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
                          Active Employees
                        </Typography>
                        <Typography variant="h4">
                          {stats.activeEmployees}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Employees
                        </Typography>
                      </Box>
                      <Group
                        sx={{ fontSize: 48, color: "info.main", opacity: 0.7 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: "100%" }}>
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
                        <Typography variant="caption" color="text.secondary">
                          {stats.totalCandidates} candidates
                        </Typography>
                      </Box>
                      <Work
                        sx={{
                          fontSize: 48,
                          color: "success.main",
                          opacity: 0.7,
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Quick Actions */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <Settings fontSize="small" />
                    Company Management
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                  >
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<Settings />}
                      onClick={() => setActiveSection("settings")}
                      sx={{ justifyContent: "flex-start" }}
                    >
                      Company Settings
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<Business />}
                      onClick={() => router.push("/dashboard/settings")}
                      sx={{ justifyContent: "flex-start" }}
                    >
                      View Company Profile
                    </Button>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <People fontSize="small" />
                    User Management
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                  >
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<People />}
                      onClick={() => setActiveSection("users")}
                      sx={{ justifyContent: "flex-start" }}
                    >
                      Manage Users
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<Mail />}
                      onClick={() => setActiveSection("invitations")}
                      sx={{ justifyContent: "flex-start" }}
                    >
                      Manage Invitations
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            {/* Feature Cards */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    height: "100%",
                    cursor: "pointer",
                    "&:hover": { boxShadow: 6 },
                  }}
                  onClick={() => setActiveSection("employees")}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Group sx={{ fontSize: 40, color: "primary.main" }} />
                      <Box>
                        <Typography variant="h6">
                          Employee Management
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Full access to employee database
                        </Typography>
                      </Box>
                    </Box>
                    <Chip label="Full Access" color="primary" size="small" />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    height: "100%",
                    cursor: "pointer",
                    "&:hover": { boxShadow: 6 },
                  }}
                  onClick={() => setActiveSection("recruitment")}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Work sx={{ fontSize: 40, color: "info.main" }} />
                      <Box>
                        <Typography variant="h6">Recruitment</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Job postings, ATS, interviews
                        </Typography>
                      </Box>
                    </Box>
                    <Chip label="Full Access" color="info" size="small" />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    height: "100%",
                    cursor: "pointer",
                    "&:hover": { boxShadow: 6 },
                  }}
                  onClick={() => setActiveSection("reports")}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Assessment
                        sx={{ fontSize: 40, color: "success.main" }}
                      />
                      <Box>
                        <Typography variant="h6">
                          Reports & Analytics
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Comprehensive reports and insights
                        </Typography>
                      </Box>
                    </Box>
                    <Chip label="Full Access" color="success" size="small" />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    height: "100%",
                    cursor: "pointer",
                    "&:hover": { boxShadow: 6 },
                  }}
                  onClick={() => setActiveSection("payroll")}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <AccountBalance
                        sx={{ fontSize: 40, color: "warning.main" }}
                      />
                      <Box>
                        <Typography variant="h6">Payroll & Benefits</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Salary, benefits, payslips
                        </Typography>
                      </Box>
                    </Box>
                    <Chip label="Full Access" color="warning" size="small" />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    height: "100%",
                    cursor: "pointer",
                    "&:hover": { boxShadow: 6 },
                  }}
                  onClick={() => setActiveSection("attendance")}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Assignment
                        sx={{ fontSize: 40, color: "secondary.main" }}
                      />
                      <Box>
                        <Typography variant="h6">Attendance & Leave</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Time tracking, leave management
                        </Typography>
                      </Box>
                    </Box>
                    <Chip label="Full Access" color="secondary" size="small" />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    height: "100%",
                    cursor: "pointer",
                    "&:hover": { boxShadow: 6 },
                  }}
                  onClick={() => setActiveSection("departments")}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Business sx={{ fontSize: 40, color: "primary.main" }} />
                      <Box>
                        <Typography variant="h6">Departments</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Organizational structure
                        </Typography>
                      </Box>
                    </Box>
                    <Chip label="Full Access" color="primary" size="small" />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}

        {/* Users Section */}
        {activeSection === "users" && (
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 3,
              }}
            >
              <Typography variant="h5" fontWeight={600}>
                User Management
              </Typography>
              <Button
                variant="outlined"
                startIcon={<ArrowForward />}
                onClick={() => setActiveSection("overview")}
              >
                Back to Overview
              </Button>
            </Box>
            <UserList key={refreshKey} onRefresh={handleUserSuccess} />
          </Box>
        )}

        {/* Settings Section */}
        {activeSection === "settings" && (
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 3,
              }}
            >
              <Typography variant="h5" fontWeight={600}>
                Company Settings
              </Typography>
              <Button
                variant="outlined"
                startIcon={<ArrowForward />}
                onClick={() => setActiveSection("overview")}
              >
                Back to Overview
              </Button>
            </Box>
            <CompanySettingsForm />
          </Box>
        )}

        {/* Employees Section */}
        {activeSection === "employees" && (
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 3,
              }}
            >
              <Typography variant="h5" fontWeight={600}>
                Employee Management
              </Typography>
              <Button
                variant="outlined"
                startIcon={<ArrowForward />}
                onClick={() => setActiveSection("overview")}
              >
                Back to Overview
              </Button>
            </Box>
            <EmployeeList key={refreshKey} onRefresh={handleUserSuccess} />
          </Box>
        )}

        {/* Recruitment Section */}
        {activeSection === "recruitment" && (
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 3,
              }}
            >
              <Typography variant="h5" fontWeight={600}>
                Recruitment Management
              </Typography>
              <Button
                variant="outlined"
                startIcon={<ArrowForward />}
                onClick={() => setActiveSection("overview")}
              >
                Back to Overview
              </Button>
            </Box>
            <Paper sx={{ p: 2, mb: 3, bgcolor: "info.light", color: "info.contrastText" }}>
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
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
              <Button
                variant={activeSection === "recruitment" ? "contained" : "text"}
                onClick={() => router.push("/dashboard/recruiter")}
                sx={{ mr: 2 }}
              >
                Go to Recruiter Dashboard
              </Button>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              For full recruitment features, please visit the{" "}
              <Button
                variant="text"
                onClick={() => router.push("/dashboard/recruiter")}
                sx={{ textTransform: "none" }}
              >
                Recruiter Dashboard
              </Button>
            </Typography>
          </Box>
        )}

        {/* Other Sections - Placeholders */}
        {["reports", "payroll", "attendance", "departments"].includes(
          activeSection
        ) && (
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 3,
              }}
            >
              <Typography variant="h5" fontWeight={600}>
                {activeSection.charAt(0).toUpperCase() +
                  activeSection.slice(1).replace(/_/g, " ")}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<ArrowForward />}
                onClick={() => setActiveSection("overview")}
              >
                Back to Overview
              </Button>
            </Box>
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {activeSection.charAt(0).toUpperCase() +
                  activeSection.slice(1).replace(/_/g, " ")}{" "}
                Module
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                This feature is coming soon. Check back later for updates.
              </Typography>
            </Paper>
          </Box>
        )}
      </Container>
    </DashboardLayout>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense
      fallback={
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
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
