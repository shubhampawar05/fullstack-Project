/**
 * Payslip Viewer Component - Premium UI
 * Features: Detailed breakdown, download option, professional design
 */

"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Button,
  Chip,
  Grid,
  IconButton,
} from "@mui/material";
import {
  Download,
  Print,
  CheckCircle,
  CalendarToday,
  AccountBalance,
} from "@mui/icons-material";

interface PayslipItem {
  label: string;
  amount: number;
  type: "earning" | "deduction";
}

interface PayslipData {
  employeeName: string;
  employeeId: string;
  designation: string;
  department: string;
  payPeriod: string;
  payDate: string;
  bankAccount: string;
  earnings: PayslipItem[];
  deductions: PayslipItem[];
}

interface PayslipViewerProps {
  payslip: PayslipData;
  onDownload?: () => void;
  onPrint?: () => void;
}

export default function PayslipViewer({ payslip, onDownload, onPrint }: PayslipViewerProps) {
  const totalEarnings = payslip.earnings.reduce((sum, item) => sum + item.amount, 0);
  const totalDeductions = payslip.deductions.reduce((sum, item) => sum + item.amount, 0);
  const netPay = totalEarnings - totalDeductions;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        border: "1px solid rgba(255,255,255,0.6)",
        background: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(12px)",
        maxWidth: 800,
        mx: "auto",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          p: 4,
          borderRadius: "16px 16px 0 0",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Payslip
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {payslip.payPeriod}
            </Typography>
          </Box>
          <Chip
            icon={<CheckCircle />}
            label="Paid"
            sx={{
              bgcolor: "rgba(16, 185, 129, 0.2)",
              color: "white",
              fontWeight: 600,
              backdropFilter: "blur(10px)",
              border: "2px solid rgba(255,255,255,0.3)",
            }}
          />
        </Box>

        {/* Employee Info */}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Employee Name
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {payslip.employeeName}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Employee ID
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {payslip.employeeId}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Designation
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {payslip.designation}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Department
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {payslip.department}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      <CardContent sx={{ p: 4 }}>
        {/* Pay Details */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "rgba(102, 126, 234, 0.05)",
                  border: "1px solid rgba(102, 126, 234, 0.1)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <CalendarToday sx={{ fontSize: 16, color: "#667eea" }} />
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Pay Date
                  </Typography>
                </Box>
                <Typography variant="body1" fontWeight={700}>
                  {new Date(payslip.payDate).toLocaleDateString()}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "rgba(102, 126, 234, 0.05)",
                  border: "1px solid rgba(102, 126, 234, 0.1)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <AccountBalance sx={{ fontSize: 16, color: "#667eea" }} />
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Bank Account
                  </Typography>
                </Box>
                <Typography variant="body1" fontWeight={700}>
                  {payslip.bankAccount}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Earnings */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: "#10b981" }}>
            Earnings
          </Typography>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: "rgba(16, 185, 129, 0.05)",
              border: "1px solid rgba(16, 185, 129, 0.1)",
            }}
          >
            {payslip.earnings.map((item, idx) => (
              <Box key={idx}>
                <Box sx={{ display: "flex", justifyContent: "space-between", py: 1.5 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {item.label}
                  </Typography>
                  <Typography variant="body2" fontWeight={700} sx={{ color: "#10b981" }}>
                    {formatCurrency(item.amount)}
                  </Typography>
                </Box>
                {idx < payslip.earnings.length - 1 && <Divider />}
              </Box>
            ))}
            <Divider sx={{ my: 2, borderColor: "rgba(16, 185, 129, 0.2)" }} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="subtitle1" fontWeight={700}>
                Total Earnings
              </Typography>
              <Typography variant="h6" fontWeight={700} sx={{ color: "#10b981" }}>
                {formatCurrency(totalEarnings)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Deductions */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: "#ef4444" }}>
            Deductions
          </Typography>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: "rgba(239, 68, 68, 0.05)",
              border: "1px solid rgba(239, 68, 68, 0.1)",
            }}
          >
            {payslip.deductions.map((item, idx) => (
              <Box key={idx}>
                <Box sx={{ display: "flex", justifyContent: "space-between", py: 1.5 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {item.label}
                  </Typography>
                  <Typography variant="body2" fontWeight={700} sx={{ color: "#ef4444" }}>
                    -{formatCurrency(item.amount)}
                  </Typography>
                </Box>
                {idx < payslip.deductions.length - 1 && <Divider />}
              </Box>
            ))}
            <Divider sx={{ my: 2, borderColor: "rgba(239, 68, 68, 0.2)" }} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="subtitle1" fontWeight={700}>
                Total Deductions
              </Typography>
              <Typography variant="h6" fontWeight={700} sx={{ color: "#ef4444" }}>
                -{formatCurrency(totalDeductions)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Net Pay */}
        <Box
          sx={{
            p: 3,
            borderRadius: 3,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Net Pay
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {formatCurrency(netPay)}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle sx={{ fontSize: 40 }} />
            </Box>
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<Download />}
            onClick={onDownload}
            sx={{
              borderRadius: 2,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
              fontWeight: 600,
            }}
          >
            Download PDF
          </Button>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<Print />}
            onClick={onPrint}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            Print
          </Button>
        </Box>

        {/* Footer Note */}
        <Box
          sx={{
            mt: 4,
            p: 2,
            borderRadius: 2,
            bgcolor: "rgba(0,0,0,0.02)",
            border: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
            This is a computer-generated payslip and does not require a signature.
            <br />
            For any queries, please contact the HR department.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
