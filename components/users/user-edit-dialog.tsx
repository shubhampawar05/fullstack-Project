/**
 * User Edit Dialog Component - TalentHR
 * Dialog for editing user details
 */

"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const userEditSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["company_admin", "hr_manager", "recruiter", "manager", "employee"]),
  status: z.enum(["active", "inactive", "pending"]),
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
});

type UserEditFormData = z.infer<typeof userEditSchema>;

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "pending";
}

interface UserEditDialogProps {
  open: boolean;
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserEditDialog({
  open,
  user,
  onClose,
  onSuccess,
}: UserEditDialogProps) {
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<UserEditFormData>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      name: user.name,
      role: user.role as any,
      status: user.status,
      password: "",
    },
  });

  // Reset form when user changes
  useEffect(() => {
    if (open && user) {
      reset({
        name: user.name,
        role: user.role as any,
        status: user.status,
        password: "",
      });
      setError("");
    }
  }, [open, user, reset]);

  const onSubmit = async (data: UserEditFormData) => {
    setError("");
    setLoading(true);

    try {
      const updateData: any = {
        name: data.name,
        role: data.role,
        status: data.status,
      };

      // Only include password if provided
      if (data.password && data.password.trim() !== "") {
        updateData.password = data.password;
      }

      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || "Failed to update user");
        setLoading(false);
        return;
      }

      onSuccess();
    } catch (err) {
      console.error("Update user error:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit User</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            {...register("name")}
            fullWidth
            label="Name"
            error={!!errors.name}
            helperText={errors.name?.message}
            sx={{ mb: 2 }}
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Email"
            value={user.email}
            disabled
            sx={{ mb: 2 }}
            helperText="Email cannot be changed"
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Role</InputLabel>
            <Select
              {...register("role")}
              label="Role"
              defaultValue={user.role}
              error={!!errors.role}
              disabled={loading}
            >
              <MenuItem value="company_admin">Company Admin</MenuItem>
              <MenuItem value="hr_manager">HR Manager</MenuItem>
              <MenuItem value="recruiter">Recruiter</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
              <MenuItem value="employee">Employee</MenuItem>
            </Select>
            {errors.role && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                {errors.role.message}
              </Typography>
            )}
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              {...register("status")}
              label="Status"
              defaultValue={user.status}
              error={!!errors.status}
              disabled={loading}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
            </Select>
            {errors.status && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                {errors.status.message}
              </Typography>
            )}
          </FormControl>

          <TextField
            {...register("password")}
            fullWidth
            label="New Password (optional)"
            type="password"
            error={!!errors.password}
            helperText={
              errors.password?.message ||
              "Leave empty to keep current password"
            }
            disabled={loading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
              },
            }}
          >
            {loading ? <CircularProgress size={20} /> : "Update User"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

