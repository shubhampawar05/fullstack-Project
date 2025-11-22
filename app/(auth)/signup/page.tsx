/**
 * Signup Page - TalentHR
 */

"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";
import SignupForm from "@/components/auth/signup-form";
import { useAuth } from "@/contexts/auth-context";

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const token = searchParams.get("token");

  useEffect(() => {
    // If there's an invitation token, allow signup (invitation-based signup)
    if (token) {
      setTimeout(() => {
        setCheckingAuth(false);
      }, 0);
      return;
    }

    if (loading) {
      return; // Still loading, wait
    }

    if (user) {
      // User is already authenticated, redirect to their dashboard
      const role = user.role;
      const dashboardPath =
        role === "company_admin"
          ? "/dashboard/admin"
          : `/dashboard/${role}`;
      router.replace(dashboardPath);
      return;
    }

    // Not authenticated, show signup form - defer state update
    setTimeout(() => {
      setCheckingAuth(false);
    }, 0);
  }, [user, loading, router, token]);

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
      <SignupForm />
    </Box>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
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
      }
    >
      <SignupContent />
    </Suspense>
  );
}
