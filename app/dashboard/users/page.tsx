/**
 * User Management Page - TalentHR
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
} from "@mui/material";
import { People } from "@mui/icons-material";
import DashboardLayout from "@/components/layout/dashboard-layout";
import UserList from "@/components/users/user-list";
import { useAuth } from "@/contexts/auth-context";
import ClayCard from "@/components/ui/clay-card";

export default function UsersPage() {
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

  const handleRefresh = () => {
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
              <People sx={{ fontSize: 40, color: "white" }} />
            </Box>
            <Box>
              <Typography variant="h3" component="h1" fontWeight={800} gutterBottom>
                User Management
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 500 }}>
                Manage all users in your company. View, edit, and activate/deactivate accounts.
              </Typography>
            </Box>
          </Box>
        </ClayCard>

        <ClayCard sx={{ p: 3 }}>
          <UserList key={refreshKey} onRefresh={handleRefresh} />
        </ClayCard>
      </Container>
    </DashboardLayout>
  );
}
