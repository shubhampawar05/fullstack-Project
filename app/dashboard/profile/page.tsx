/**
 * User Profile Page - TalentHR
 * View and edit user profile
 */

"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { AccountCircle, Lock, Save } from "@mui/icons-material";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useAuth } from "@/contexts/auth-context";
import { useForm } from "react-hook-form";

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [passwordDialog, setPasswordDialog] = useState(false);

  const { register, handleSubmit, reset } = useForm();
  const { register: registerPwd, handleSubmit: handleSubmitPwd, reset: resetPwd } = useForm();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/profile", { credentials: "include" });
      const data = await response.json();
      if (data.success) {
        setProfile(data.profile);
        reset({
          name: data.profile.name,
          phone: data.profile.employee?.phone || "",
          address: data.profile.employee?.address || "",
          emergencyContact: data.profile.employee?.emergencyContact || "",
        });
      }
    } catch (err) {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setError("");
      setSuccess("");
      const response = await fetch("/api/profile", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (result.success) {
        setSuccess("Profile updated successfully!");
        fetchProfile();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to update profile");
    }
  };

  const onPasswordSubmit = async (data: any) => {
    try {
      setError("");
      setSuccess("");
      const response = await fetch("/api/profile/password", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (result.success) {
        setSuccess("Password changed successfully!");
        setPasswordDialog(false);
        resetPwd();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to change password");
    }
  };

  if (loading) {
    return (
      <DashboardLayout role={(user?.role as any) || "employee"}>
        <Container maxWidth="md">
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={(user?.role as any) || "employee"}>
      <Container maxWidth="md">
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <AccountCircle sx={{ fontSize: 40 }} color="primary" />
            <Box>
              <Typography variant="h4" component="h1" fontWeight={600}>
                My Profile
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your personal information
              </Typography>
            </Box>
          </Box>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        {/* Profile Form */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Typography variant="h6" gutterBottom>Personal Information</Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  {...register("name")}
                  fullWidth
                  label="Full Name"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  value={profile?.email || ""}
                  fullWidth
                  label="Email"
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  {...register("phone")}
                  fullWidth
                  label="Phone Number"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  value={profile?.role || ""}
                  fullWidth
                  label="Role"
                  disabled
                />
              </Grid>
              {profile?.employee && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      value={profile.employee.position || ""}
                      fullWidth
                      label="Position"
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      value={profile.employee.department?.name || ""}
                      fullWidth
                      label="Department"
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      {...register("address")}
                      fullWidth
                      multiline
                      rows={2}
                      label="Address"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      {...register("emergencyContact")}
                      fullWidth
                      label="Emergency Contact"
                    />
                  </Grid>
                </>
              )}
            </Grid>

            <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                sx={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                  },
                }}
              >
                Save Changes
              </Button>
              <Button
                variant="outlined"
                startIcon={<Lock />}
                onClick={() => setPasswordDialog(true)}
              >
                Change Password
              </Button>
            </Box>
          </form>
        </Paper>

        {/* Password Change Dialog */}
        <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)} maxWidth="sm" fullWidth>
          <form onSubmit={handleSubmitPwd(onPasswordSubmit)}>
            <DialogTitle>Change Password</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    {...registerPwd("currentPassword")}
                    fullWidth
                    type="password"
                    label="Current Password"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    {...registerPwd("newPassword")}
                    fullWidth
                    type="password"
                    label="New Password"
                    required
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPasswordDialog(false)}>Cancel</Button>
              <Button type="submit" variant="contained">Change Password</Button>
            </DialogActions>
          </form>
        </Dialog>
      </Container>
    </DashboardLayout>
  );
}
