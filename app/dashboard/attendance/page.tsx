/**
 * Attendance Page - TalentHR
 * Soft Claymorphism Design
 */

"use client";

import { Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";
import DashboardLayout from "@/components/layout/dashboard-layout";
import AttendanceDashboard from "@/components/attendance/attendance-dashboard";
import { useAuth } from "@/contexts/auth-context";

export default function AttendancePage() {
  const { user } = useAuth();

  return (
    <DashboardLayout role={(user?.role as any) || "employee"}>
      <Suspense
        fallback={
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "100vh",
            }}
          >
            <CircularProgress />
          </Box>
        }
      >
        <AttendanceDashboard />
      </Suspense>
    </DashboardLayout>
  );
}
