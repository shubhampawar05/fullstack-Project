/**
 * Company Settings Form Component - TalentHR
 * Form for updating company settings
 */

"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Alert,
  CircularProgress,
  MenuItem,
  Divider,
} from "@mui/material";
import { Settings as SettingsIcon, Save, Business } from "@mui/icons-material";
import { useForm } from "react-hook-form";

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Retail",
  "Manufacturing",
  "Consulting",
  "Other",
];

const COMPANY_SIZES = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+",
];

export default function CompanySettingsForm() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/settings", { credentials: "include" });
      const data = await response.json();
      if (data.success) {
        reset(data.settings);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setError("");
      setSuccess("");
      const response = await fetch("/api/settings", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (result.success) {
        setSuccess("Settings updated successfully!");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to update settings");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <SettingsIcon sx={{ fontSize: 40 }} color="primary" />
          <Box>
            <Typography variant="h4" component="h1" fontWeight={600}>
              Company Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your company information
            </Typography>
          </Box>
        </Box>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      {/* Settings Form */}
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Business color="primary" />
              <Typography variant="h6">Company Information</Typography>
            </Box>
            <Divider />
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                {...register("name")}
                fullWidth
                label="Company Name"
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                {...register("industry")}
                fullWidth
                select
                label="Industry"
              >
                {INDUSTRIES.map((industry) => (
                  <MenuItem key={industry} value={industry}>
                    {industry}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                {...register("size")}
                fullWidth
                select
                label="Company Size"
              >
                {COMPANY_SIZES.map((size) => (
                  <MenuItem key={size} value={size}>
                    {size} employees
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                {...register("website")}
                fullWidth
                label="Website"
                type="url"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                {...register("phone")}
                fullWidth
                label="Phone Number"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                {...register("address")}
                fullWidth
                multiline
                rows={3}
                label="Address"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
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
          </Box>
        </form>
      </Paper>
    </>
  );
}
