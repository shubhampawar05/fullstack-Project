/**
 * Leave Request Form Dialog - Premium UI
 * Features: Date picker, leave type selection, reason input, file upload
 */

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Chip,
  Alert,
  LinearProgress,
} from "@mui/material";
import {
  Close,
  CalendarToday,
  Description,
  AttachFile,
  Send,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

interface LeaveRequestFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: LeaveRequestData) => void;
}

export interface LeaveRequestData {
  leaveType: string;
  startDate: Date | null;
  endDate: Date | null;
  reason: string;
  attachment?: File;
}

const leaveTypes = [
  { value: "sick", label: "Sick Leave", color: "#ef4444", icon: "🤒" },
  { value: "vacation", label: "Vacation", color: "#3b82f6", icon: "🏖️" },
  { value: "personal", label: "Personal Leave", color: "#8b5cf6", icon: "👤" },
  { value: "maternity", label: "Maternity Leave", color: "#ec4899", icon: "👶" },
  { value: "paternity", label: "Paternity Leave", color: "#06b6d4", icon: "👨‍👶" },
  { value: "bereavement", label: "Bereavement Leave", color: "#6b7280", icon: "🕊️" },
  { value: "unpaid", label: "Unpaid Leave", color: "#f59e0b", icon: "💼" },
];

export default function LeaveRequestForm({ open, onClose, onSubmit }: LeaveRequestFormProps) {
  const [formData, setFormData] = useState<LeaveRequestData>({
    leaveType: "",
    startDate: null,
    endDate: null,
    reason: "",
  });
  const [attachment, setAttachment] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const diffTime = Math.abs(formData.endDate.getTime() - formData.startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

  const handleSubmit = async () => {
    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.leaveType) newErrors.leaveType = "Please select a leave type";
    if (!formData.startDate) newErrors.startDate = "Please select start date";
    if (!formData.endDate) newErrors.endDate = "Please select end date";
    if (!formData.reason) newErrors.reason = "Please provide a reason";
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = "End date must be after start date";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    onSubmit?.({ ...formData, attachment: attachment || undefined });
    setSubmitting(false);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      leaveType: "",
      startDate: null,
      endDate: null,
      reason: "",
    });
    setAttachment(null);
    setErrors({});
    onClose();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setAttachment(event.target.files[0]);
    }
  };

  const selectedLeaveType = leaveTypes.find((lt) => lt.value === formData.leaveType);
  const days = calculateDays();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          },
        }}
      >
        {submitting && <LinearProgress />}
        
        {/* Header */}
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 3,
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Request Leave
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Submit your leave request for approval
            </Typography>
          </Box>
          <IconButton onClick={handleClose} sx={{ color: "white" }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, mt: 2 }}>
          {/* Leave Type Selection */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Leave Type *
            </Typography>
            <TextField
              select
              fullWidth
              value={formData.leaveType}
              onChange={(e) => {
                setFormData({ ...formData, leaveType: e.target.value });
                setErrors({ ...errors, leaveType: "" });
              }}
              error={!!errors.leaveType}
              helperText={errors.leaveType}
              sx={{ borderRadius: 2 }}
            >
              {leaveTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <span>{type.icon}</span>
                    <Typography>{type.label}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Date Selection */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Duration *
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <DatePicker
                label="Start Date"
                value={formData.startDate}
                onChange={(date) => {
                  setFormData({ ...formData, startDate: date });
                  setErrors({ ...errors, startDate: "" });
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.startDate,
                    helperText: errors.startDate,
                  },
                }}
              />
              <DatePicker
                label="End Date"
                value={formData.endDate}
                onChange={(date) => {
                  setFormData({ ...formData, endDate: date });
                  setErrors({ ...errors, endDate: "" });
                }}
                minDate={formData.startDate || undefined}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.endDate,
                    helperText: errors.endDate,
                  },
                }}
              />
            </Box>
          </Box>

          {/* Days Calculation */}
          {days > 0 && (
            <Alert
              severity="info"
              icon={<CalendarToday />}
              sx={{
                mb: 3,
                borderRadius: 2,
                bgcolor: selectedLeaveType ? `${selectedLeaveType.color}15` : undefined,
                color: selectedLeaveType?.color,
                "& .MuiAlert-icon": {
                  color: selectedLeaveType?.color,
                },
              }}
            >
              <Typography variant="body2" fontWeight={600}>
                Total Days: {days} day{days > 1 ? "s" : ""}
              </Typography>
              {selectedLeaveType && (
                <Typography variant="caption">
                  {selectedLeaveType.label}
                </Typography>
              )}
            </Alert>
          )}

          {/* Reason */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Reason *
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Please provide a detailed reason for your leave request..."
              value={formData.reason}
              onChange={(e) => {
                setFormData({ ...formData, reason: e.target.value });
                setErrors({ ...errors, reason: "" });
              }}
              error={!!errors.reason}
              helperText={errors.reason}
              sx={{ borderRadius: 2 }}
            />
          </Box>

          {/* Attachment */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Attachment (Optional)
            </Typography>
            <Box
              sx={{
                border: "2px dashed rgba(0,0,0,0.2)",
                borderRadius: 2,
                p: 2,
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "#667eea",
                  bgcolor: "rgba(102, 126, 234, 0.05)",
                },
              }}
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <input
                id="file-upload"
                type="file"
                hidden
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />
              {attachment ? (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                  <AttachFile sx={{ color: "#667eea" }} />
                  <Typography variant="body2" fontWeight={600}>
                    {attachment.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAttachment(null);
                    }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <Box>
                  <AttachFile sx={{ fontSize: 40, color: "text.secondary", mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Click to upload supporting document
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    PDF, DOC, DOCX, JPG, PNG (Max 5MB)
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            size="large"
            sx={{ borderRadius: 2, px: 4 }}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            size="large"
            startIcon={<Send />}
            sx={{
              borderRadius: 2,
              px: 4,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
            }}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Request"}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
