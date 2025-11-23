/**
 * Interview List Component - TalentHR
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
  Button,
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
  Schedule,
  Search,
  Add,
} from "@mui/icons-material";
import InterviewFormDialog from "./interview-form-dialog";
import ClayButton from "@/components/ui/clay-button";

interface Interview {
  id: string;
  candidate: { firstName: string; lastName: string; email: string } | null;
  jobPosting: { title: string } | null;
  type: string;
  scheduledAt: string;
  duration: number;
  location?: string;
  isRemote: boolean;
  status: string;
  interviewers: { name: string }[];
}

interface InterviewListProps {
  candidateId?: string;
  jobPostingId?: string;
  onRefresh?: () => void;
}

export default function InterviewList({
  candidateId,
  jobPostingId,
  onRefresh,
}: InterviewListProps) {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [formDialog, setFormDialog] = useState<{
    open: boolean;
    interview: Interview | null;
  }>({ open: false, interview: null });

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    fetchInterviews();
  }, [statusFilter, typeFilter, candidateId, jobPostingId]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (candidateId) params.append("candidateId", candidateId);
      if (jobPostingId) params.append("jobPostingId", jobPostingId);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (typeFilter !== "all") params.append("type", typeFilter);

      const response = await fetch(`/api/interviews?${params.toString()}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch interviews");
      }

      const data = await response.json();
      if (data.success) {
        setInterviews(data.interviews || []);
      } else {
        setError(data.message || "Failed to fetch interviews");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch interviews");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "scheduled":
        return "info";
      case "cancelled":
        return "error";
      case "rescheduled":
        return "warning";
      default:
        return "default";
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading && interviews.length === 0) {
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
          Interviews
        </Typography>
        <ClayButton
          variant="contained"
          startIcon={<Add />}
          onClick={() => setFormDialog({ open: true, interview: null })}
          sx={{
            background: "linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)",
          }}
        >
          Schedule Interview
        </ClayButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="scheduled">Scheduled</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
            <MenuItem value="rescheduled">Rescheduled</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={typeFilter}
            label="Type"
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="phone-screen">Phone Screen</MenuItem>
            <MenuItem value="technical">Technical</MenuItem>
            <MenuItem value="behavioral">Behavioral</MenuItem>
            <MenuItem value="final">Final</MenuItem>
            <MenuItem value="panel">Panel</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {interviews.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Schedule sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No interviews scheduled
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Schedule an interview to get started
          </Typography>
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Candidate</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Job</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Scheduled At</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Duration</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: "text.secondary" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {interviews.map((interview) => (
                <TableRow key={interview.id} hover>
                  <TableCell>
                    {interview.candidate
                      ? `${interview.candidate.firstName} ${interview.candidate.lastName}`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {interview.jobPosting ? interview.jobPosting.title : "-"}
                  </TableCell>
                  <TableCell>
                    <Chip label={interview.type} size="small" variant="outlined" sx={{ borderRadius: 2 }} />
                  </TableCell>
                  <TableCell>
                    {new Date(interview.scheduledAt).toLocaleString()}
                  </TableCell>
                  <TableCell>{interview.duration} min</TableCell>
                  <TableCell>
                    {interview.isRemote ? (
                      <Chip label="Remote" size="small" color="info" sx={{ borderRadius: 2 }} />
                    ) : (
                      interview.location || "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={interview.status}
                      size="small"
                      color={getStatusColor(interview.status) as any}
                      sx={{ borderRadius: 2, fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => setFormDialog({ open: true, interview })}
                      sx={{ bgcolor: "#f0f4f8", "&:hover": { bgcolor: "#e6eaf0" } }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <InterviewFormDialog
        open={formDialog.open}
        interview={formDialog.interview as any}
        candidateId={candidateId}
        jobPostingId={jobPostingId}
        onClose={() => setFormDialog({ open: false, interview: null })}
        onSuccess={() => {
          setFormDialog({ open: false, interview: null });
          fetchInterviews();
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
