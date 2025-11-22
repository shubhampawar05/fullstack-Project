/**
 * Signup Page - TalentHR
 */

"use client";

import { Box } from "@mui/material";
import SignupForm from "@/components/auth/signup-form";

export default function SignupPage() {
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
