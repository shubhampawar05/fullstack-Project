/**
 * Invitations Management Page - TalentHR
 * Soft Claymorphism Design
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Grid,
  Avatar,
} from "@mui/material";
import { Mail, PersonAdd } from "@mui/icons-material";
import DashboardLayout from "@/components/layout/dashboard-layout";
import InvitationList from "@/components/invitations/invitation-list";
import InvitationForm from "@/components/invitations/invitation-form";
import { useAuth } from "@/contexts/auth-context";
import ClayCard from "@/components/ui/clay-card";

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
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Box
              sx={{
                p: 2,
                bgcolor: "rgba(255,255,255,0.2)",
                borderRadius: 4,
                backdropFilter: "blur(10px)",
              }}
            >
              <Mail sx={{ fontSize: 40, color: "white" }} />
            </Box>
            <Box>
              <Typography variant="h3" component="h1" fontWeight={800} gutterBottom>
                Invitation Management
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 500 }}>
                Invite new users to join your organization and manage existing invitations
              </Typography>
            </Box>
          </Box>
        </ClayCard>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <ClayCard sx={{ p: 3, height: "100%" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: "#f0f4f8", color: "primary.main" }}>
                  <PersonAdd />
                </Box>
                <Typography variant="h6" fontWeight={700}>
                  Send New Invitation
                </Typography>
              </Box>
              <InvitationForm onSuccess={handleInvitationSuccess} />
            </ClayCard>
          </Grid>
          <Grid item xs={12} md={8}>
            <ClayCard sx={{ p: 3, height: "100%" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: "#f0f4f8", color: "primary.main" }}>
                  <Mail />
                </Box>
                <Typography variant="h6" fontWeight={700}>
                  All Invitations
                </Typography>
              </Box>
              <InvitationList key={refreshKey} />
            </ClayCard>
          </Grid>
        </Grid>
      </Container>
    </DashboardLayout>
  );
}
