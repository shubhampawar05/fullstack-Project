/**
 * Payroll Dashboard Component - TalentHR
 * Soft Claymorphism Design
 */

"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Stack,
} from "@mui/material";
import {
  AttachMoney,
  AccountBalance,
  Receipt,
  TrendingUp,
  Download,
  Visibility,
  MoreVert,
  DateRange,
} from "@mui/icons-material";
import ClayCard from "@/components/ui/clay-card";
import ClayButton from "@/components/ui/clay-button";

// Dummy Data
const payrollHistory = [
  {
    id: "PAY-2023-001",
    month: "October 2023",
    date: "Oct 28, 2023",
    amount: "$4,500.00",
    status: "Paid",
    downloadUrl: "#",
  },
  {
    id: "PAY-2023-002",
    month: "September 2023",
    date: "Sep 28, 2023",
    amount: "$4,500.00",
    status: "Paid",
    downloadUrl: "#",
  },
  {
    id: "PAY-2023-003",
    month: "August 2023",
    date: "Aug 28, 2023",
    amount: "$4,500.00",
    status: "Paid",
    downloadUrl: "#",
  },
];

export default function PayrollDashboard() {
  return (
    <Box>
      {/* Header Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <ClayCard
            sx={{
              p: 4,
              background: "linear-gradient(135deg, #00cec9 0%, #81ecec 100%)",
              color: "white",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: "rgba(255,255,255,0.2)", borderRadius: 3 }}>
                <AttachMoney sx={{ fontSize: 32 }} />
              </Box>
              <Typography variant="h4" fontWeight={800}>
                Payroll & Benefits
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
              Manage your salary, view payslips, and track your benefits.
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <ClayButton
                variant="contained"
                sx={{ bgcolor: "white", color: "secondary.main", "&:hover": { bgcolor: "#f0f4f8" } }}
              >
                View Latest Payslip
              </ClayButton>
              <ClayButton
                variant="outlined"
                sx={{ borderColor: "rgba(255,255,255,0.5)", color: "white", "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" } }}
              >
                Tax Documents
              </ClayButton>
            </Box>
          </ClayCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <ClayCard sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Next Payday
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: "#f0f4f8",
                  color: "primary.main",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  minWidth: 80,
                }}
              >
                <Typography variant="caption" fontWeight={700} color="text.secondary">NOV</Typography>
                <Typography variant="h4" fontWeight={800}>28</Typography>
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={800}>5 Days</Typography>
                <Typography variant="body2" color="text.secondary">Remaining</Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <DateRange fontSize="small" color="action" />
              Estimated Amount: <strong>$4,500.00</strong>
            </Typography>
          </ClayCard>
        </Grid>
      </Grid>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: "Net Salary", value: "$4,500", sub: "Last Month", icon: <AccountBalance />, color: "#6c5ce7" },
          { title: "Gross Salary", value: "$5,800", sub: "Last Month", icon: <TrendingUp />, color: "#00cec9" },
          { title: "Deductions", value: "$1,300", sub: "Tax & Benefits", icon: <Receipt />, color: "#ff7675" },
        ].map((stat, idx) => (
          <Grid item xs={12} md={4} key={idx}>
            <ClayCard sx={{ height: "100%" }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 3,
                      bgcolor: `${stat.color}15`,
                      color: stat.color,
                      display: "flex",
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <IconButton size="small">
                    <MoreVert fontSize="small" />
                  </IconButton>
                </Box>
                <Typography variant="h3" fontWeight={800} sx={{ mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  {stat.title}
                </Typography>
                <Chip
                  label={stat.sub}
                  size="small"
                  sx={{
                    mt: 2,
                    bgcolor: `${stat.color}15`,
                    color: stat.color,
                    fontWeight: 700,
                  }}
                />
              </CardContent>
            </ClayCard>
          </Grid>
        ))}
      </Grid>

      {/* Recent Payslips */}
      <ClayCard sx={{ p: 0, overflow: "hidden" }}>
        <Box sx={{ p: 3, borderBottom: "1px solid rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" fontWeight={700}>
            Recent Payslips
          </Typography>
          <ClayButton variant="text" size="small">View All History</ClayButton>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8faff" }}>
                <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Month</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: "text.secondary" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payrollHistory.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{row.month}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{row.amount}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.status}
                      size="small"
                      sx={{
                        bgcolor: "success.light",
                        color: "white",
                        fontWeight: 700,
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton size="small" sx={{ color: "primary.main", bgcolor: "primary.light", "&:hover": { bgcolor: "primary.main", color: "white" } }}>
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton size="small" sx={{ color: "text.secondary", bgcolor: "#f0f4f8", "&:hover": { bgcolor: "#e6eaf0" } }}>
                        <Download fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </ClayCard>
    </Box>
  );
}
