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
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: "absolute",
          top: "-10%",
          left: "-10%",
          width: "50%",
          height: "50%",
          background: "radial-gradient(circle, rgba(102,126,234,0.4) 0%, rgba(118,75,162,0) 70%)",
          filter: "blur(60px)",
          zIndex: 0,
          animation: "float 10s infinite ease-in-out",
          "@keyframes float": {
            "0%, 100%": { transform: "translate(0, 0)" },
            "50%": { transform: "translate(20px, 20px)" },
          },
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "-10%",
          right: "-10%",
          width: "50%",
          height: "50%",
          background: "radial-gradient(circle, rgba(118,75,162,0.4) 0%, rgba(102,126,234,0) 70%)",
          filter: "blur(60px)",
          zIndex: 0,
          animation: "float-reverse 12s infinite ease-in-out",
          "@keyframes float-reverse": {
            "0%, 100%": { transform: "translate(0, 0)" },
            "50%": { transform: "translate(-20px, -20px)" },
          },
        }}
      />

      <Box sx={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "450px", px: 2 }}>
        <LoginForm />
      </Box>
    </Box>
  );
}
