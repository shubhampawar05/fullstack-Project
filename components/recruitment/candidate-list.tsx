/**
 * Candidate List Component - TalentHR
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
  Visibility,
  People,
  Search,
  Add,
} from "@mui/icons-material";
import CandidateFormDialog from "./candidate-form-dialog";
import CandidateDetailDialog from "./candidate-detail-dialog";
import ClayButton from "@/components/ui/clay-button";

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  jobPosting: { id: string; title: string } | null;
  status: string;
  stage: string;
  experience?: number;
  currentPosition?: string;
  rating?: number;
  appliedAt: string;
}

interface CandidateListProps {
  jobPostingId?: string;
  onRefresh?: () => void;
}

export default function CandidateList({
  jobPostingId,
  onRefresh,
}: CandidateListProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [formDialog, setFormDialog] = useState<{
    open: boolean;
    candidate: Candidate | null;
  }>({ open: false, candidate: null });
  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    candidateId: string | null;
  }>({ open: false, candidateId: null });

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    fetchCandidates();
    fetchJobs();
  }, [searchTerm, statusFilter, stageFilter, jobPostingId]);

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/jobs?status=published", {
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

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (jobPostingId) params.append("jobPostingId", jobPostingId);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (stageFilter !== "all") params.append("stage", stageFilter);
      if (searchTerm) params.append("search", searchTerm);

      const response = await fetch(`/api/candidates?${params.toString()}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch candidates");
      }

      const data = await response.json();
      if (data.success) {
        setCandidates(data.candidates || []);
      } else {
        setError(data.message || "Failed to fetch candidates");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch candidates");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "hired":
        return "success";
      case "offer":
        return "info";
      case "interview":
        return "warning";
      case "screening":
        return "default";
      case "rejected":
        return "error";
      case "withdrawn":
        return "default";
      default:
        return "default";
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading && candidates.length === 0) {
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
          Candidates
        </Typography>
        <ClayButton
          variant="contained"
          startIcon={<Add />}
          onClick={() => setFormDialog({ open: true, candidate: null })}
          sx={{
            background: "linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)",
          }}
        >
          Add Candidate
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
          placeholder="Search candidates..."
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
            <MenuItem value="applied">Applied</MenuItem>
            <MenuItem value="screening">Screening</MenuItem>
            <MenuItem value="interview">Interview</MenuItem>
            <MenuItem value="offer">Offer</MenuItem>
            <MenuItem value="hired">Hired</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="withdrawn">Withdrawn</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Stage</InputLabel>
          <Select
            value={stageFilter}
            label="Stage"
            onChange={(e) => setStageFilter(e.target.value)}
          >
            <MenuItem value="all">All Stages</MenuItem>
            <MenuItem value="application">Application</MenuItem>
            <MenuItem value="phone-screen">Phone Screen</MenuItem>
            <MenuItem value="technical">Technical</MenuItem>
            <MenuItem value="final">Final</MenuItem>
            <MenuItem value="offer">Offer</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {candidates.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <People sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No candidates found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Add candidates to start tracking applications
          </Typography>
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Job</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Stage</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Experience</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Rating</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: "text.secondary" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {candidates.map((candidate) => (
                <TableRow key={candidate.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {candidate.firstName} {candidate.lastName}
                    </Typography>
                  </TableCell>
                  <TableCell>{candidate.email}</TableCell>
                  <TableCell>
                    {candidate.jobPosting ? candidate.jobPosting.title : "-"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={candidate.status}
                      size="small"
                      color={getStatusColor(candidate.status) as any}
                      sx={{ borderRadius: 2, fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip label={candidate.stage} size="small" variant="outlined" sx={{ borderRadius: 2 }} />
                  </TableCell>
                  <TableCell>
                    {candidate.experience
                      ? `${candidate.experience} years`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {candidate.rating ? (
                      <Chip
                        label={`${candidate.rating}/5`}
                        size="small"
                        color="primary"
                        sx={{ borderRadius: 2 }}
                      />
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() =>
                          setDetailDialog({ open: true, candidateId: candidate.id })
                        }
                        sx={{ bgcolor: "#f0f4f8", "&:hover": { bgcolor: "#e6eaf0" }, mr: 1 }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() =>
                          setFormDialog({ open: true, candidate })
                        }
                        sx={{ bgcolor: "#f0f4f8", "&:hover": { bgcolor: "#e6eaf0" } }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <CandidateFormDialog
        open={formDialog.open}
        candidate={formDialog.candidate as any}
        jobs={jobs}
        onClose={() => setFormDialog({ open: false, candidate: null })}
        onSuccess={() => {
          setFormDialog({ open: false, candidate: null });
          fetchCandidates();
          onRefresh?.();
        }}
      />

      <CandidateDetailDialog
        open={detailDialog.open}
        candidateId={detailDialog.candidateId}
        onClose={() => setDetailDialog({ open: false, candidateId: null })}
        onSuccess={() => {
          fetchCandidates();
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
