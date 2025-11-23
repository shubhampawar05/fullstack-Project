/**
 * Employee Detail Dialog Component - TalentHR
 * Shows detailed employee information
 */

"use client";

import { useState, useEffect, useCallback } from "react";
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
import {
  Person,
  Business,
  Phone,
  Email,
  CalendarToday,
  AccountBalance,
  Edit,
} from "@mui/icons-material";

interface EmployeeDetailDialogProps {
  open: boolean;
  employeeId: string;
  onClose: () => void;
  onEdit: () => void;
}

export default function EmployeeDetailDialog({
  open,
  employeeId,
  onClose,
  onEdit,
}: EmployeeDetailDialogProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [employee, setEmployee] = useState<any>(null);

  const fetchEmployee = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/employees/${employeeId}`, {
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "Failed to fetch employee details",
        }));
        setError(errorData.message || "Failed to fetch employee details");
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Failed to fetch employee details");
        setLoading(false);
        return;
      }

      setEmployee(data.employee);
      setError("");
    } catch (err) {
      console.error("Fetch employee error:", err);
      setError("Failed to load employee details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    if (open && employeeId) {
      fetchEmployee();
    }
  }, [open, employeeId, fetchEmployee]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "on-leave":
        return "warning";
      case "terminated":
        return "error";
      case "resigned":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6">Employee Details</Typography>
          {employee && (
            <Chip
              label={employee.status}
              color={getStatusColor(employee.status) as any}
              size="small"
            />
          )}
        </Box>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : employee ? (
          <Box>
            {/* Basic Information */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Person fontSize="small" />
                Basic Information
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Employee ID
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {employee.employeeId}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {employee.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Email fontSize="small" />
                    Email
                  </Typography>
                  <Typography variant="body1">{employee.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Role
                  </Typography>
                  <Typography variant="body1">{employee.role?.replace("_", " ")}</Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Employment Information */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Business fontSize="small" />
                Employment Information
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Department
                  </Typography>
                  <Typography variant="body1">
                    {employee.department ? (
                      <Chip label={employee.department.name} size="small" variant="outlined" />
                    ) : (
                      "No Department"
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Position
                  </Typography>
                  <Typography variant="body1">{employee.position || "N/A"}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <CalendarToday fontSize="small" />
                    Hire Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(employee.hireDate).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Employment Type
                  </Typography>
                  <Typography variant="body1">
                    {employee.employmentType?.replace("-", " ").replace(/\b\w/g, (l: string) => l.toUpperCase()) || "N/A"}
                  </Typography>
                </Grid>
                {employee.salary && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <AccountBalance fontSize="small" />
                      Salary
                    </Typography>
                    <Typography variant="body1">
                      ${employee.salary.toLocaleString()}
                    </Typography>
                  </Grid>
                )}
                {employee.manager && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Manager
                    </Typography>
                    <Typography variant="body1">{employee.manager.name}</Typography>
                  </Grid>
                )}
                {employee.workLocation && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Work Location
                    </Typography>
                    <Typography variant="body1">{employee.workLocation}</Typography>
                  </Grid>
                )}
                {employee.phone && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Phone fontSize="small" />
                      Phone
                    </Typography>
                    <Typography variant="body1">{employee.phone}</Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>

            {/* Address Information */}
            {employee.address && (
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Address
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <Typography variant="body1">
                      {[
                        employee.address.street,
                        employee.address.city,
                        employee.address.state,
                        employee.address.zipCode,
                        employee.address.country,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            )}

            {/* Emergency Contact */}
            {employee.emergencyContact && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Emergency Contact
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Name
                    </Typography>
                    <Typography variant="body1">{employee.emergencyContact.name}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Relationship
                    </Typography>
                    <Typography variant="body1">{employee.emergencyContact.relationship}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Phone
                    </Typography>
                    <Typography variant="body1">{employee.emergencyContact.phone}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            )}
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {employee && (
          <Button
            onClick={onEdit}
            variant="contained"
            startIcon={<Edit />}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
              },
            }}
          >
            Edit
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

