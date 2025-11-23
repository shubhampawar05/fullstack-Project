/**
 * Employee Management Page - TalentHR
 * Premium redesign with Card/List/Table view toggle
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import {
  Add,
  People,
  Search,
  ViewModule,
  ViewList,
  TableChart,
  Email,
  Phone,
  LocationOn,
  MoreVert,
  TrendingUp,
  Work,
} from "@mui/icons-material";
import DashboardLayout from "@/components/layout/dashboard-layout";
import EmployeeList from "@/components/employees/employee-list";
import EmployeeFormDialog from "@/components/employees/employee-form-dialog";
import { useAuth } from "@/contexts/auth-context";
import { dummyEmployees } from "@/utils/dummyData";

type ViewMode = "card" | "list" | "table";

export default function EmployeesPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [formDialog, setFormDialog] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Stats
  const stats = {
    total: dummyEmployees.length,
    active: dummyEmployees.filter(e => e.status === "Active").length,
    onLeave: dummyEmployees.filter(e => e.status === "On Leave").length,
    departments: new Set(dummyEmployees.map(e => e.department)).size,
  };

  // Filter employees
  const filteredEmployees = dummyEmployees.filter(emp => {
    const matchesSearch = emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emp.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === "all" || emp.department === departmentFilter;
    const matchesStatus = statusFilter === "all" || emp.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }
    if (user.role !== "company_admin" && user.role !== "hr_manager" && user.role !== "manager") {
      router.push(`/dashboard/${user.role || "employee"}`);
      return;
    }
    setTimeout(() => setCheckingAuth(false), 0);
  }, [authLoading, isAuthenticated, user, router]);

  const handleRefresh = () => setRefreshKey((prev) => prev + 1);
  const handleFormSuccess = () => {
    setFormDialog(false);
    handleRefresh();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "#10b981";
      case "On Leave": return "#f59e0b";
      case "Inactive": return "#ef4444";
      default: return "#6b7280";
    }
  };

  if (checkingAuth) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <DashboardLayout role={(user?.role as any) || "company_admin"}>
      <Container maxWidth="xl" sx={{ pb: 4 }}>
        {/* Hero Header */}
        <Paper
          elevation={0}
          sx={{
            p: 5,
            mb: 4,
            borderRadius: 4,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(118, 75, 162, 0.4)",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)",
              animation: "pulse 4s ease-in-out infinite",
              "@keyframes pulse": {
                "0%, 100%": { transform: "scale(1)", opacity: 0.5 },
                "50%": { transform: "scale(1.1)", opacity: 0.8 },
              },
            }}
          />
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="h3" fontWeight={700} gutterBottom sx={{ letterSpacing: "-1px" }}>
                  Employee Management
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 400, mb: 3 }}>
                  Manage your workforce and organizational structure
                </Typography>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <Chip label={`${stats.total} Total`} sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 600 }} />
                  <Chip label={`${stats.active} Active`} sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 600 }} />
                  <Chip label={`${stats.departments} Departments`} sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 600 }} />
                </Box>
              </Box>
              {(user?.role === "company_admin" || user?.role === "hr_manager") && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setFormDialog(true)}
                  sx={{
                    bgcolor: "white",
                    color: "#667eea",
                    fontWeight: 600,
                    "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                  }}
                >
                  Add Employee
                </Button>
              )}
            </Box>
          </Box>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { title: "Total Employees", value: stats.total, icon: <People />, color: "#667eea" },
            { title: "Active", value: stats.active, icon: <TrendingUp />, color: "#10b981" },
            { title: "On Leave", value: stats.onLeave, icon: <Work />, color: "#f59e0b" },
            { title: "Departments", value: stats.departments, icon: <People />, color: "#8b5cf6" },
          ].map((stat, idx) => (
            <Grid item xs={12} sm={6} lg={3} key={idx}>
              <Card elevation={0} sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", background: "rgba(255, 255, 255, 0.7)", backdropFilter: "blur(12px)", transition: "all 0.3s", "&:hover": { transform: "translateY(-8px)" } }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: 3, background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}25 100%)` }}>
                      <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>{stat.title}</Typography>
                  <Typography variant="h3" fontWeight={700}>{stat.value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Filters & View Toggle */}
        <Card elevation={0} sx={{ mb: 3, borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", background: "rgba(255, 255, 255, 0.7)", backdropFilter: "blur(12px)" }}>
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField select fullWidth label="Department" value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
                  <MenuItem value="all">All Departments</MenuItem>
                  {Array.from(new Set(dummyEmployees.map(e => e.department))).map(dept => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField select fullWidth label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="On Leave">On Leave</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <ToggleButtonGroup value={viewMode} exclusive onChange={(_, val) => val && setViewMode(val)} fullWidth>
                  <ToggleButton value="card"><ViewModule /></ToggleButton>
                  <ToggleButton value="list"><ViewList /></ToggleButton>
                  <ToggleButton value="table"><TableChart /></ToggleButton>
                </ToggleButtonGroup>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Employee Display */}
        <Card elevation={0} sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", background: "rgba(255, 255, 255, 0.7)", backdropFilter: "blur(12px)" }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {filteredEmployees.length} Employees
            </Typography>

            {/* Card View */}
            {viewMode === "card" && (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                {filteredEmployees.map((emp) => (
                  <Grid item xs={12} sm={6} lg={4} key={emp.id}>
                    <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)", transition: "all 0.3s", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" } }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                          <Avatar sx={{ width: 56, height: 56 }} src={emp.avatar}>{emp.firstName.charAt(0)}</Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" fontWeight={700}>{emp.firstName} {emp.lastName}</Typography>
                            <Typography variant="caption" color="text.secondary">{emp.position}</Typography>
                          </Box>
                          <Chip label={emp.status} size="small" sx={{ bgcolor: `${getStatusColor(emp.status)}15`, color: getStatusColor(emp.status), fontWeight: 600 }} />
                        </Box>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Email sx={{ fontSize: 16, color: "text.secondary" }} />
                            <Typography variant="caption">{emp.email}</Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Phone sx={{ fontSize: 16, color: "text.secondary" }} />
                            <Typography variant="caption">{emp.phone}</Typography>
                          </Box>
                        </Box>
                        <Box sx={{ pt: 2, borderTop: "1px solid rgba(0,0,0,0.08)", display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="caption" color="text.secondary">{emp.department}</Typography>
                          <Button size="small" variant="outlined" sx={{ borderRadius: 2 }}>View</Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            {/* List View */}
            {viewMode === "list" && (
              <List sx={{ mt: 1 }}>
                {filteredEmployees.map((emp, idx) => (
                  <Box key={emp.id}>
                    <ListItem sx={{ borderRadius: 2, "&:hover": { bgcolor: "rgba(0,0,0,0.02)" } }}>
                      <ListItemAvatar>
                        <Avatar src={emp.avatar}>{emp.firstName.charAt(0)}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Typography fontWeight={600}>{emp.firstName} {emp.lastName}</Typography>}
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">{emp.position} • {emp.department}</Typography>
                            <Typography variant="caption" color="text.secondary">{emp.email}</Typography>
                          </Box>
                        }
                      />
                      <Chip label={emp.status} size="small" sx={{ bgcolor: `${getStatusColor(emp.status)}15`, color: getStatusColor(emp.status), fontWeight: 600, mr: 2 }} />
                      <ListItemSecondaryAction>
                        <IconButton><MoreVert /></IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {idx < filteredEmployees.length - 1 && <Box sx={{ height: 1, bgcolor: "divider", mx: 2 }} />}
                  </Box>
                ))}
              </List>
            )}

            {/* Table View */}
            {viewMode === "table" && (
              <TableContainer sx={{ mt: 1 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Employee</TableCell>
                      <TableCell>Position</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredEmployees.map((emp) => (
                      <TableRow key={emp.id} sx={{ "&:hover": { bgcolor: "rgba(0,0,0,0.02)" } }}>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Avatar src={emp.avatar} sx={{ width: 40, height: 40 }}>{emp.firstName.charAt(0)}</Avatar>
                            <Typography fontWeight={600}>{emp.firstName} {emp.lastName}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{emp.position}</TableCell>
                        <TableCell>{emp.department}</TableCell>
                        <TableCell>{emp.email}</TableCell>
                        <TableCell>{emp.phone}</TableCell>
                        <TableCell>
                          <Chip label={emp.status} size="small" sx={{ bgcolor: `${getStatusColor(emp.status)}15`, color: getStatusColor(emp.status), fontWeight: 600 }} />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small"><MoreVert /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        <EmployeeFormDialog
          open={formDialog}
          employee={null}
          onClose={() => setFormDialog(false)}
          onSuccess={handleFormSuccess}
        />
      </Container>
    </DashboardLayout>
  );
}
