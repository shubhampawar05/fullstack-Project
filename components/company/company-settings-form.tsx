/**
 * Company Settings Form Component - TalentHR
 * Soft Claymorphism Design
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Alert,
  CircularProgress,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Save, Business, Settings as SettingsIcon } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ClayButton from "@/components/ui/clay-button";

const companySettingsSchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  domain: z.string().optional(),
  timezone: z.string().optional(),
  currency: z.string().optional(),
  dateFormat: z.string().optional(),
});

type CompanySettingsFormData = z.infer<typeof companySettingsSchema>;

interface Company {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  settings?: {
    timezone?: string;
    currency?: string;
    dateFormat?: string;
  };
}

export default function CompanySettingsForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CompanySettingsFormData>({
    resolver: zodResolver(companySettingsSchema),
  });

  const fetchCompany = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/company", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Session expired. Please login again.");
          return;
        }
        const errorData = await response.json().catch(() => ({
          message: "Failed to fetch company information",
        }));
        setError(errorData.message || "Failed to fetch company information");
        return;
      }

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Failed to fetch company information");
        return;
      }

      setCompany(data.company);
      reset({
        name: data.company.name,
        domain: data.company.domain || "",
        timezone: data.company.settings?.timezone || "UTC",
        currency: data.company.settings?.currency || "USD",
        dateFormat: data.company.settings?.dateFormat || "MM/DD/YYYY",
      });
      setError("");
    } catch (err) {
      console.error("Fetch company error:", err);
      setError("Failed to load company information. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  const onSubmit = async (data: CompanySettingsFormData) => {
    setError("");
    setSuccess(false);
    setSaving(true);

    try {
      const updateData: any = {
        name: data.name,
        domain: data.domain || undefined,
        settings: {
          timezone: data.timezone || "UTC",
          currency: data.currency || "USD",
          dateFormat: data.dateFormat || "MM/DD/YYYY",
        },
      };

      const response = await fetch("/api/company", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || "Failed to update company settings");
        setSaving(false);
        return;
      }

      setSuccess(true);
      setCompany(result.company);
      setSaving(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Update company error:", err);
      setError("An unexpected error occurred. Please try again.");
      setSaving(false);
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
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: "primary.light", color: "white" }}>
          <Business sx={{ fontSize: 24 }} />
        </Box>
        <Typography variant="h5" fontWeight={700}>
          Company Information
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Company settings updated successfully!
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}>
              <Business fontSize="small" />
              Basic Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              {...register("name")}
              fullWidth
              label="Company Name"
              error={!!errors.name}
              helperText={errors.name?.message}
              disabled={saving}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              {...register("domain")}
              fullWidth
              label="Company Domain"
              placeholder="example.com"
              error={!!errors.domain}
              helperText={errors.domain?.message || "Optional: Your company website domain"}
              disabled={saving}
            />
          </Grid>

          {company && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Company Slug"
                value={company.slug}
                disabled
                helperText="Auto-generated from company name (read-only)"
              />
            </Grid>
          )}

          {/* Settings */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}>
              <SettingsIcon fontSize="small" />
              Company Settings
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Timezone</InputLabel>
              <Select
                {...register("timezone")}
                label="Timezone"
                defaultValue="UTC"
                disabled={saving}
              >
                <MenuItem value="UTC">UTC</MenuItem>
                <MenuItem value="America/New_York">Eastern Time (ET)</MenuItem>
                <MenuItem value="America/Chicago">Central Time (CT)</MenuItem>
                <MenuItem value="America/Denver">Mountain Time (MT)</MenuItem>
                <MenuItem value="America/Los_Angeles">Pacific Time (PT)</MenuItem>
                <MenuItem value="Europe/London">London (GMT)</MenuItem>
                <MenuItem value="Europe/Paris">Paris (CET)</MenuItem>
                <MenuItem value="Asia/Tokyo">Tokyo (JST)</MenuItem>
                <MenuItem value="Asia/Shanghai">Shanghai (CST)</MenuItem>
                <MenuItem value="Asia/Dubai">Dubai (GST)</MenuItem>
                <MenuItem value="Asia/Kolkata">Mumbai (IST)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Currency</InputLabel>
              <Select
                {...register("currency")}
                label="Currency"
                defaultValue="USD"
                disabled={saving}
              >
                <MenuItem value="USD">USD - US Dollar</MenuItem>
                <MenuItem value="EUR">EUR - Euro</MenuItem>
                <MenuItem value="GBP">GBP - British Pound</MenuItem>
                <MenuItem value="INR">INR - Indian Rupee</MenuItem>
                <MenuItem value="JPY">JPY - Japanese Yen</MenuItem>
                <MenuItem value="CNY">CNY - Chinese Yuan</MenuItem>
                <MenuItem value="AED">AED - UAE Dirham</MenuItem>
                <MenuItem value="CAD">CAD - Canadian Dollar</MenuItem>
                <MenuItem value="AUD">AUD - Australian Dollar</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Date Format</InputLabel>
              <Select
                {...register("dateFormat")}
                label="Date Format"
                defaultValue="MM/DD/YYYY"
                disabled={saving}
              >
                <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                <MenuItem value="DD-MM-YYYY">DD-MM-YYYY</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <ClayButton
              type="submit"
              variant="contained"
              size="large"
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
              sx={{
                background: "linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)",
              }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </ClayButton>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
