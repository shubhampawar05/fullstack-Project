/**
 * Invitation Form Component - TalentHR
 * Form to create new invitations
 */

"use client";

import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";
import { Send, Person, Email } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const invitationSchema = z.object({
  email: z.string().email("Invalid email format"),
  role: z.enum(["hr_manager", "recruiter", "manager", "employee"]),
});

type InvitationFormData = z.infer<typeof invitationSchema>;

interface InvitationFormProps {
  onSuccess?: () => void;
}

export default function InvitationForm({ onSuccess }: InvitationFormProps) {
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [invitationLink, setInvitationLink] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InvitationFormData>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      role: "hr_manager",
    },
  });

  const onSubmit = async (data: InvitationFormData) => {
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch("/api/invitations", {
        method: "POST",
        credentials: "include", // Include cookies for authentication
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || "Failed to create invitation");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setInvitationLink(result.invitation.link);
      reset();
      onSuccess?.();

      // Copy link to clipboard
      try {
        await navigator.clipboard.writeText(result.invitation.link);
      } catch (err) {
        // Ignore clipboard errors
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Invite New User
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Invitation created successfully! Link copied to clipboard.
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          {...register("email")}
          fullWidth
          label="Email Address"
          type="email"
          error={!!errors.email}
          helperText={errors.email?.message}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: <Email sx={{ mr: 1, color: "text.secondary" }} />,
          }}
        />

        <TextField
          {...register("role")}
          select
          fullWidth
          label="Role"
          error={!!errors.role}
          helperText={errors.role?.message}
          sx={{ mb: 3 }}
        >
          <MenuItem value="hr_manager">
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Person fontSize="small" />
              <span>HR Manager</span>
            </Box>
          </MenuItem>
          <MenuItem value="recruiter">
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Person fontSize="small" />
              <span>Recruiter</span>
            </Box>
          </MenuItem>
          <MenuItem value="manager">
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Person fontSize="small" />
              <span>Manager</span>
            </Box>
          </MenuItem>
          <MenuItem value="employee">
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Person fontSize="small" />
              <span>Employee</span>
            </Box>
          </MenuItem>
        </TextField>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Send />}
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
            },
          }}
        >
          {loading ? "Creating..." : "Send Invitation"}
        </Button>
      </Box>
    </Paper>
  );
}

