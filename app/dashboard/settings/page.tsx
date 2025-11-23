/**
 * Company Settings Page - TalentHR
 * Soft Claymorphism Design
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  CircularProgress,
  Typography,
} from "@mui/material";
import { Settings } from "@mui/icons-material";
import DashboardLayout from "@/components/layout/dashboard-layout";
import CompanySettingsForm from "@/components/company/company-settings-form";
import { useAuth } from "@/contexts/auth-context";
import ClayCard from "@/components/ui/clay-card";

export default function CompanySettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check authentication and role on mount
  useEffect(() => {
    if (authLoading) {
      return; // Still loading, wait
    }

    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }

    // Check if user is company admin
    if (user.role !== "company_admin") {
      router.push(`/dashboard/${user.role || "employee"}`);
      return;
    }

    // Defer state update to avoid synchronous setState in effect
    setTimeout(() => {
      setCheckingAuth(false);
    }, 0);
  }, [authLoading, isAuthenticated, user, router]);

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
      <Container maxWidth="lg" sx={{ pb: 4 }}>
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
              <Settings sx={{ fontSize: 40, color: "white" }} />
            </Box>
            <Box>
              <Typography variant="h3" component="h1" fontWeight={800} gutterBottom>
                Company Settings
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 500 }}>
                Manage your company profile, branding, and preferences.
              </Typography>
            </Box>
          </Box>
        </ClayCard>

        <ClayCard sx={{ p: 4 }}>
          <CompanySettingsForm />
        </ClayCard>
      </Container>
    </DashboardLayout>
  );
}
