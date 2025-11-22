/**
 * Home Page - TalentHR
 * Redirects to login or appropriate dashboard
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Container, Typography, Button, Card, CardContent } from "@mui/material";
import { Business, Person } from "@mui/icons-material";

export default function HomePage() {
  const router = useRouter();

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
      <Container maxWidth="md">
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom fontWeight={600}>
            TalentHR
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Human Resources Management System
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            Manage your workforce, recruitment, and HR operations with ease
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => router.push("/login")}
          >
            Sign In
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => router.push("/signup")}
          >
            Sign Up
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
