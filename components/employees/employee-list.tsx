/**
 * Employee List Component - TalentHR
 * Displays list of all employees with management actions
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
  Person,
  Search,
  FilterList,
} from "@mui/icons-material";
import EmployeeFormDialog from "./employee-form-dialog";
import EmployeeDetailDialog from "./employee-detail-dialog";

interface Employee {
  id: string;
  userId: string;
  employeeId: string;
  name: string;
  email: string;
  role: string;
  department: {
    id: string;
    name: string;
    code?: string;
  } | null;
  position?: string;
  hireDate: string;
  employmentType: string;
  manager: {
    id: string;
    name: string;
  } | null;
  status: string;
}

interface EmployeeListProps {
  onRefresh?: () => void;
}

export default function EmployeeList({ onRefresh }: EmployeeListProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [formDialog, setFormDialog] = useState<{
    open: boolean;
    employee: Employee | null;
  }>({ open: false, employee: null });
  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    employeeId: string | null;
  }>({ open: false, employeeId: null });

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, [searchTerm, departmentFilter, statusFilter]);

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDepartments(data.departments || []);
        }
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (departmentFilter !== "all") params.append("departmentId", departmentFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchTerm) params.append("search", searchTerm);

      const response = await fetch(`/api/employees?${params.toString()}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Session expired. Please login again.");
          return;
        }
        const errorData = await response.json().catch(() => ({
          message: "Failed to fetch employees",
        }));
        setError(errorData.message || "Failed to fetch employees");
        return;
      }

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Failed to fetch employees");
        return;
      }

      setEmployees(data.employees || []);
      setError("");
    } catch (err) {
      console.error("Fetch employees error:", err);
      setError("Failed to load employees. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSuccess = () => {
    setFormDialog({ open: false, employee: null });
    fetchEmployees();
    onRefresh?.();
  };

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

      {/* Filters */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <TextField
          placeholder="Search by name, email, employee ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ flexGrow: 1, minWidth: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Department</InputLabel>
          <Select
            value={departmentFilter}
            label="Department"
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <MenuItem value="all">All Departments</MenuItem>
            {departments.map((dept) => (
              <MenuItem key={dept.id} value={dept.id}>
                {dept.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="on-leave">On Leave</MenuItem>
            <MenuItem value="terminated">Terminated</MenuItem>
            <MenuItem value="resigned">Resigned</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Position</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm || departmentFilter !== "all" || statusFilter !== "all"
                      ? "No employees found matching your filters"
                      : "No employees yet. Create employee records for users."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <Chip
                      label={employee.employeeId}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Person fontSize="small" color="action" />
                      {employee.name}
                    </Box>
                  </TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>
                    {employee.department ? (
                      <Chip
                        label={employee.department.name}
                        size="small"
                        variant="outlined"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No Department
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{employee.position || "N/A"}</TableCell>
                  <TableCell>
                    <Chip
                      label={employee.status}
                      color={getStatusColor(employee.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Tooltip title="View details">
                        <IconButton
                          size="small"
                          onClick={() =>
                            setDetailDialog({ open: true, employeeId: employee.id })
                          }
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit employee">
                        <IconButton
                          size="small"
                          onClick={() =>
                            setFormDialog({ open: true, employee })
                          }
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Form Dialog */}
      {formDialog.open && (
        <EmployeeFormDialog
          open={formDialog.open}
          employee={formDialog.employee}
          onClose={() => setFormDialog({ open: false, employee: null })}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Detail Dialog */}
      {detailDialog.open && (
        <EmployeeDetailDialog
          open={detailDialog.open}
          employeeId={detailDialog.employeeId!}
          onClose={() => setDetailDialog({ open: false, employeeId: null })}
          onEdit={() => {
            const emp = employees.find((e) => e.id === detailDialog.employeeId);
            setDetailDialog({ open: false, employeeId: null });
            if (emp) {
              setFormDialog({ open: true, employee: emp });
            }
          }}
        />
      )}

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

