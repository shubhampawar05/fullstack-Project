/**
 * Job List Component - TalentHR
 * Displays list of all job postings with management actions
 */

"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
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
  Visibility,
  Delete,
  Work,
  Search,
  FilterList,
  Add,
} from "@mui/icons-material";
import JobFormDialog from "./job-form-dialog";

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
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h5" fontWeight={600}>
            Job Postings
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setFormDialog({ open: true, job: null })}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
              },
            }}
          >
            Post New Job
          </Button>
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
                  <Search />
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
                  <TableCell>Title</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Applications</TableCell>
                  <TableCell>Views</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
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
                      />
                    </TableCell>
                    <TableCell>
                      {job.remote ? (
                        <Chip label="Remote" size="small" color="info" />
                      ) : (
                        job.location || "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={job.status}
                        size="small"
                        color={getStatusColor(job.status) as any}
                      />
                    </TableCell>
                    <TableCell>{job.applicationsCount}</TableCell>
                    <TableCell>{job.views}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => setFormDialog({ open: true, job })}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(job.id)}
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
      </Paper>

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

