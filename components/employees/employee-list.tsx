/**
 * Employee List Component - Premium UI
 * Features: Search, filters, employee cards, actions
 */

"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Chip,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
} from "@mui/material";
import {
  Search,
  FilterList,
  Add,
  Email,
  Phone,
  LocationOn,
} from "@mui/icons-material";

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  status: "Active" | "On Leave" | "Inactive";
  avatar?: string;
  joinDate: string;
  location: string;
}

const dummyEmployees: Employee[] = [
  { id: "1", name: "Sarah Johnson", email: "sarah.j@company.com", phone: "+1 234-567-8901", position: "Team Lead", department: "Engineering", status: "Active", joinDate: "2022-01-15", location: "New York" },
  { id: "2", name: "Michael Chen", email: "michael.c@company.com", phone: "+1 234-567-8902", position: "Senior Developer", department: "Engineering", status: "Active", joinDate: "2021-06-20", location: "San Francisco" },
  { id: "3", name: "Emily Davis", email: "emily.d@company.com", phone: "+1 234-567-8903", position: "Product Manager", department: "Product", status: "Active", joinDate: "2020-03-10", location: "Austin" },
  { id: "4", name: "James Wilson", email: "james.w@company.com", phone: "+1 234-567-8904", position: "UX Designer", department: "Design", status: "On Leave", joinDate: "2021-11-05", location: "Seattle" },
  { id: "5", name: "Priya Sharma", email: "priya.s@company.com", phone: "+1 234-567-8905", position: "HR Manager", department: "Human Resources", status: "Active", joinDate: "2019-08-12", location: "Boston" },
  { id: "6", name: "Amit Kumar", email: "amit.k@company.com", phone: "+1 234-567-8906", position: "Marketing Lead", department: "Marketing", status: "Active", joinDate: "2022-02-28", location: "Chicago" },
];

export default function EmployeeList() {
  const getStatusColor = (status: Employee["status"]) => {
    switch (status) {
      case "Active": return "#10b981";
      case "On Leave": return "#f59e0b";
      case "Inactive": return "#ef4444";
      default: return "#6b7280";
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Employees
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your workforce
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{
            borderRadius: 2,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
          }}
        >
          Add Employee
        </Button>
      </Box>

      {/* Filters */}
      <Card elevation={0} sx={{ mb: 3, borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search employees..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField select fullWidth defaultValue="all" label="Department">
                <MenuItem value="all">All Departments</MenuItem>
                <MenuItem value="engineering">Engineering</MenuItem>
                <MenuItem value="product">Product</MenuItem>
                <MenuItem value="design">Design</MenuItem>
                <MenuItem value="hr">Human Resources</MenuItem>
                <MenuItem value="marketing">Marketing</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField select fullWidth defaultValue="all" label="Status">
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="on-leave">On Leave</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Employee Grid */}
      <Grid container spacing={3}>
        {dummyEmployees.map((employee) => (
          <Grid item xs={12} sm={6} lg={4} key={employee.id}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(12px)",
                transition: "all 0.3s",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      border: "3px solid #f0f0f0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  >
                    {employee.name.charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={700}>
                      {employee.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {employee.position}
                    </Typography>
                  </Box>
                  <Chip
                    label={employee.status}
                    size="small"
                    sx={{
                      bgcolor: `${getStatusColor(employee.status)}15`,
                      color: getStatusColor(employee.status),
                      fontWeight: 600,
                    }}
                  />
                </Box>

                {/* Details */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Email sx={{ fontSize: 16, color: "text.secondary" }} />
                    <Typography variant="caption" color="text.secondary">
                      {employee.email}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Phone sx={{ fontSize: 16, color: "text.secondary" }} />
                    <Typography variant="caption" color="text.secondary">
                      {employee.phone}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LocationOn sx={{ fontSize: 16, color: "text.secondary" }} />
                    <Typography variant="caption" color="text.secondary">
                      {employee.location}
                    </Typography>
                  </Box>
                </Box>

                {/* Footer */}
                <Box
                  sx={{
                    pt: 2,
                    borderTop: "1px solid rgba(0,0,0,0.08)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {employee.department}
                    </Typography>
                    <Typography variant="caption" display="block" fontWeight={600}>
                      Joined {new Date(employee.joinDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Button size="small" variant="outlined" sx={{ borderRadius: 2 }}>
                    View Profile
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
