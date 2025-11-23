/**
 * Payroll Dashboard - Complete UI
 * Professional, Minimal, and Premium UI
 */

"use client";

import { Box, Typography, Grid, Card, CardContent, Button, Chip, Avatar, Stack } from "@mui/material";
import { Add, AttachMoney, TrendingUp, People, Download, CheckCircle, Schedule } from "@mui/icons-material";
import PayslipViewer from "@/app/payroll/payslip-viewer";

// Minimal Card Component for consistency
const MinimalCard = ({ children, sx = {}, ...props }: any) => (
  <Card
    elevation={0}
    sx={{
      height: "100%",
      borderRadius: 3,
      border: "1px solid",
      borderColor: "divider",
      background: "white",
      boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
      transition: "all 0.2s ease-in-out",
      "&:hover": {
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        borderColor: "rgba(0,0,0,0.08)",
      },
      ...sx,
    }}
    {...props}
  >
    {children}
  </Card>
);

const payrollStats = [
  { title: "Total Payroll", value: "$1.2M", change: "+3.2%", icon: <AttachMoney sx={{ fontSize: 24 }} />, color: "#667eea" },
  { title: "Employees Paid", value: 235, change: "+12", icon: <People sx={{ fontSize: 24 }} />, color: "#10b981" },
  { title: "Avg Salary", value: "$5,106", change: "+2.1%", icon: <TrendingUp sx={{ fontSize: 24 }} />, color: "#f59e0b" },
  { title: "Pending", value: 12, change: "-5", icon: <Schedule sx={{ fontSize: 24 }} />, color: "#ef4444" },
];

const recentPayrolls = [
  { month: "November 2024", employees: 235, amount: 1200000, status: "Processed", date: "2024-11-30" },
  { month: "October 2024", employees: 230, amount: 1150000, status: "Processed", date: "2024-10-31" },
  { month: "September 2024", employees: 225, amount: 1100000, status: "Processed", date: "2024-09-30" },
];

const samplePayslip = {
  employeeName: "John Doe",
  employeeId: "EMP-001",
  designation: "Senior Developer",
  department: "Engineering",
  payPeriod: "November 2024",
  payDate: "2024-11-30",
  bankAccount: "****1234",
  earnings: [
    { label: "Basic Salary", amount: 5000, type: "earning" as const },
    { label: "HRA", amount: 2000, type: "earning" as const },
    { label: "Performance Bonus", amount: 1500, type: "earning" as const },
    { label: "Transport Allowance", amount: 500, type: "earning" as const },
  ],
  deductions: [
    { label: "Tax", amount: 1200, type: "deduction" as const },
    { label: "Provident Fund", amount: 600, type: "deduction" as const },
    { label: "Insurance", amount: 200, type: "deduction" as const },
  ],
};

export default function PayrollDashboard() {
  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom sx={{ letterSpacing: "-0.5px" }}>
            Payroll Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Process and manage employee compensation efficiently.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          sx={{ 
            borderRadius: 2, 
            px: 3,
            py: 1,
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "none",
            "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }
          }}
        >
          Process Payroll
        </Button>
      </Box>

      {/* Stats - Minimal Style */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {payrollStats.map((stat, idx) => (
          <Grid item xs={12} sm={6} lg={3} key={idx}>
            <MinimalCard>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                  <Box
                    sx={{
                      p: 1.2,
                      borderRadius: 2,
                      bgcolor: `${stat.color}10`,
                      color: stat.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Chip 
                    label={stat.change} 
                    size="small" 
                    sx={{ 
                      bgcolor: stat.change.startsWith("+") ? "success.50" : "error.50", 
                      color: stat.change.startsWith("+") ? "success.main" : "error.main", 
                      fontWeight: 600,
                      height: 24
                    }} 
                  />
                </Box>
                <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5, color: "text.primary" }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  {stat.title}
                </Typography>
              </CardContent>
            </MinimalCard>
          </Grid>
        ))}
      </Grid>

      {/* Recent Payrolls & Payslip */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={6}>
          <MinimalCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h6" fontWeight={700}>
                  Recent Payroll Runs
                </Typography>
                <Button size="small" endIcon={<Download />}>
                  Export All
                </Button>
              </Box>
              <Stack spacing={2}>
                {recentPayrolls.map((payroll, idx) => (
                  <Box 
                    key={idx} 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      border: "1px solid",
                      borderColor: "divider",
                      transition: "all 0.2s",
                      "&:hover": { borderColor: "primary.main", bgcolor: "primary.50" }
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {payroll.month}
                      </Typography>
                      <Chip 
                        label={payroll.status} 
                        size="small" 
                        icon={<CheckCircle sx={{ fontSize: 14 }} />}
                        sx={{ 
                          bgcolor: "success.50", 
                          color: "success.main", 
                          fontWeight: 600,
                          height: 24,
                          "& .MuiChip-icon": { color: "success.main" }
                        }} 
                      />
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="caption" color="text.secondary">
                        {payroll.employees} employees • Processed on {new Date(payroll.date).toLocaleDateString()}
                      </Typography>
                      <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                        ${(payroll.amount / 1000000).toFixed(2)}M
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </MinimalCard>
        </Grid>

        {/* Sample Payslip */}
        <Grid item xs={12} lg={6}>
          <PayslipViewer payslip={samplePayslip} />
        </Grid>
      </Grid>
    </Box>
  );
}
