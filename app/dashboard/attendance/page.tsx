"use client";

import { Box, Typography, Grid, Container } from "@mui/material";
import AttendanceClock from "@/components/attendance/AttendanceClock";
import AttendanceStats from "@/components/attendance/AttendanceStats";
import AttendanceList from "@/components/attendance/AttendanceList";
import { useAuth } from "@/contexts/auth-context";
import { useState } from "react";

export default function AttendancePage() {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleStatusChange = () => {
    // Trigger a refresh of stats and list when clock status changes
    setRefreshKey((prev) => prev + 1);
  };

  if (!user) return null;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Attendance Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track time, view attendance history, and manage work hours.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Clock Widget - Only for Employees/Managers */}
        {(user.role === "employee" || user.role === "manager" || user.role === "hr_manager" || user.role === "company_admin") && (
          <Grid item xs={12} md={4} lg={3}>
            <AttendanceClock onStatusChange={handleStatusChange} />
          </Grid>
        )}
        
        {/* Stats - Takes remaining space */}
        <Grid item xs={12} md={8} lg={9}>
          <AttendanceStats key={`stats-${refreshKey}`} />
        </Grid>
      </Grid>

      {/* Attendance List */}
      <Box>
        <AttendanceList key={`list-${refreshKey}`} />
      </Box>
    </Container>
  );
}
