/**
 * Leave List Component - TalentHR
 * Display and manage leave requests
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { CheckCircle, Cancel, Visibility } from "@mui/icons-material";

interface LeaveListProps {
  onRefresh?: () => void;
}

export default function LeaveList({ onRefresh }: LeaveListProps) {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approvalDialog, setApprovalDialog] = useState<{
    open: boolean;
    leave: any;
    action: "approve" | "reject" | null;
  }>({ open: false, leave: null, action: null });
  const [comments, setComments] = useState("");

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/leaves", {
        credentials: "include",
      });
      const data = await response.json();

      if (!data.success) {
        setError(data.message);
        return;
      }

      setLeaves(data.leaves || []);
    } catch (err) {
      setError("Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalAction = async () => {
    if (!approvalDialog.leave || !approvalDialog.action) return;

    try {
      const response = await fetch(`/api/leaves/${approvalDialog.leave.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: approvalDialog.action,
          comments,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setApprovalDialog({ open: false, leave: null, action: null });
        setComments("");
        fetchLeaves();
        onRefresh?.();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to process request");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "error";
      case "cancelled":
        return "default";
      default:
        return "warning";
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell>
              <TableCell>Leave Type</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Days</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaves.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No leave requests found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              leaves.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell>
                    <Typography variant="body2">{leave.userName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {leave.position || leave.userEmail}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={leave.leaveType.name}
                      size="small"
                      sx={{
                        backgroundColor: leave.leaveType.color + "20",
                        color: leave.leaveType.color,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(leave.startDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(leave.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{leave.totalDays}</TableCell>
                  <TableCell>
                    <Chip
                      label={leave.status}
                      color={getStatusColor(leave.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {leave.status === "pending" && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() =>
                                setApprovalDialog({
                                  open: true,
                                  leave,
                                  action: "approve",
                                })
                              }
                            >
                              <CheckCircle fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() =>
                                setApprovalDialog({
                                  open: true,
                                  leave,
                                  action: "reject",
                                })
                              }
                            >
                              <Cancel fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Approval Dialog */}
      <Dialog
        open={approvalDialog.open}
        onClose={() =>
          setApprovalDialog({ open: false, leave: null, action: null })
        }
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {approvalDialog.action === "approve" ? "Approve" : "Reject"} Leave
          Request
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Comments (Optional)"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setApprovalDialog({ open: false, leave: null, action: null })
            }
          >
            Cancel
          </Button>
          <Button
            onClick={handleApprovalAction}
            variant="contained"
            color={approvalDialog.action === "approve" ? "success" : "error"}
          >
            {approvalDialog.action === "approve" ? "Approve" : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
