/**
 * Employer Dashboard - TalentHR
 */

"use client";

import { Box, Container, Typography, Paper } from "@mui/material";
import { Person } from "@mui/icons-material";

export default function EmployerDashboard() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4 }}>
      <Container maxWidth="lg">
        <Paper sx={{ p: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Person sx={{ fontSize: 40 }} color="primary" />
            <Typography variant="h4" component="h1">
              Employer Dashboard
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Welcome to your employer dashboard. This is where you&apos;ll manage
            employees, recruitment, and HR operations.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}

