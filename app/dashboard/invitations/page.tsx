/**
 * Invitations Management Page - TalentHR
 * Separate page for managing user invitations
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
} from "@mui/material";
import DashboardLayout from "@/components/layout/dashboard-layout";
import InvitationList from "@/components/invitations/invitation-list";
import InvitationForm from "@/components/invitations/invitation-form";
import { useAuth } from "@/contexts/auth-context";

export default function InvitationsPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Check authentication and role on mount
  useEffect(() => {
    if (authLoading) {
      return; // Still loading, wait
    }

    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }

    // Check if user has permission (Admin or HR Manager)
    if (user.role !== "company_admin" && user.role !== "hr_manager") {
      router.push(`/dashboard/${user.role || "employee"}`);
      return;
    }

    // Defer state update to avoid synchronous setState in effect
    setTimeout(() => {
      setCheckingAuth(false);
    }, 0);
  }, [authLoading, isAuthenticated, user, router]);

  const handleInvitationSuccess = () => {
    setRefreshKey((prev) => prev + 1);
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
    <DashboardLayout role={(user?.role as any) || "company_admin"}>
      <Container maxWidth="xl">
        <Paper
          sx={{
            p: 3,
            mb: 3,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
            Invitation Management
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Invite new users to join your organization and manage existing invitations
          </Typography>
        </Paper>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <InvitationForm onSuccess={handleInvitationSuccess} />
          </Grid>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                All Invitations
              </Typography>
              <InvitationList key={refreshKey} />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </DashboardLayout>
  );
}

