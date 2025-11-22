/**
 * Login Page - TalentHR
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";
import LoginForm from "@/components/auth/login-form";
import { useAuth } from "@/contexts/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (loading) {
      return; // Still loading, wait
    }

    if (user) {
      // User is already authenticated, redirect to their dashboard
      const role = user.role;
      const dashboardPath =
        role === "company_admin" ? "/dashboard/admin" : `/dashboard/${role}`;
      router.replace(dashboardPath);
      return;
    }

    // Not authenticated, show login form - defer state update
    setTimeout(() => {
      setCheckingAuth(false);
    }, 0);
  }, [user, loading, router]);

  // Show loading while checking authentication
  if (checkingAuth) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <LoginForm />
    </Box>
  );
}
