/**
 * Leave Management Dashboard - TalentHR
 * Modern leave request and approval system
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Button,
  Avatar,
  Chip,
  IconButton,
  LinearProgress,
  Divider,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  EventNote,
  Add,
  CheckCircle,
  Cancel,
  Schedule,
  TrendingUp,
  CalendarToday,
  Close,
  Send,
  MoreVert,
} from "@mui/icons-material";
import DashboardLayout from "@/components/layout/dashboard-layout";
import {
  dummyEmployees,
  dummyLeaves,
  leaveBalances,
} from "@/utils/dummyData";

export default function LeaveDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [openRequestDialog, setOpenRequestDialog] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"all" | "pending" | "approved" | "rejected">("all");

  // Simulate current employee
  const currentEmployee = dummyEmployees[4];
  const myLeaveBalance = leaveBalances.find(lb => lb.employeeId === currentEmployee.id);
  
  // Filter leaves
  const myLeaves = dummyLeaves.filter(l => l.employeeId === currentEmployee.id);
  const displayedLeaves = selectedTab === 'all' 
    ? myLeaves 
    : myLeaves.filter(l => l.status.toLowerCase() === selectedTab);

  // Calculate stats
  const stats = {
    pending: myLeaves.filter(l => l.status === 'Pending').length,
    approved: myLeaves.filter(l => l.status === 'Approved').length,
    rejected: myLeaves.filter(l => l.status === 'Rejected').length,
    totalDays: myLeaves.filter(l => l.status === 'Approved').reduce((sum, l) => sum + l.days, 0),
  };

  // Upcoming leaves
  const upcomingLeaves = myLeaves
    .filter(l => l.status === 'Approved' && new Date(l.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3);

  // Check authentication
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }
    setTimeout(() => setCheckingAuth(false), 0);
  }, [authLoading, isAuthenticated, user, router]);

  if (checkingAuth) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return '#10b981';
      case 'Pending': return '#f59e0b';
      case 'Rejected': return '#ef4444';
      case 'Cancelled': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'Casual': return '#667eea';
      case 'Sick': return '#f59e0b';
      case 'Earned': return '#10b981';
      case 'Maternity': return '#ec4899';
      case 'Paternity': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  return (
    <DashboardLayout role="employee">
      <Container maxWidth="xl" sx={{ pb: 4 }}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 4,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(118, 75, 162, 0.4)",
          }}
        >
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
              <Box>
                <Typography variant="h4" fontWeight={700} gutterBottom sx={{ letterSpacing: "-0.5px" }}>
                  Leave Management
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.95, mb: 2 }}>
                  Request and track your leaves
                </Typography>
                <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                  <Chip
                    label={`${stats.pending} Pending`}
                    sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 600 }}
                  />
                  <Chip
                    label={`${stats.approved} Approved`}
                    sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 600 }}
                  />
                  <Chip
                    label={`${stats.totalDays} Days Taken`}
                    sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 600 }}
                  />
                </Box>
              </Box>
              <Button
                variant="contained"
                size="large"
                startIcon={<Add />}
                onClick={() => setOpenRequestDialog(true)}
                sx={{
                  bgcolor: "white",
                  color: "primary.main",
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.9)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                  },
                }}
              >
                Request Leave
              </Button>
            </Box>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          {/* Leave Balance */}
          <Grid item xs={12}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                border: "1px solid rgba(255,255,255,0.6)",
                background: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(12px)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Leave Balance
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {[
                    { type: "Casual Leave", ...myLeaveBalance?.casual, color: "#667eea", icon: "☀️" },
                    { type: "Sick Leave", ...myLeaveBalance?.sick, color: "#f59e0b", icon: "🤒" },
                    { type: "Earned Leave", ...myLeaveBalance?.earned, color: "#10b981", icon: "🏖️" },
                  ].map((leave, idx) => (
                    <Grid item xs={12} md={4} key={idx}>
                      <Box
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${leave.color}15 0%, ${leave.color}05 100%)`,
                          border: `2px solid ${leave.color}30`,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: `0 8px 24px ${leave.color}40`,
                          },
                        }}
                      >
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 2 }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                              {leave.type}
                            </Typography>
                            <Typography variant="h3" fontWeight={700} sx={{ color: leave.color, my: 1 }}>
                              {leave.remaining || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              days remaining
                            </Typography>
                          </Box>
                          <Typography sx={{ fontSize: 40 }}>{leave.icon}</Typography>
                        </Box>
                        <Box sx={{ mb: 1 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Used: {leave.used || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Total: {leave.total || 0}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={((leave.used || 0) / (leave.total || 1)) * 100}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: "rgba(0,0,0,0.05)",
                              "& .MuiLinearProgress-bar": {
                                borderRadius: 4,
                                bgcolor: leave.color,
                              },
                            }}
                          />
                        </Box>
                        <Chip
                          label={`${Math.round(((leave.remaining || 0) / (leave.total || 1)) * 100)}% Available`}
                          size="small"
                          sx={{
                            bgcolor: `${leave.color}20`,
                            color: leave.color,
                            fontWeight: 600,
                            mt: 1,
                          }}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Upcoming Leaves */}
          {upcomingLeaves.length > 0 && (
            <Grid item xs={12} md={6}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  borderRadius: 4,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  border: "1px solid rgba(255,255,255,0.6)",
                  background: "rgba(255, 255, 255, 0.7)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                    <CalendarToday sx={{ color: "#667eea" }} />
                    <Typography variant="h6" fontWeight={700}>
                      Upcoming Leaves
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {upcomingLeaves.map((leave, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          border: "1px solid rgba(0,0,0,0.08)",
                          background: `linear-gradient(135deg, ${getLeaveTypeColor(leave.leaveType)}10 0%, ${getLeaveTypeColor(leave.leaveType)}05 100%)`,
                        }}
                      >
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 1 }}>
                          <Box>
                            <Typography variant="body2" fontWeight={700}>
                              {leave.leaveType} Leave
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Chip
                            label={`${leave.days} day${leave.days > 1 ? 's' : ''}`}
                            size="small"
                            sx={{
                              bgcolor: `${getLeaveTypeColor(leave.leaveType)}20`,
                              color: getLeaveTypeColor(leave.leaveType),
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Reason: {leave.reason}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Stats Cards */}
          <Grid item xs={12} md={upcomingLeaves.length > 0 ? 6 : 12}>
            <Grid container spacing={2}>
              {[
                { label: "Pending Requests", value: stats.pending, icon: <Schedule />, color: "#f59e0b" },
                { label: "Approved", value: stats.approved, icon: <CheckCircle />, color: "#10b981" },
                { label: "Rejected", value: stats.rejected, icon: <Cancel />, color: "#ef4444" },
                { label: "Total Days Used", value: stats.totalDays, icon: <EventNote />, color: "#667eea" },
              ].map((stat, idx) => (
                <Grid item xs={6} key={idx}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                      border: "1px solid rgba(255,255,255,0.6)",
                      background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)`,
                      backdropFilter: "blur(12px)",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: `0 8px 24px ${stat.color}30`,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            {stat.label}
                          </Typography>
                          <Typography variant="h3" fontWeight={700} sx={{ color: stat.color, my: 0.5 }}>
                            {stat.value}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: `${stat.color}20`,
                            color: stat.color,
                          }}
                        >
                          {stat.icon}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Leave History */}
          <Grid item xs={12}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                border: "1px solid rgba(255,255,255,0.6)",
                background: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(12px)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                  <Typography variant="h6" fontWeight={700}>
                    Leave History
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {["all", "pending", "approved", "rejected"].map((tab) => (
                      <Chip
                        key={tab}
                        label={tab.charAt(0).toUpperCase() + tab.slice(1)}
                        onClick={() => setSelectedTab(tab as any)}
                        variant={selectedTab === tab ? "filled" : "outlined"}
                        color={selectedTab === tab ? "primary" : "default"}
                        size="small"
                        sx={{ fontWeight: 600, textTransform: "capitalize" }}
                      />
                    ))}
                  </Box>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {displayedLeaves.slice(0, 8).map((leave, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        border: "1px solid rgba(0,0,0,0.08)",
                        background: "white",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          transform: "translateX(4px)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        },
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <Typography variant="body1" fontWeight={700}>
                              {leave.leaveType} Leave
                            </Typography>
                            <Chip
                              label={leave.status}
                              size="small"
                              sx={{
                                bgcolor: `${getStatusColor(leave.status)}20`,
                                color: getStatusColor(leave.status),
                                fontWeight: 600,
                                border: `1px solid ${getStatusColor(leave.status)}40`,
                              }}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()} • {leave.days} day{leave.days > 1 ? 's' : ''}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Reason: {leave.reason}
                          </Typography>
                          {leave.approvedBy && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                              {leave.status === 'Approved' ? 'Approved' : 'Rejected'} by {leave.approvedBy} on {new Date(leave.approvedOn!).toLocaleDateString()}
                            </Typography>
                          )}
                        </Box>
                        <Box sx={{ textAlign: "right" }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                            Applied on
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {new Date(leave.appliedOn).toLocaleDateString()}
                          </Typography>
                          <IconButton size="small" sx={{ mt: 1 }}>
                            <MoreVert fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Request Leave Dialog */}
        <Dialog
          open={openRequestDialog}
          onClose={() => setOpenRequestDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            },
          }}
        >
          <DialogTitle sx={{ p: 3, pb: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h6" fontWeight={700}>
                Request Leave
              </Typography>
              <IconButton onClick={() => setOpenRequestDialog(false)} size="small">
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <TextField
                select
                label="Leave Type"
                fullWidth
                defaultValue="Casual"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              >
                <MenuItem value="Casual">Casual Leave</MenuItem>
                <MenuItem value="Sick">Sick Leave</MenuItem>
                <MenuItem value="Earned">Earned Leave</MenuItem>
              </TextField>
              <TextField
                type="date"
                label="Start Date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              <TextField
                type="date"
                label="End Date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              <TextField
                label="Reason"
                fullWidth
                multiline
                rows={4}
                placeholder="Please provide a reason for your leave request..."
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button
              onClick={() => setOpenRequestDialog(false)}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<Send />}
              sx={{
                borderRadius: 2,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              Submit Request
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardLayout>
  );
}
