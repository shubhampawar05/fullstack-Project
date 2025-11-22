/**
 * Employee Management Page - TalentHR
 * List and manage all employees
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Button,
} from "@mui/material";
import { Add, People } from "@mui/icons-material";
import DashboardLayout from "@/components/layout/dashboard-layout";
import EmployeeList from "@/components/employees/employee-list";
import EmployeeFormDialog from "@/components/employees/employee-form-dialog";
import { useAuth } from "@/contexts/auth-context";

export default function EmployeesPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [formDialog, setFormDialog] = useState(false);

  // Check authentication and role on mount
  useEffect(() => {
    if (authLoading) {
      return; // Still loading, wait
    }

    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }

    // Check if user has permission (Admin, HR, or Manager)
    if (
      user.role !== "company_admin" &&
      user.role !== "hr_manager" &&
      user.role !== "manager"
    ) {
      router.push(`/dashboard/${user.role || "employee"}`);
      return;
    }

    // Defer state update to avoid synchronous setState in effect
    setTimeout(() => {
      setCheckingAuth(false);
    }, 0);
  }, [authLoading, isAuthenticated, user, router]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleFormSuccess = () => {
    setFormDialog(false);
    handleRefresh();
  };

  // Show loading while checking auth
  if (checkingAuth) {
    return (
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
    );
  }

  return (
    <DashboardLayout role={(user?.role as any) || "company_admin"}>
      <Container maxWidth="xl">
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <People sx={{ fontSize: 40 }} color="primary" />
              <Box>
                <Typography variant="h4" component="h1" fontWeight={600}>
                  Employee Management
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage employee records, departments, and organizational structure
                </Typography>
              </Box>
            </Box>
            {(user?.role === "company_admin" || user?.role === "hr_manager") && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setFormDialog(true)}
                sx={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                  },
                }}
              >
                Add Employee
              </Button>
            )}
          </Box>
        </Paper>

        <EmployeeList key={refreshKey} onRefresh={handleRefresh} />

        {/* Create Employee Dialog */}
        <EmployeeFormDialog
          open={formDialog}
          employee={null}
          onClose={() => setFormDialog(false)}
          onSuccess={handleFormSuccess}
        />
      </Container>
    </DashboardLayout>
  );
}

