/**
 * Confirm Dialog - Reusable Component
 * Features: Custom title/message, variants, loading state
 */

"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import { Warning, Info, Error as ErrorIcon, CheckCircle } from "@mui/icons-material";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  variant?: "warning" | "info" | "error" | "success";
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  variant = "warning",
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
}: ConfirmDialogProps) {
  const getIcon = () => {
    const icons = {
      warning: <Warning sx={{ fontSize: 48, color: "#f59e0b" }} />,
      info: <Info sx={{ fontSize: 48, color: "#3b82f6" }} />,
      error: <ErrorIcon sx={{ fontSize: 48, color: "#ef4444" }} />,
      success: <CheckCircle sx={{ fontSize: 48, color: "#10b981" }} />,
    };
    return icons[variant];
  };

  const getColor = () => {
    const colors = {
      warning: "#f59e0b",
      info: "#3b82f6",
      error: "#ef4444",
      success: "#10b981",
    };
    return colors[variant];
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogContent sx={{ textAlign: "center", pt: 4 }}>
        <Box sx={{ mb: 2 }}>{getIcon()}</Box>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} variant="outlined" fullWidth sx={{ borderRadius: 2 }} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{
            borderRadius: 2,
            bgcolor: getColor(),
            "&:hover": { bgcolor: getColor(), opacity: 0.9 },
          }}
        >
          {loading ? "Processing..." : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
