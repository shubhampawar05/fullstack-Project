/**
 * Job Form Dialog Component - TalentHR
 * Dialog for creating/editing job postings
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
  Checkbox,
  FormControlLabel,
  Box,
  Chip,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const jobFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  departmentId: z.string().optional(),
  employmentType: z.enum(["full-time", "part-time", "contract", "intern"]),
  location: z.string().optional(),
  remote: z.boolean().optional(),
  salaryRange: z
    .object({
      min: z.number().min(0).optional(),
      max: z.number().min(0).optional(),
      currency: z.string().optional(),
    })
    .optional(),
  requirements: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional(),
  qualifications: z.array(z.string()).optional(),
  status: z.enum(["draft", "published", "closed", "cancelled"]),
  applicationDeadline: z.string().optional(),
  numberOfOpenings: z.number().min(1).optional(),
  experienceLevel: z.enum(["entry", "mid", "senior", "executive"]).optional(),
  tags: z.array(z.string()).optional(),
});

type JobFormData = z.infer<typeof jobFormSchema>;

interface Job {
  id: string;
  title: string;
  description: string;
  departmentId?: string;
  department?: { id: string; name: string } | null;
  employmentType: string;
  location?: string;
  remote: boolean;
  salaryRange?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  requirements?: string[];
  responsibilities?: string[];
  qualifications?: string[];
  status: string;
  applicationDeadline?: string;
  numberOfOpenings?: number;
  experienceLevel?: string;
  tags?: string[];
}

interface JobFormDialogProps {
  open: boolean;
  job: Job | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function JobFormDialog({
  open,
  job,
  onClose,
  onSuccess,
}: JobFormDialogProps) {
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [requirementInput, setRequirementInput] = useState("");
  const [responsibilityInput, setResponsibilityInput] = useState("");
  const [qualificationInput, setQualificationInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      employmentType: "full-time",
      status: "draft",
      remote: false,
      numberOfOpenings: 1,
      requirements: [],
      responsibilities: [],
      qualifications: [],
      tags: [],
    },
  });

  const requirements = watch("requirements") || [];
  const responsibilities = watch("responsibilities") || [];
  const qualifications = watch("qualifications") || [];
  const tags = watch("tags") || [];

  useEffect(() => {
    if (open) {
      fetchDepartments();
      if (job) {
        reset({
          title: job.title,
          description: job.description,
          departmentId: job.departmentId || "",
          employmentType: job.employmentType as any,
          location: job.location || "",
          remote: job.remote || false,
          salaryRange: job.salaryRange || undefined,
          requirements: job.requirements || [],
          responsibilities: job.responsibilities || [],
          qualifications: job.qualifications || [],
          status: job.status as any,
          applicationDeadline: job.applicationDeadline
            ? new Date(job.applicationDeadline).toISOString().split("T")[0]
            : "",
          numberOfOpenings: job.numberOfOpenings || 1,
          experienceLevel: job.experienceLevel as any,
          tags: job.tags || [],
        });
      } else {
        reset({
          employmentType: "full-time",
          status: "draft",
          remote: false,
          numberOfOpenings: 1,
          requirements: [],
          responsibilities: [],
          qualifications: [],
          tags: [],
        });
      }
      setError("");
      setRequirementInput("");
      setResponsibilityInput("");
      setQualificationInput("");
      setTagInput("");
    }
  }, [open, job, reset]);

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDepartments(
            data.departments.filter((d: any) => d.status === "active") || []
          );
        }
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const addItem = (
    type: "requirements" | "responsibilities" | "qualifications" | "tags"
  ) => {
    const inputMap = {
      requirements: requirementInput,
      responsibilities: responsibilityInput,
      qualifications: qualificationInput,
      tags: tagInput,
    };

    const input = inputMap[type];
    if (!input.trim()) return;

    const current = watch(type) || [];
    setValue(type, [...current, input.trim()]);

    if (type === "requirements") setRequirementInput("");
    if (type === "responsibilities") setResponsibilityInput("");
    if (type === "qualifications") setQualificationInput("");
    if (type === "tags") setTagInput("");
  };

  const removeItem = (
    type: "requirements" | "responsibilities" | "qualifications" | "tags",
    index: number
  ) => {
    const current = watch(type) || [];
    setValue(
      type,
      current.filter((_, i) => i !== index)
    );
  };

  const onSubmit = async (data: JobFormData) => {
    setError("");
    setLoading(true);

    try {
      const url = job ? `/api/jobs/${job.id}` : "/api/jobs";
      const method = job ? "PUT" : "POST";

      const payload: any = {
        ...data,
        departmentId: data.departmentId || undefined,
        applicationDeadline: data.applicationDeadline || undefined,
        salaryRange: data.salaryRange?.min || data.salaryRange?.max
          ? data.salaryRange
          : undefined,
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
        setError(result.message || "Failed to save job posting");
        setLoading(false);
        return;
      }

      onSuccess();
    } catch (err) {
      console.error("Save job error:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{job ? "Edit Job Posting" : "Create Job Posting"}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                {...register("title")}
                fullWidth
                label="Job Title"
                error={!!errors.title}
                helperText={errors.title?.message}
                disabled={loading}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                {...register("description")}
                fullWidth
                multiline
                rows={4}
                label="Job Description"
                error={!!errors.description}
                helperText={errors.description?.message}
                disabled={loading}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Controller
                  name="departmentId"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Department" disabled={loading}>
                      <MenuItem value="">No Department</MenuItem>
                      {departments.map((dept) => (
                        <MenuItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Employment Type</InputLabel>
                <Controller
                  name="employmentType"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Employment Type" disabled={loading}>
                      <MenuItem value="full-time">Full Time</MenuItem>
                      <MenuItem value="part-time">Part Time</MenuItem>
                      <MenuItem value="contract">Contract</MenuItem>
                      <MenuItem value="intern">Intern</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                {...register("location")}
                fullWidth
                label="Location"
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Controller
                    name="remote"
                    control={control}
                    render={({ field }) => (
                      <Checkbox {...field} checked={field.value || false} />
                    )}
                  />
                }
                label="Remote Position"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                {...register("salaryRange.min", { valueAsNumber: true })}
                fullWidth
                type="number"
                label="Min Salary"
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                {...register("salaryRange.max", { valueAsNumber: true })}
                fullWidth
                type="number"
                label="Max Salary"
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                {...register("salaryRange.currency")}
                fullWidth
                label="Currency"
                placeholder="USD"
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                {...register("numberOfOpenings", { valueAsNumber: true })}
                fullWidth
                type="number"
                label="Number of Openings"
                disabled={loading}
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Experience Level</InputLabel>
                <Controller
                  name="experienceLevel"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Experience Level" disabled={loading}>
                      <MenuItem value="">Not Specified</MenuItem>
                      <MenuItem value="entry">Entry Level</MenuItem>
                      <MenuItem value="mid">Mid Level</MenuItem>
                      <MenuItem value="senior">Senior Level</MenuItem>
                      <MenuItem value="executive">Executive</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                {...register("applicationDeadline")}
                fullWidth
                type="date"
                label="Application Deadline"
                InputLabelProps={{ shrink: true }}
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
                      <MenuItem value="draft">Draft</MenuItem>
                      <MenuItem value="published">Published</MenuItem>
                      <MenuItem value="closed">Closed</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>

            {/* Requirements */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Requirements
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}>
                {requirements.map((req, index) => (
                  <Chip
                    key={index}
                    label={req}
                    onDelete={() => removeItem("requirements", index)}
                    size="small"
                  />
                ))}
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  value={requirementInput}
                  onChange={(e) => setRequirementInput(e.target.value)}
                  placeholder="Add requirement"
                  size="small"
                  fullWidth
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addItem("requirements");
                    }
                  }}
                />
                <Button
                  onClick={() => addItem("requirements")}
                  variant="outlined"
                  size="small"
                >
                  Add
                </Button>
              </Box>
            </Grid>

            {/* Responsibilities */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Responsibilities
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}>
                {responsibilities.map((resp, index) => (
                  <Chip
                    key={index}
                    label={resp}
                    onDelete={() => removeItem("responsibilities", index)}
                    size="small"
                  />
                ))}
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  value={responsibilityInput}
                  onChange={(e) => setResponsibilityInput(e.target.value)}
                  placeholder="Add responsibility"
                  size="small"
                  fullWidth
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addItem("responsibilities");
                    }
                  }}
                />
                <Button
                  onClick={() => addItem("responsibilities")}
                  variant="outlined"
                  size="small"
                >
                  Add
                </Button>
              </Box>
            </Grid>

            {/* Tags */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Tags
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}>
                {tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => removeItem("tags", index)}
                    size="small"
                    color="primary"
                  />
                ))}
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tag"
                  size="small"
                  fullWidth
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addItem("tags");
                    }
                  }}
                />
                <Button
                  onClick={() => addItem("tags")}
                  variant="outlined"
                  size="small"
                >
                  Add
                </Button>
              </Box>
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
            ) : job ? (
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

