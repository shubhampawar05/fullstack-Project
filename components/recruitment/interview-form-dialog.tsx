/**
 * Interview Form Dialog Component - TalentHR
 * Dialog for scheduling/editing interviews
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
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const interviewFormSchema = z.object({
  candidateId: z.string().min(1, "Candidate is required"),
  jobPostingId: z.string().min(1, "Job posting is required"),
  type: z.enum(["phone-screen", "technical", "behavioral", "final", "panel"]),
  scheduledAt: z.string().min(1, "Scheduled time is required"),
  duration: z.number().min(15),
  location: z.string().optional(),
  isRemote: z.boolean().optional(),
  interviewers: z.array(z.string()).optional(),
  status: z.enum([
    "scheduled",
    "completed",
    "cancelled",
    "rescheduled",
    "no-show",
  ]),
  notes: z.string().optional(),
});

type InterviewFormData = z.infer<typeof interviewFormSchema>;

interface Interview {
  id: string;
  candidateId: string;
  jobPostingId: string;
  type: string;
  scheduledAt: string;
  duration: number;
  location?: string;
  isRemote: boolean;
  status: string;
}

interface InterviewFormDialogProps {
  open: boolean;
  interview: Interview | null;
  candidateId?: string;
  jobPostingId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InterviewFormDialog({
  open,
  interview,
  candidateId,
  jobPostingId,
  onClose,
  onSuccess,
}: InterviewFormDialogProps) {
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<InterviewFormData>({
    resolver: zodResolver(interviewFormSchema),
    defaultValues: {
      type: "phone-screen",
      duration: 60,
      status: "scheduled",
      isRemote: false,
      interviewers: [],
    },
  });

  const fetchCandidates = async () => {
    try {
      const response = await fetch("/api/candidates", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCandidates(data.candidates || []);
        }
      }
    } catch (error) {
      console.error("Error fetching candidates:", error);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/jobs", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setJobs(data.jobs || []);
        }
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUsers(data.users || []);
        }
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    if (!open) return;

    // Fetch data
    const loadData = async () => {
      await Promise.all([fetchCandidates(), fetchJobs(), fetchUsers()]);
    };
    loadData();

    // Reset form
    if (interview) {
      reset({
        candidateId: interview.candidateId,
        jobPostingId: interview.jobPostingId,
        type: interview.type as any,
        scheduledAt: new Date(interview.scheduledAt).toISOString().slice(0, 16),
        duration: interview.duration,
        location: interview.location || "",
        isRemote: interview.isRemote || false,
        status: interview.status as any,
      });
    } else {
      reset({
        candidateId: candidateId || "",
        jobPostingId: jobPostingId || "",
        type: "phone-screen",
        duration: 60,
        status: "scheduled",
        isRemote: false,
        interviewers: [],
      });
    }
  }, [open, interview, candidateId, jobPostingId, reset]);

  const onSubmit = async (data: InterviewFormData) => {
    setError("");
    setLoading(true);

    try {
      const url = interview
        ? `/api/interviews/${interview.id}`
        : "/api/interviews";
      const method = interview ? "PUT" : "POST";

      const payload: any = {
        ...data,
        scheduledAt: new Date(data.scheduledAt).toISOString(),
        location: data.location || undefined,
        interviewers: data.interviewers || [],
        notes: data.notes || undefined,
      };

      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || "Failed to save interview");
        setLoading(false);
        return;
      }

      onSuccess();
    } catch (err) {
      console.error("Save interview error:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {interview ? "Edit Interview" : "Schedule Interview"}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.candidateId}>
                <InputLabel>Candidate</InputLabel>
                <Controller
                  name="candidateId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Candidate"
                      disabled={loading || !!candidateId}
                    >
                      {candidates.map((candidate) => (
                        <MenuItem key={candidate.id} value={candidate.id}>
                          {candidate.firstName} {candidate.lastName} (
                          {candidate.email})
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.jobPostingId}>
                <InputLabel>Job Posting</InputLabel>
                <Controller
                  name="jobPostingId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Job Posting"
                      disabled={loading || !!jobPostingId}
                    >
                      {jobs.map((job) => (
                        <MenuItem key={job.id} value={job.id}>
                          {job.title}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Type" disabled={loading}>
                      <MenuItem value="phone-screen">Phone Screen</MenuItem>
                      <MenuItem value="technical">Technical</MenuItem>
                      <MenuItem value="behavioral">Behavioral</MenuItem>
                      <MenuItem value="final">Final</MenuItem>
                      <MenuItem value="panel">Panel</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                {...register("duration", { valueAsNumber: true })}
                fullWidth
                type="number"
                label="Duration (minutes)"
                error={!!errors.duration}
                helperText={errors.duration?.message}
                disabled={loading}
                inputProps={{ min: 15 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                {...register("scheduledAt")}
                fullWidth
                type="datetime-local"
                label="Scheduled At"
                InputLabelProps={{ shrink: true }}
                error={!!errors.scheduledAt}
                helperText={errors.scheduledAt?.message}
                disabled={loading}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Status" disabled={loading}>
                      <MenuItem value="scheduled">Scheduled</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                      <MenuItem value="rescheduled">Rescheduled</MenuItem>
                      <MenuItem value="no-show">No Show</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Controller
                    name="isRemote"
                    control={control}
                    render={({ field }) => (
                      <Checkbox {...field} checked={field.value || false} />
                    )}
                  />
                }
                label="Remote Interview"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                {...register("location")}
                fullWidth
                label="Location"
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                {...register("notes")}
                fullWidth
                multiline
                rows={3}
                label="Notes"
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
            {loading ? (
              <CircularProgress size={20} />
            ) : interview ? (
              "Update"
            ) : (
              "Schedule"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
