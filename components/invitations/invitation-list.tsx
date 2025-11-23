/**
 * Invitation List Component - TalentHR
 * Soft Claymorphism Design
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from "@mui/material";
import {
  ContentCopy,
  Cancel,
  Email,
  CheckCircle,
  Schedule,
  Block,
} from "@mui/icons-material";
import ClayButton from "@/components/ui/clay-button";

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: "pending" | "accepted" | "expired" | "cancelled";
  invitedBy: {
    name: string;
    email: string;
  };
  link?: string | null;
  expiresAt: string;
  acceptedAt?: string;
  createdAt: string;
}

interface InvitationListProps {
  onRefresh?: () => void;
}

export default function InvitationList({ onRefresh }: InvitationListProps) {
  const router = useRouter();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [cancelDialog, setCancelDialog] = useState<{
    open: boolean;
    invitationId: string | null;
  }>({ open: false, invitationId: null });

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/invitations", {
        credentials: "include", // Include cookies for authentication
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // Handle 401 - redirect to login
        if (response.status === 401) {
          setError("Session expired. Redirecting to login...");
          setTimeout(() => {
            router.push("/login");
          }, 1500);
          return;
        }

        const errorData = await response.json().catch(() => ({ message: "Failed to fetch invitations" }));
        setError(errorData.message || "Failed to fetch invitations");
        return;
      }

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Failed to fetch invitations");
        return;
      }

      setInvitations(data.invitations || []);
      setError("");
    } catch (err) {
      console.error("Fetch invitations error:", err);
      setError("Failed to load invitations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async (invitation: Invitation) => {
    if (!invitation.link) {
      setSnackbar({ open: true, message: "Invitation link not available" });
      return;
    }

    try {
      await navigator.clipboard.writeText(invitation.link);
      setSnackbar({ open: true, message: "Invitation link copied to clipboard!" });
    } catch (err) {
      setSnackbar({ open: true, message: "Failed to copy link" });
    }
  };

  const handleCancel = async () => {
    if (!cancelDialog.invitationId) return;

    try {
      const response = await fetch(
        `/api/invitations/${cancelDialog.invitationId}`,
        {
          method: "DELETE",
          credentials: "include", // Include cookies for authentication
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setSnackbar({ open: true, message: data.message || "Failed to cancel invitation" });
        return;
      }

      setSnackbar({ open: true, message: "Invitation cancelled successfully" });
      setCancelDialog({ open: false, invitationId: null });
      fetchInvitations();
      onRefresh?.();
    } catch (err) {
      console.error("Cancel invitation error:", err);
      setSnackbar({ open: true, message: "Failed to cancel invitation" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "accepted":
        return "success";
      case "expired":
        return "error";
      case "cancelled":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Schedule fontSize="small" />;
      case "accepted":
        return <CheckCircle fontSize="small" />;
      case "expired":
        return <Block fontSize="small" />;
      case "cancelled":
        return <Cancel fontSize="small" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Invited By</TableCell>
              <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Expires At</TableCell>
              <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invitations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No invitations yet. Create one to get started!
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              invitations.map((invitation) => (
                <TableRow key={invitation.id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Email fontSize="small" color="action" />
                      {invitation.email}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={invitation.role.replace("_", " ")}
                      size="small"
                      variant="outlined"
                      sx={{ borderRadius: 2 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(invitation.status) as any}
                      label={invitation.status}
                      color={getStatusColor(invitation.status) as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"}
                      size="small"
                      sx={{ borderRadius: 2, fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    {invitation.invitedBy?.name || invitation.invitedBy?.email || "N/A"}
                  </TableCell>
                  <TableCell>
                    {new Date(invitation.expiresAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {invitation.status === "pending" && (
                        <>
                          <Tooltip title="Copy invitation link">
                            <IconButton
                              size="small"
                              onClick={() => handleCopyLink(invitation)}
                              sx={{ bgcolor: "#f0f4f8", "&:hover": { bgcolor: "#e6eaf0" } }}
                            >
                              <ContentCopy fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Cancel invitation">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() =>
                                setCancelDialog({ open: true, invitationId: invitation.id })
                              }
                              sx={{ bgcolor: "#fff0f0", "&:hover": { bgcolor: "#ffe0e0" } }}
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

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={cancelDialog.open}
        onClose={() => setCancelDialog({ open: false, invitationId: null })}
        PaperProps={{
            sx: { borderRadius: 4, p: 1 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Cancel Invitation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this invitation? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <ClayButton
            variant="outlined"
            onClick={() => setCancelDialog({ open: false, invitationId: null })}
          >
            No, Keep It
          </ClayButton>
          <ClayButton 
            onClick={handleCancel} 
            variant="contained"
            sx={{ bgcolor: "error.main", "&:hover": { bgcolor: "error.dark" } }}
          >
            Yes, Cancel Invitation
          </ClayButton>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: "" })}
        message={snackbar.message}
      />
    </>
  );
}
