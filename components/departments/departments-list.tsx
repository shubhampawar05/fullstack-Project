/**
 * Departments Component - Complete UI
 */

"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  Avatar,
  AvatarGroup,
  LinearProgress,
} from "@mui/material";
import { Add, Business, People, TrendingUp } from "@mui/icons-material";

const departments = [
  { id: "1", name: "Engineering", manager: "Sarah Johnson", employees: 85, budget: 2500000, utilization: 92, color: "#667eea" },
  { id: "2", name: "Sales", manager: "Michael Chen", employees: 42, budget: 1200000, utilization: 88, color: "#10b981" },
  { id: "3", name: "Marketing", manager: "Emily Davis", employees: 28, budget: 800000, utilization: 85, color: "#f59e0b" },
  { id: "4", name: "Human Resources", manager: "Priya Sharma", employees: 15, budget: 500000, utilization: 90, color: "#8b5cf6" },
  { id: "5", name: "Finance", manager: "James Wilson", employees: 22, budget: 600000, utilization: 87, color: "#3b82f6" },
  { id: "6", name: "Product", manager: "Amit Kumar", employees: 35, budget: 1500000, utilization: 91, color: "#ec4899" },
];

export default function DepartmentsList() {
  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>Departments</Typography>
          <Typography variant="body2" color="text.secondary">Manage organizational structure</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} sx={{ borderRadius: 2, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)" }}>
          Add Department
        </Button>
      </Box>

      <Grid container spacing={3}>
        {departments.map((dept) => (
          <Grid item xs={12} sm={6} lg={4} key={dept.id}>
            <Card elevation={0} sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", transition: "all 0.3s", "&:hover": { transform: "translateY(-8px)", boxShadow: "0 12px 40px rgba(0,0,0,0.15)" } }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                  <Box sx={{ width: 56, height: 56, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, ${dept.color}15 0%, ${dept.color}25 100%)` }}>
                    <Business sx={{ fontSize: 32, color: dept.color }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={700}>{dept.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{dept.employees} employees</Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">Budget Utilization</Typography>
                    <Typography variant="caption" fontWeight={700} sx={{ color: dept.color }}>{dept.utilization}%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={dept.utilization} sx={{ height: 8, borderRadius: 4, bgcolor: "rgba(0,0,0,0.05)", "& .MuiLinearProgress-bar": { borderRadius: 4, bgcolor: dept.color, boxShadow: `0 0 10px ${dept.color}50` } }} />
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 2, borderTop: "1px solid rgba(0,0,0,0.08)" }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Manager</Typography>
                    <Typography variant="body2" fontWeight={600}>{dept.manager}</Typography>
                  </Box>
                  <Chip label={`$${(dept.budget / 1000000).toFixed(1)}M`} size="small" sx={{ bgcolor: `${dept.color}15`, color: dept.color, fontWeight: 600 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
