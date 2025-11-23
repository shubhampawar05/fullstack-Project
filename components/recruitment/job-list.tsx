/**
 * Job List Component - TalentHR
 * Soft Claymorphism Design
 */

"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  Snackbar,
} from "@mui/material";
import {
  Edit,
  Delete,
  Work,
  Search,
  Add,
} from "@mui/icons-material";
import JobFormDialog from "./job-form-dialog";
import ClayButton from "@/components/ui/clay-button";

interface Job {
  id: string;
  title: string;
  department: { id: string; name: string; code?: string } | null;
  employmentType: string;
  location?: string;
  remote: boolean;
  status: string;
  applicationsCount: number;
  views: number;
  createdAt: string;
}

interface JobListProps {
  onRefresh?: () => void;
}

export default function JobList({ onRefresh }: JobListProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [formDialog, setFormDialog] = useState<{
    open: boolean;
    job: Job | null;
  }>({ open: false, job: null });

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState<string>("all");

  useEffect(() => {
    fetchJobs();
  }, [searchTerm, statusFilter, employmentTypeFilter]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (employmentTypeFilter !== "all")
        params.append("employmentType", employmentTypeFilter);
      if (searchTerm) params.append("search", searchTerm);

      const response = await fetch(`/api/jobs?${params.toString()}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const data = await response.json();
      if (data.success) {
        setJobs(data.jobs || []);
      } else {
        setError(data.message || "Failed to fetch jobs");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job posting?")) {
      return;
    }

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete job posting");
      }

      setSnackbar({ open: true, message: "Job posting deleted successfully" });
      fetchJobs();
      onRefresh?.();
    } catch (err: any) {
      setError(err.message || "Failed to delete job posting");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "success";
      case "draft":
        return "default";
      case "closed":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading && jobs.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Job Postings
        </Typography>
        <ClayButton
          variant="contained"
          startIcon={<Add />}
          onClick={() => setFormDialog({ open: true, job: null })}
          sx={{
            background: "linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)",
          }}
        >
          Post New Job
        </ClayButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1, minWidth: 200 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="published">Published</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={employmentTypeFilter}
            label="Type"
            onChange={(e) => setEmploymentTypeFilter(e.target.value)}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="full-time">Full-time</MenuItem>
            <MenuItem value="part-time">Part-time</MenuItem>
            <MenuItem value="contract">Contract</MenuItem>
            <MenuItem value="intern">Intern</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {jobs.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Work sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No job postings found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Create your first job posting to get started
          </Typography>
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Applications</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Views</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: "text.secondary" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {job.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {job.department ? job.department.name : "-"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={job.employmentType}
                      size="small"
                      variant="outlined"
                      sx={{ borderRadius: 2 }}
                    />
                  </TableCell>
                  <TableCell>
                    {job.remote ? (
                      <Chip label="Remote" size="small" color="info" sx={{ borderRadius: 2 }} />
                    ) : (
                      job.location || "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={job.status}
                      size="small"
                      color={getStatusColor(job.status) as any}
                      sx={{ borderRadius: 2, fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>{job.applicationsCount}</TableCell>
                  <TableCell>{job.views}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => setFormDialog({ open: true, job })}
                        sx={{ bgcolor: "#f0f4f8", "&:hover": { bgcolor: "#e6eaf0" }, mr: 1 }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(job.id)}
                        sx={{ bgcolor: "#fff0f0", "&:hover": { bgcolor: "#ffe0e0" } }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <JobFormDialog
        open={formDialog.open}
        job={formDialog.job as any}
        onClose={() => setFormDialog({ open: false, job: null })}
        onSuccess={() => {
          setFormDialog({ open: false, job: null });
          fetchJobs();
          onRefresh?.();
        }}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
    </>
  );
}
