/**
 * User List Component - TalentHR
 * Displays list of all users with management actions
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
  MenuItem,
  Snackbar,
  InputAdornment,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Edit,
  Block,
  CheckCircle,
  Person,
  Search,
  FilterList,
} from "@mui/icons-material";
import UserEditDialog from "./user-edit-dialog";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "pending";
  companyName?: string;
  lastLogin?: string;
  createdAt: string;
}

interface UserListProps {
  onRefresh?: () => void;
}

export default function UserList({ onRefresh }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [deactivateDialog, setDeactivateDialog] = useState<{
    open: boolean;
    userId: string | null;
    userName: string;
  }>({ open: false, userId: null, userName: "" });
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    user: User | null;
  }>({ open: false, user: null });

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (roleFilter !== "all") params.append("role", roleFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const response = await fetch(`/api/users?${params.toString()}`, {
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
          message: "Failed to fetch users",
        }));
        setError(errorData.message || "Failed to fetch users");
        return;
      }

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Failed to fetch users");
        return;
      }

      setUsers(data.users || []);
      setError("");
    } catch (err) {
      console.error("Fetch users error:", err);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateDialog.userId) return;

    try {
      const response = await fetch(`/api/users/${deactivateDialog.userId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setSnackbar({
          open: true,
          message: data.message || "Failed to deactivate user",
        });
        return;
      }

      setSnackbar({
        open: true,
        message: "User deactivated successfully",
      });
      setDeactivateDialog({ open: false, userId: null, userName: "" });
      fetchUsers();
      onRefresh?.();
    } catch (err) {
      console.error("Deactivate user error:", err);
      setSnackbar({ open: true, message: "Failed to deactivate user" });
    }
  };

  const handleEditSuccess = () => {
    setEditDialog({ open: false, user: null });
    fetchUsers();
    onRefresh?.();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "error";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  const getRoleDisplay = (role: string) => {
    return role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
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
          placeholder="Search by name or email..."
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
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Role</InputLabel>
          <Select
            value={roleFilter}
            label="Role"
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <MenuItem value="all">All Roles</MenuItem>
            <MenuItem value="company_admin">Company Admin</MenuItem>
            <MenuItem value="hr_manager">HR Manager</MenuItem>
            <MenuItem value="recruiter">Recruiter</MenuItem>
            <MenuItem value="manager">Manager</MenuItem>
            <MenuItem value="employee">Employee</MenuItem>
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
            <MenuItem value="inactive">Inactive</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                      ? "No users found matching your filters"
                      : "No users yet"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Person fontSize="small" color="action" />
                      {user.name}
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={getRoleDisplay(user.role)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.status}
                      color={getStatusColor(user.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleDateString()
                      : "Never"}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Tooltip title="Edit user">
                        <IconButton
                          size="small"
                          onClick={() => setEditDialog({ open: true, user })}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {user.status === "active" && (
                        <Tooltip title="Deactivate user">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              setDeactivateDialog({
                                open: true,
                                userId: user.id,
                                userName: user.name,
                              })
                            }
                          >
                            <Block fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {user.status === "inactive" && (
                        <Tooltip title="Activate user">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() =>
                              setEditDialog({
                                open: true,
                                user: { ...user, status: "active" },
                              })
                            }
                          >
                            <CheckCircle fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Deactivate Confirmation Dialog */}
      <Dialog
        open={deactivateDialog.open}
        onClose={() =>
          setDeactivateDialog({ open: false, userId: null, userName: "" })
        }
      >
        <DialogTitle>Deactivate User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to deactivate <strong>{deactivateDialog.userName}</strong>?
            They will not be able to login until reactivated.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setDeactivateDialog({ open: false, userId: null, userName: "" })
            }
          >
            Cancel
          </Button>
          <Button onClick={handleDeactivate} color="error" variant="contained">
            Deactivate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      {editDialog.user && (
        <UserEditDialog
          open={editDialog.open}
          user={editDialog.user}
          onClose={() => setEditDialog({ open: false, user: null })}
          onSuccess={handleEditSuccess}
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

