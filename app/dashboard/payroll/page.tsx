/**
 * Payroll Page - TalentHR
 * Soft Claymorphism Design
 */

"use client";

import { Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";
import DashboardLayout from "@/components/layout/dashboard-layout";
import PayrollDashboard from "@/components/payroll/payroll-dashboard";
import { useAuth } from "@/contexts/auth-context";

export default function PayrollPage() {
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
        <PayrollDashboard />
      </Suspense>
    </DashboardLayout>
  );
}
