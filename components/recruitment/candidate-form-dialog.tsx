/**
 * Candidate Form Dialog Component - TalentHR
 * Dialog for creating/editing candidate applications
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
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const candidateFormSchema = z.object({
  jobPostingId: z.string().min(1, "Job posting is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  resumeUrl: z.string().optional(),
  coverLetter: z.string().optional(),
  linkedInUrl: z.string().optional(),
  experience: z.number().min(0).optional(),
  currentPosition: z.string().optional(),
  currentCompany: z.string().optional(),
  status: z.enum(["applied", "screening", "interview", "offer", "hired", "rejected", "withdrawn"]),
  stage: z.enum(["application", "phone-screen", "technical", "final", "offer"]),
  source: z.string().optional(),
  notes: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
});

type CandidateFormData = z.infer<typeof candidateFormSchema>;

interface Candidate {
  id: string;
  jobPostingId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: string;
  stage: string;
}

interface CandidateFormDialogProps {
  open: boolean;
  candidate: Candidate | null;
  jobs: any[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function CandidateFormDialog({
  open,
  candidate,
  jobs,
  onClose,
  onSuccess,
}: CandidateFormDialogProps) {
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<CandidateFormData>({
    resolver: zodResolver(candidateFormSchema),
    defaultValues: {
      status: "applied",
      stage: "application",
    },
  });

  useEffect(() => {
    if (open) {
      if (candidate) {
        reset({
          jobPostingId: candidate.jobPostingId,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          email: candidate.email,
          phone: candidate.phone || "",
          status: candidate.status as any,
          stage: candidate.stage as any,
        });
      } else {
        reset({
          status: "applied",
          stage: "application",
        });
      }
      setError("");
    }
  }, [open, candidate, reset]);

  const onSubmit = async (data: CandidateFormData) => {
    setError("");
    setLoading(true);

    try {
      const url = candidate ? `/api/candidates/${candidate.id}` : "/api/candidates";
      const method = candidate ? "PUT" : "POST";

      const payload: any = {
        ...data,
        phone: data.phone || undefined,
        resumeUrl: data.resumeUrl || undefined,
        coverLetter: data.coverLetter || undefined,
        linkedInUrl: data.linkedInUrl || undefined,
        experience: data.experience || undefined,
        currentPosition: data.currentPosition || undefined,
        currentCompany: data.currentCompany || undefined,
        source: data.source || undefined,
        notes: data.notes || undefined,
        rating: data.rating || undefined,
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
        setError(result.message || "Failed to save candidate");
        setLoading(false);
        return;
      }

      onSuccess();
    } catch (err) {
      console.error("Save candidate error:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {candidate ? "Edit Candidate" : "Add Candidate"}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.jobPostingId}>
                <InputLabel>Job Posting</InputLabel>
                <Controller
                  name="jobPostingId"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Job Posting" disabled={loading || !!candidate}>
                      {jobs.map((job) => (
                        <MenuItem key={job.id} value={job.id}>
                          {job.title}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.jobPostingId && (
                  <Alert severity="error" sx={{ mt: 0.5 }}>
                    {errors.jobPostingId.message}
                  </Alert>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                {...register("firstName")}
                fullWidth
                label="First Name"
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
                disabled={loading}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                {...register("lastName")}
                fullWidth
                label="Last Name"
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
                disabled={loading}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                {...register("email")}
                fullWidth
                type="email"
                label="Email"
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={loading || !!candidate}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                {...register("phone")}
                fullWidth
                label="Phone"
                error={!!errors.phone}
                helperText={errors.phone?.message}
                disabled={loading}
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
                      <MenuItem value="applied">Applied</MenuItem>
                      <MenuItem value="screening">Screening</MenuItem>
                      <MenuItem value="interview">Interview</MenuItem>
                      <MenuItem value="offer">Offer</MenuItem>
                      <MenuItem value="hired">Hired</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                      <MenuItem value="withdrawn">Withdrawn</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Stage</InputLabel>
                <Controller
                  name="stage"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Stage" disabled={loading}>
                      <MenuItem value="application">Application</MenuItem>
                      <MenuItem value="phone-screen">Phone Screen</MenuItem>
                      <MenuItem value="technical">Technical</MenuItem>
                      <MenuItem value="final">Final</MenuItem>
                      <MenuItem value="offer">Offer</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                {...register("experience", { valueAsNumber: true })}
                fullWidth
                type="number"
                label="Years of Experience"
                disabled={loading}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                {...register("rating", { valueAsNumber: true })}
                fullWidth
                type="number"
                label="Rating (1-5)"
                disabled={loading}
                inputProps={{ min: 1, max: 5 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                {...register("currentPosition")}
                fullWidth
                label="Current Position"
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                {...register("currentCompany")}
                fullWidth
                label="Current Company"
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
            ) : candidate ? (
              "Update"
            ) : (
              "Create"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

