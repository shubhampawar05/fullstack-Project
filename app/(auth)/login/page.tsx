/**
 * Login Page - TalentHR
 */

"use client";

import { Box } from "@mui/material";
import LoginForm from "@/components/auth/login-form";

export default function LoginPage() {
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
