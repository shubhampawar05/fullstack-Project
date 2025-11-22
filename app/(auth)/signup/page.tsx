/**
 * Signup Page - TalentHR
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";
import SignupForm from "@/components/auth/signup-form";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const token = searchParams.get("token");

  useEffect(() => {
    // If there's an invitation token, allow signup (invitation-based signup)
    if (token) {
      setCheckingAuth(false);
      return;
    }

    // Check if user is already authenticated (only for company admin signup)
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            // User is already authenticated, redirect to their dashboard
            const role = data.user.role;
            const dashboardPath =
              role === "company_admin"
                ? "/dashboard/admin"
                : `/dashboard/${role}`;
            router.replace(dashboardPath);
            return;
          }
        }
        // Not authenticated, show signup form
        setCheckingAuth(false);
      } catch (error) {
        console.error("Auth check error:", error);
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router, token]);

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
