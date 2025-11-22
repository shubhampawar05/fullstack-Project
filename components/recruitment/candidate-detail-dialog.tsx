/**
 * Candidate Detail Dialog Component - TalentHR
 * Shows detailed candidate information
 */

"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Paper,
} from "@mui/material";
import { Person, Email, Phone, Work, Star } from "@mui/icons-material";

interface CandidateDetailDialogProps {
  open: boolean;
  candidateId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CandidateDetailDialog({
  open,
  candidateId,
  onClose,
  onSuccess,
}: CandidateDetailDialogProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [candidate, setCandidate] = useState<any>(null);

  useEffect(() => {
    if (open && candidateId) {
      fetchCandidate();
    }
  }, [open, candidateId]);

  const fetchCandidate = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/candidates/${candidateId}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch candidate details");
      }

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Failed to fetch candidate details");
        setLoading(false);
        return;
      }

      setCandidate(data.candidate);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to fetch candidate details");
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
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Candidate Details</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : candidate ? (
          <Box>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 2 }}>
                <Box>
                  <Typography variant="h5" gutterBottom>
                    {candidate.firstName} {candidate.lastName}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                    <Chip
                      label={candidate.status}
                      size="small"
                      color={getStatusColor(candidate.status) as any}
                    />
                    <Chip label={candidate.stage} size="small" variant="outlined" />
                    {candidate.rating && (
                      <Chip
                        icon={<Star />}
                        label={`${candidate.rating}/5`}
                        size="small"
                        color="primary"
                      />
                    )}
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <Email fontSize="small" color="action" />
                    <Typography variant="body2">{candidate.email}</Typography>
                  </Box>
                </Grid>

                {candidate.phone && (
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <Phone fontSize="small" color="action" />
                      <Typography variant="body2">{candidate.phone}</Typography>
                    </Box>
                  </Grid>
                )}

                {candidate.jobPosting && (
                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <Work fontSize="small" color="action" />
                      <Typography variant="body2" fontWeight={500}>
                        Applied for: {candidate.jobPosting.title}
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {candidate.experience && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Experience: {candidate.experience} years
                    </Typography>
                  </Grid>
                )}

                {candidate.currentPosition && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Current Position: {candidate.currentPosition}
                    </Typography>
                  </Grid>
                )}

                {candidate.currentCompany && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Current Company: {candidate.currentCompany}
                    </Typography>
                  </Grid>
                )}

                {candidate.coverLetter && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Cover Letter
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {candidate.coverLetter}
                    </Typography>
                  </Grid>
                )}

                {candidate.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Notes
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {candidate.notes}
                    </Typography>
                  </Grid>
                )}

                {candidate.skills && candidate.skills.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Skills
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {candidate.skills.map((skill: string, index: number) => (
                        <Chip key={index} label={skill} size="small" />
                      ))}
                    </Box>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Applied: {new Date(candidate.appliedAt).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

