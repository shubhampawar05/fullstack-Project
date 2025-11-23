/**
 * Leave Request Form Dialog - TalentHR
 * Form for submitting leave requests
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
  Grid,
  Typography,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const leaveRequestSchema = z.object({
  leaveTypeId: z.string().min(1, "Leave type is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  totalDays: z.number().min(0.5, "Total days must be at least 0.5"),
  reason: z.string().min(10, "Reason must be at least 10 characters"),
});

type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>;

interface LeaveRequestFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LeaveRequestForm({
  open,
  onClose,
  onSuccess,
}: LeaveRequestFormProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm<LeaveRequestFormData>({
    resolver: zodResolver(leaveRequestSchema),
  });

  const startDate = watch("startDate");
  const endDate = watch("endDate");

  useEffect(() => {
    if (open) {
      fetchLeaveTypes();
      reset();
      setError("");
    }
  }, [open, reset]);

  // Calculate total days when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      // Auto-update totalDays field
    }
  }, [startDate, endDate]);

  const fetchLeaveTypes = async () => {
    try {
      const response = await fetch("/api/leave-types", {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setLeaveTypes(data.leaveTypes || []);
      }
    } catch (err) {
      console.error("Error fetching leave types:", err);
    }
  };

  const onSubmit = async (data: LeaveRequestFormData) => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/leaves", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.message);
        setLoading(false);
        return;
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Request Leave</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.leaveTypeId}>
                <InputLabel>Leave Type</InputLabel>
                <Controller
                  name="leaveTypeId"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Leave Type" disabled={loading}>
                      {leaveTypes.map((type) => (
                        <MenuItem key={type.id} value={type.id}>
                          {type.name} ({type.code})
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.leaveTypeId && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                    {errors.leaveTypeId.message}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                {...register("startDate")}
                fullWidth
                type="date"
                label="Start Date"
                InputLabelProps={{ shrink: true }}
                error={!!errors.startDate}
                helperText={errors.startDate?.message}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                {...register("endDate")}
                fullWidth
                type="date"
                label="End Date"
                InputLabelProps={{ shrink: true }}
                error={!!errors.endDate}
                helperText={errors.endDate?.message}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                {...register("totalDays", { valueAsNumber: true })}
                fullWidth
                type="number"
                label="Total Days"
                inputProps={{ step: 0.5, min: 0.5 }}
                error={!!errors.totalDays}
                helperText={errors.totalDays?.message}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                {...register("reason")}
                fullWidth
                multiline
                rows={3}
                label="Reason"
                error={!!errors.reason}
                helperText={errors.reason?.message}
                disabled={loading}
              />
            </Grid>
          </Grid>
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
            {loading ? <CircularProgress size={20} /> : "Submit Request"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
