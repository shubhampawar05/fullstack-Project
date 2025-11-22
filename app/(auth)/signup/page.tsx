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

      <Box sx={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "550px", px: 2 }}>
        <SignupForm />
      </Box>
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
