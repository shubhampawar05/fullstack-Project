/**
 * Attendance & Leave Page - TalentHR
 * Main page for attendance tracking and leave management
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Grid,
} from "@mui/material";
import { AccessTime, BeachAccess, Add } from "@mui/icons-material";
import DashboardLayout from "@/components/layout/dashboard-layout";
import AttendanceClock from "@/components/attendance/attendance-clock";
import LeaveBalanceCards from "@/components/leaves/leave-balance-cards";
import LeaveRequestForm from "@/components/leaves/leave-request-form";
import LeaveList from "@/components/leaves/leave-list";
import { useAuth } from "@/contexts/auth-context";

export default function AttendanceLeavePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [leaveFormOpen, setLeaveFormOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <DashboardLayout role={(user?.role as any) || "employee"}>
      <Container maxWidth="xl">
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <AccessTime sx={{ fontSize: 40 }} color="primary" />
              <Box>
                <Typography variant="h4" component="h1" fontWeight={600}>
                  Attendance & Leave
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Track your attendance and manage leave requests
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab icon={<AccessTime />} label="Attendance" />
            <Tab icon={<BeachAccess />} label="Leave Management" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {tabValue === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <AttendanceClock onClockAction={handleRefresh} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Attendance Summary
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your attendance statistics will appear here.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}

        {tabValue === 1 && (
          <Box>
            {/* Leave Balance */}
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" fontWeight={600}>
                  Leave Balance
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setLeaveFormOpen(true)}
                  sx={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                    },
                  }}
                >
                  Request Leave
                </Button>
              </Box>
              <LeaveBalanceCards key={refreshKey} />
            </Box>

            {/* Leave Requests */}
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Leave Requests
              </Typography>
              <LeaveList key={refreshKey} onRefresh={handleRefresh} />
            </Box>
          </Box>
        )}

        {/* Leave Request Form */}
        <LeaveRequestForm
          open={leaveFormOpen}
          onClose={() => setLeaveFormOpen(false)}
          onSuccess={handleRefresh}
        />
      </Container>
    </DashboardLayout>
  );
}
