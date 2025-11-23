/**
 * Invitations Management Page - TalentHR
 * Professional, Minimal, and Premium UI
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  AvatarGroup,
  Stack,
  useTheme,
} from "@mui/material";
import {
  Send,
  CheckCircle,
  Schedule,
  Cancel,
  People,
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";
import DashboardLayout from "@/components/layout/dashboard-layout";
import InvitationList from "@/components/invitations/invitation-list";
import InvitationForm from "@/components/invitations/invitation-form";
import { useAuth } from "@/contexts/auth-context";

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

export default function InvitationsPage() {
  const router = useRouter();
  const theme = useTheme();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Dummy stats (replace with real data from API)
  const stats = {
    totalInvitations: 24,
    pending: 8,
    accepted: 14,
    expired: 2,
  };

  // Check authentication and role on mount
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }

    if (user.role !== "company_admin" && user.role !== "hr_manager") {
      router.push(`/dashboard/${user.role || "employee"}`);
      return;
    }

    setTimeout(() => {
      setCheckingAuth(false);
    }, 0);
  }, [authLoading, isAuthenticated, user, router]);

  const handleInvitationSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

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
    <DashboardLayout role={(user?.role as any) || "company_admin"}>
      <Container maxWidth="xl" sx={{ pb: 4 }}>
        {/* Hero Header - Consistent with Admin Dashboard */}
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
                  Invitation Management
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, mb: 3, maxWidth: 600 }}>
                  Invite new team members and track invitation status. You have {stats.pending} pending invites.
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <Chip
                    label={`${stats.accepted} Accepted`}
                    sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "white", fontWeight: 600, backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                  <Chip
                    label={`${stats.totalInvitations} Total Sent`}
                    sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "white", fontWeight: 600, backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </Stack>
              </Box>
              <Box sx={{ display: { xs: "none", md: "block" } }}>
                <AvatarGroup max={4} sx={{ "& .MuiAvatar-root": { border: "3px solid rgba(255,255,255,0.2)", width: 60, height: 60, fontSize: 20 } }}>
                  <Avatar>A</Avatar>
                  <Avatar>B</Avatar>
                  <Avatar>C</Avatar>
                  <Avatar>D</Avatar>
                </AvatarGroup>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Stats Cards - Minimal Style */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            {
              title: "Total Invitations",
              value: stats.totalInvitations,
              icon: <Send sx={{ fontSize: 28 }} />,
              color: "#667eea",
              subtitle: "All time",
            },
            {
              title: "Pending",
              value: stats.pending,
              icon: <Schedule sx={{ fontSize: 28 }} />,
              color: "#f59e0b",
              subtitle: "Awaiting response",
            },
            {
              title: "Accepted",
              value: stats.accepted,
              icon: <CheckCircle sx={{ fontSize: 28 }} />,
              color: "#10b981",
              subtitle: "Joined successfully",
            },
            {
              title: "Expired",
              value: stats.expired,
              icon: <Cancel sx={{ fontSize: 28 }} />,
              color: "#ef4444",
              subtitle: "Need resending",
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

        {/* Main Content */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <MinimalCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Send New Invitation
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 3 }}>
                  Invite a new team member to join your organization
                </Typography>
                <InvitationForm onSuccess={handleInvitationSuccess} />
              </CardContent>
            </MinimalCard>
          </Grid>
          <Grid item xs={12} md={8}>
            <MinimalCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  All Invitations
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 3 }}>
                  View and manage all sent invitations
                </Typography>
                <InvitationList key={refreshKey} />
              </CardContent>
            </MinimalCard>
          </Grid>
        </Grid>
      </Container>
    </DashboardLayout>
  );
}
