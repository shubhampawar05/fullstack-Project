/**
 * Invite User Modal
 * Features: Email input, role selection, department, custom message
 */

"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import { Close, Send } from "@mui/icons-material";
import { useState } from "react";

interface InviteUserModalProps {
  open: boolean;
  onClose: () => void;
  onInvite?: (data: any) => void;
}

const roles = [
  { value: "hr_manager", label: "HR Manager" },
  { value: "recruiter", label: "Recruiter" },
  { value: "manager", label: "Manager" },
  { value: "employee", label: "Employee" },
];

const departments = [
  "Engineering",
  "Sales",
  "Marketing",
  "Human Resources",
  "Finance",
  "Product",
];

export default function InviteUserModal({ open, onClose, onInvite }: InviteUserModalProps) {
  const [formData, setFormData] = useState({
    email: "",
    role: "employee",
    department: "",
    message: "",
  });

  const handleSubmit = () => {
    onInvite?.(formData);
    setFormData({ email: "", role: "employee", department: "", message: "" });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Invite User
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Send an invitation to join your organization
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <TextField
            select
            fullWidth
            label="Role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            {roles.map((role) => (
              <MenuItem key={role.value} value={role.value}>
                {role.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            label="Department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          >
            {departments.map((dept) => (
              <MenuItem key={dept} value={dept}>
                {dept}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Custom Message (Optional)"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Add a personal message to the invitation..."
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={<Send />}
          sx={{
            borderRadius: 2,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
          }}
        >
          Send Invitation
        </Button>
      </DialogActions>
    </Dialog>
  );
}
