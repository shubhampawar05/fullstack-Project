/**
 * Login Page - TalentHR
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";
import LoginForm from "@/components/auth/login-form";

export default function LoginPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
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
        // Not authenticated, show login form
        setCheckingAuth(false);
      } catch (error) {
        console.error("Auth check error:", error);
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

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
