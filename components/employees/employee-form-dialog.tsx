/**
 * Employee Form Dialog Component - TalentHR
 * Dialog for creating/editing employee records
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const employeeFormSchema = z.object({
  userId: z.string().min(1, "User is required"),
  departmentId: z.string().optional(),
  position: z.string().min(2).max(100).optional(),
  hireDate: z.string().min(1, "Hire date is required"),
  employmentType: z.enum(["full-time", "part-time", "contract", "intern"]),
  salary: z.number().min(0).optional(),
  managerId: z.string().optional(),
  workLocation: z.string().optional(),
  phone: z.string().optional(),
});

type EmployeeFormData = z.infer<typeof employeeFormSchema>;

interface Employee {
  id: string;
  userId: string;
  employeeId: string;
  department?: { id: string; name: string } | null;
  position?: string;
  hireDate: string;
  employmentType: string;
  manager?: { id: string; name: string } | null;
  workLocation?: string;
  phone?: string;
}

interface EmployeeFormDialogProps {
  open: boolean;
  employee: Employee | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EmployeeFormDialog({
  open,
  employee,
  onClose,
  onSuccess,
}: EmployeeFormDialogProps) {
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      employmentType: "full-time",
      hireDate: new Date().toISOString().split("T")[0],
    },
  });

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch("/api/users", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Filter users who don't have employee records yet (for new employees)
          setUsers(data.users || []);
        }
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, []);

  const fetchDepartments = useCallback(async () => {
    try {
      const response = await fetch("/api/departments", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDepartments(data.departments.filter((d: any) => d.status === "active") || []);
        }
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  }, []);

  const fetchManagers = useCallback(async () => {
    try {
      const response = await fetch("/api/users?role=manager", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setManagers(data.users.filter((u: any) => u.status === "active") || []);
        }
      }
    } catch (error) {
      console.error("Error fetching managers:", error);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    // Fetch data asynchronously
    const loadData = async () => {
      await Promise.all([
        fetchUsers(),
        fetchDepartments(),
        fetchManagers(),
      ]);
    };

    loadData();

    // Reset form
    if (employee) {
      reset({
        userId: employee.userId,
        departmentId: employee.department?.id || "",
        position: employee.position || "",
        hireDate: employee.hireDate ? new Date(employee.hireDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        employmentType: employee.employmentType as any || "full-time",
        managerId: employee.manager?.id || "",
        workLocation: employee.workLocation || "",
        phone: employee.phone || "",
      });
    } else {
      reset({
        employmentType: "full-time",
        hireDate: new Date().toISOString().split("T")[0],
      });
    }
    setError("");
  }, [open, employee, reset, fetchUsers, fetchDepartments, fetchManagers]);

  const onSubmit = async (data: EmployeeFormData) => {
    setError("");
    setLoading(true);

    try {
      const url = employee
        ? `/api/employees/${employee.id}`
        : "/api/employees";
      const method = employee ? "PUT" : "POST";

      const payload: any = {
        ...data,
        departmentId: data.departmentId || undefined,
        managerId: data.managerId || undefined,
        salary: data.salary || undefined,
      };

      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(employee ? payload : { userId: data.userId, ...payload }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || "Failed to save employee");
        setLoading(false);
        return;
      }

      onSuccess();
    } catch (err) {
      console.error("Save employee error:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {employee ? "Edit Employee" : "Create Employee Record"}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            {!employee && (
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.userId}>
                  <InputLabel>Select User</InputLabel>
                  <Controller
                    name="userId"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} label="Select User" disabled={loading}>
                        {users
                          .filter((u) => u.role === "employee" || u.role === "manager")
                          .map((user) => (
                            <MenuItem key={user.id} value={user.id}>
                              {user.name} ({user.email}) - {user.role}
                            </MenuItem>
                          ))}
                      </Select>
                    )}
                  />
                  {errors.userId && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                      {errors.userId.message}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Controller
                  name="departmentId"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Department" disabled={loading}>
                      <MenuItem value="">No Department</MenuItem>
                      {departments.map((dept) => (
                        <MenuItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                {...register("position")}
                fullWidth
                label="Position/Job Title"
                error={!!errors.position}
                helperText={errors.position?.message}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                {...register("hireDate")}
                fullWidth
                type="date"
                label="Hire Date"
                InputLabelProps={{ shrink: true }}
                error={!!errors.hireDate}
                helperText={errors.hireDate?.message}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Employment Type</InputLabel>
                <Controller
                  name="employmentType"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Employment Type" disabled={loading}>
                      <MenuItem value="full-time">Full Time</MenuItem>
                      <MenuItem value="part-time">Part Time</MenuItem>
                      <MenuItem value="contract">Contract</MenuItem>
                      <MenuItem value="intern">Intern</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                {...register("salary", { valueAsNumber: true })}
                fullWidth
                type="number"
                label="Salary (Optional)"
                error={!!errors.salary}
                helperText={errors.salary?.message}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Manager</InputLabel>
                <Controller
                  name="managerId"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Manager" disabled={loading}>
                      <MenuItem value="">No Manager</MenuItem>
                      {managers.map((manager) => (
                        <MenuItem key={manager.id} value={manager.id}>
                          {manager.name} ({manager.email})
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                {...register("workLocation")}
                fullWidth
                label="Work Location"
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                {...register("phone")}
                fullWidth
                label="Phone Number"
                disabled={loading}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
              },
            }}
          >
            {loading ? <CircularProgress size={20} /> : employee ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

