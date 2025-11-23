/**
 * Company Admin Dashboard - TalentHR
 * Soft Claymorphism Design
 */

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
  Box,
  Container,
  Typography,
  Grid,
  CardContent,
  CircularProgress,
  Divider,
  Chip,
  Stack,
  IconButton,
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
  MoreVert,
} from "@mui/icons-material";
import DashboardLayout from "@/components/layout/dashboard-layout";
import UserList from "@/components/users/user-list";
import CompanySettingsForm from "@/components/company/company-settings-form";
import EmployeeList from "@/components/employees/employee-list";
import JobList from "@/components/recruitment/job-list";
import CandidateList from "@/components/recruitment/candidate-list";
import InterviewList from "@/components/recruitment/interview-list";
import ClayCard from "@/components/ui/clay-card";
import ClayButton from "@/components/ui/clay-button";

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
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Check authentication and role on mount
  useEffect(() => {
    if (authLoading) {
      return; // Still loading, wait
    }

    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }

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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography
                variant="h3"
                component="h1"
                fontWeight={800}
                gutterBottom
                sx={{ letterSpacing: "-1px" }}
              >
                Admin Dashboard
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 500 }}>
                {company?.name || "Your Company"} • Overview
              </Typography>
            </Box>
            <Box
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                p: 2,
                borderRadius: 4,
                backdropFilter: "blur(10px)",
                display: { xs: "none", sm: "block" }
              }}
            >
              <Business sx={{ fontSize: 48, color: "white" }} />
            </Box>
          </Box>
        </ClayCard>

        {/* Seed Data Button (Development Only) */}
        {activeSection === "overview" && (
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
        )}

        {/* Overview Section */}
        {activeSection === "overview" && (
          <>
            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {[
                { title: "Total Users", value: stats.totalUsers, sub: `${stats.activeUsers} active`, icon: <People />, color: "#6c5ce7" },
                { title: "Pending Invites", value: stats.pendingInvitations, sub: `${stats.totalInvitations} total`, icon: <Mail />, color: "#fdcb6e" },
                { title: "Employees", value: stats.activeEmployees, sub: "Active Staff", icon: <Group />, color: "#00cec9" },
                { title: "Active Jobs", value: stats.activeJobs, sub: `${stats.totalCandidates} candidates`, icon: <Work />, color: "#55efc4" },
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

            {/* Quick Actions */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <ClayCard sx={{ p: 3, height: "100%" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                    <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: "#f0f4f8", color: "text.primary" }}>
                      <Settings />
                    </Box>
                    <Typography variant="h6" fontWeight={700}>
                      Company Management
                    </Typography>
                  </Box>
                  <Stack spacing={2}>
                    <ClayButton
                      variant="outlined"
                      fullWidth
                      startIcon={<Settings />}
                      onClick={() => setActiveSection("settings")}
                      sx={{ justifyContent: "flex-start", py: 1.5 }}
                    >
                      Company Settings
                    </ClayButton>
                    <ClayButton
                      variant="outlined"
                      fullWidth
                      startIcon={<Business />}
                      onClick={() => router.push("/dashboard/settings")}
                      sx={{ justifyContent: "flex-start", py: 1.5 }}
                    >
                      View Company Profile
                    </ClayButton>
                  </Stack>
                </ClayCard>
              </Grid>

              <Grid item xs={12} md={6}>
                <ClayCard sx={{ p: 3, height: "100%" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                    <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: "#f0f4f8", color: "text.primary" }}>
                      <People />
                    </Box>
                    <Typography variant="h6" fontWeight={700}>
                      User Management
                    </Typography>
                  </Box>
                  <Stack spacing={2}>
                    <ClayButton
                      variant="outlined"
                      fullWidth
                      startIcon={<People />}
                      onClick={() => setActiveSection("users")}
                      sx={{ justifyContent: "flex-start", py: 1.5 }}
                    >
                      Manage Users
                    </ClayButton>
                    <ClayButton
                      variant="outlined"
                      fullWidth
                      startIcon={<Mail />}
                      onClick={() => setActiveSection("invitations")}
                      sx={{ justifyContent: "flex-start", py: 1.5 }}
                    >
                      Manage Invitations
                    </ClayButton>
                  </Stack>
                </ClayCard>
              </Grid>
            </Grid>

            {/* Feature Cards */}
            <Typography variant="h5" fontWeight={700} sx={{ mb: 3, ml: 1 }}>
              Quick Access
            </Typography>
            <Grid container spacing={3}>
              {[
                { title: "Employee Management", desc: "Full access to employee database", icon: <Group />, color: "primary", section: "employees" },
                { title: "Recruitment", desc: "Job postings, ATS, interviews", icon: <Work />, color: "info", section: "recruitment" },
                { title: "Reports & Analytics", desc: "Comprehensive reports and insights", icon: <Assessment />, color: "success", section: "reports" },
                { title: "Payroll & Benefits", desc: "Salary, benefits, payslips", icon: <AccountBalance />, color: "warning", section: "payroll" },
                { title: "Attendance & Leave", desc: "Time tracking, leave management", icon: <Assignment />, color: "secondary", section: "attendance" },
                { title: "Departments", desc: "Organizational structure", icon: <Business />, color: "primary", section: "departments" },
              ].map((feature, idx) => (
                <Grid item xs={12} md={4} key={idx}>
                  <ClayCard
                    sx={{
                      height: "100%",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      "&:hover": { transform: "translateY(-8px)" },
                    }}
                    onClick={() => setActiveSection(feature.section)}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 3,
                            bgcolor: `${feature.color}.main`,
                            color: "white",
                            boxShadow: "4px 4px 8px rgba(0,0,0,0.1)",
                          }}
                        >
                          {feature.icon}
                        </Box>
                        <Box>
                          <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                            {feature.title}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                        {feature.desc}
                      </Typography>
                      <Chip 
                        label="Full Access" 
                        size="small" 
                        sx={{ 
                          bgcolor: `${feature.color}.light`, 
                          color: "white", 
                          fontWeight: 600 
                        }} 
                      />
                    </CardContent>
                  </ClayCard>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {/* Users Section */}
        {activeSection === "users" && (
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4 }}>
              <Typography variant="h4" fontWeight={700}>
                User Management
              </Typography>
              <ClayButton
                variant="outlined"
                startIcon={<ArrowForward />}
                onClick={() => setActiveSection("overview")}
              >
                Back to Overview
              </ClayButton>
            </Box>
            <UserList key={refreshKey} onRefresh={handleUserSuccess} />
          </Box>
        )}

        {/* Settings Section */}
        {activeSection === "settings" && (
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4 }}>
              <Typography variant="h4" fontWeight={700}>
                Company Settings
              </Typography>
              <ClayButton
                variant="outlined"
                startIcon={<ArrowForward />}
                onClick={() => setActiveSection("overview")}
              >
                Back to Overview
              </ClayButton>
            </Box>
            <CompanySettingsForm />
          </Box>
        )}

        {/* Employees Section */}
        {activeSection === "employees" && (
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4 }}>
              <Typography variant="h4" fontWeight={700}>
                Employee Management
              </Typography>
              <ClayButton
                variant="outlined"
                startIcon={<ArrowForward />}
                onClick={() => setActiveSection("overview")}
              >
                Back to Overview
              </ClayButton>
            </Box>
            <EmployeeList />
          </Box>
        )}

        {/* Recruitment Section */}
        {activeSection === "recruitment" && (
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4 }}>
              <Typography variant="h4" fontWeight={700}>
                Recruitment
              </Typography>
              <ClayButton
                variant="outlined"
                startIcon={<ArrowForward />}
                onClick={() => setActiveSection("overview")}
              >
                Back to Overview
              </ClayButton>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <ClayCard sx={{ p: 0, overflow: "hidden" }}>
                  <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <Stack direction="row" spacing={2} sx={{ p: 2 }}>
                      <ClayButton variant="contained">Jobs</ClayButton>
                      <ClayButton variant="text">Candidates</ClayButton>
                      <ClayButton variant="text">Interviews</ClayButton>
                    </Stack>
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <JobList />
                  </Box>
                </ClayCard>
              </Grid>
            </Grid>
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
