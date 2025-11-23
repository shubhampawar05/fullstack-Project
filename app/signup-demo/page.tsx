/**
 * Signup Page - Company Admin Registration
 * Features: Multi-step form, OTP verification, company details
 */

"use client";

import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Link,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { Business, ArrowBack, ArrowForward } from "@mui/icons-material";
import OTPVerification from "@/components/auth/otp-verification";

const steps = ["Company Details", "Admin Details", "Verification"];

export default function SignupPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    companySize: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeStep === steps.length - 1) {
      console.log("Signup complete:", formData);
    } else {
      handleNext();
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        p: 2,
      }}
    >
      <Card
        elevation={0}
        sx={{
          maxWidth: 600,
          width: "100%",
          borderRadius: 4,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
        }}
      >
        <CardContent sx={{ p: 5 }}>
          {/* Logo & Title */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: 3,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
                boxShadow: "0 8px 24px rgba(102, 126, 234, 0.4)",
              }}
            >
              <Business sx={{ fontSize: 40, color: "white" }} />
            </Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Create Your Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Get started with TalentHR in minutes
            </Typography>
          </Box>

          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Company Details */}
            {activeStep === 0 && (
              <Box>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  sx={{ mb: 2 }}
                  required
                />
                <TextField
                  fullWidth
                  label="Industry"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  sx={{ mb: 2 }}
                  required
                />
                <TextField
                  fullWidth
                  label="Company Size"
                  value={formData.companySize}
                  onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                  sx={{ mb: 3 }}
                  placeholder="e.g., 1-10, 11-50, 51-200"
                  required
                />
              </Box>
            )}

            {/* Step 2: Admin Details */}
            {activeStep === 1 && (
              <Box>
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </Box>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  sx={{ mb: 2 }}
                  required
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  sx={{ mb: 2 }}
                  required
                />
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  sx={{ mb: 2 }}
                  required
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.agreeToTerms}
                      onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                      required
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I agree to the{" "}
                      <Link href="/terms" underline="hover">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" underline="hover">
                        Privacy Policy
                      </Link>
                    </Typography>
                  }
                />
              </Box>
            )}

            {/* Step 3: OTP Verification */}
            {activeStep === 2 && (
              <OTPVerification
                email={formData.email}
                onVerify={(otp) => console.log("OTP:", otp)}
                onResend={() => console.log("Resend OTP")}
              />
            )}

            {/* Navigation Buttons */}
            {activeStep < 2 && (
              <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                {activeStep > 0 && (
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={handleBack}
                    sx={{ borderRadius: 2, flex: 1 }}
                  >
                    Back
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  endIcon={<ArrowForward />}
                  sx={{
                    borderRadius: 2,
                    flex: 1,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                  }}
                >
                  {activeStep === steps.length - 2 ? "Send OTP" : "Continue"}
                </Button>
              </Box>
            )}
          </form>

          {/* Sign In Link */}
          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{" "}
              <Link href="/login" underline="hover" fontWeight={600}>
                Sign in
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
