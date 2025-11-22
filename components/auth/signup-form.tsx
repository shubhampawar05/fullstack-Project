/**
 * Signup Form Component - TalentHR
 * Handles:
 * 1. Company Admin signup (direct)
 * 2. Invitation-based signup (with token)
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
  Fade,
  Chip,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Business,
  Email,
  Lock,
  Person as PersonIcon,
  BusinessCenter,
  ArrowForward,
  CheckCircle,
  Verified,
  Send,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SignupCredentials, UserRole, InvitationInfo } from "@/types/auth";

// Schema for company admin signup
const companyAdminSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    companyName: z.string().min(2, "Company name must be at least 2 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Schema for invitation signup
const invitationSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type CompanyAdminFormData = z.infer<typeof companyAdminSchema>;
type InvitationFormData = z.infer<typeof invitationSchema>;

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(!!token);
  const [invitationInfo, setInvitationInfo] = useState<InvitationInfo | null>(
    null
  );

  // OTP states for company admin signup
  const [otpStep, setOtpStep] = useState<"form" | "otp">("form");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [verifyingOTP, setVerifyingOTP] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpExpiresIn, setOtpExpiresIn] = useState(0);
  const [formData, setFormData] = useState<CompanyAdminFormData | null>(null);

  // Countdown timer for OTP
  useEffect(() => {
    if (otpExpiresIn > 0 && otpStep === "otp") {
      const timer = setInterval(() => {
        setOtpExpiresIn((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [otpExpiresIn, otpStep]);

  // Check if this is invitation-based signup
  const isInvitationSignup = !!token;

  // Validate invitation token on mount if token exists
  useEffect(() => {
    if (token) {
      validateInvitationToken(token);
    }
  }, [token]);

  const validateInvitationToken = async (invitationToken: string) => {
    try {
      setValidatingToken(true);
      const response = await fetch(
        `/api/invitations/validate?token=${invitationToken}`
      );
      const data: InvitationInfo = await response.json();

      if (!response.ok || !data.valid) {
        setError(data.message || "Invalid or expired invitation link");
        setValidatingToken(false);
        return;
      }

      setInvitationInfo(data);
      setValidatingToken(false);
    } catch (err) {
      setError("Failed to validate invitation. Please try again.");
      setValidatingToken(false);
    }
  };

  // Company Admin Form
  const companyAdminForm = useForm<CompanyAdminFormData>({
    resolver: zodResolver(companyAdminSchema),
  });

  // Invitation Form
  const invitationForm = useForm<InvitationFormData>({
    resolver: zodResolver(invitationSchema),
  });

  // Send OTP for company admin signup
  const handleSendOTP = async (data: CompanyAdminFormData) => {
    setError("");
    setSendingOTP(true);

    try {
      const response = await fetch("/api/otp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
        email: data.email,
          purpose: "company_admin_signup",
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || "Failed to send OTP. Please try again.");
        setSendingOTP(false);
        return;
      }

      // Save form data for later
      setFormData(data);
      setOtpSent(true);
      setOtpStep("otp");
      setOtpExpiresIn(result.expiresIn || 600);
      setSendingOTP(false);

      // Show OTP in development (remove in production)
      if (result.otp) {
        console.log(`📧 OTP: ${result.otp}`);
      }
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
      setSendingOTP(false);
    }
  };

  // Verify OTP and create account
  const handleVerifyOTPAndSignup = async () => {
    if (!formData || !otpCode) {
      setError("Please enter the OTP code");
      return;
    }

    setError("");
    setVerifyingOTP(true);

    try {
      // Verify OTP
      const verifyResponse = await fetch("/api/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          otp: otpCode,
          purpose: "company_admin_signup",
        }),
      });

      const verifyResult = await verifyResponse.json();

      if (!verifyResponse.ok || !verifyResult.success) {
        setError(verifyResult.message || "Invalid OTP code");
        setVerifyingOTP(false);
        return;
      }

      // OTP verified, now create account
      setLoading(true);
      const signupData: SignupCredentials & { otpVerified?: boolean } = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "company_admin",
        companyName: formData.companyName,
        otpVerified: true,
      };

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || "Signup failed. Please try again.");
        setLoading(false);
        setVerifyingOTP(false);
        return;
      }

      router.push("/dashboard/admin");
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
      setVerifyingOTP(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (!formData) return;
    await handleSendOTP(formData);
  };

  const onSubmitInvitation = async (data: InvitationFormData) => {
    if (!token || !invitationInfo?.invitation) {
      setError("Invalid invitation");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const signupData: SignupCredentials = {
        name: data.name,
        email: invitationInfo.invitation.email,
        password: data.password,
        role: invitationInfo.invitation.role,
        token: token,
      };

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || "Signup failed. Please try again.");
        setLoading(false);
        return;
      }

      // Redirect based on role
      const role = invitationInfo.invitation.role;
      let dashboardPath = "/dashboard/employee";
      if (role === "company_admin") dashboardPath = "/dashboard/admin";
      else if (role === "hr_manager") dashboardPath = "/dashboard/hr";
      else if (role === "recruiter") dashboardPath = "/dashboard/recruiter";
      else if (role === "manager") dashboardPath = "/dashboard/manager";

      router.push(dashboardPath);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  // Show loading while validating token
  if (isInvitationSignup && validatingToken) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100%",
        }}
      >
        <Card
          elevation={0}
          sx={{
            maxWidth: 520,
            width: "100%",
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            border: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography>Validating invitation...</Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Show error if invitation is invalid
  if (isInvitationSignup && !invitationInfo?.valid) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100%",
        }}
      >
        <Card
          elevation={0}
          sx={{
            maxWidth: 520,
            width: "100%",
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            border: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error || "Invalid or expired invitation link"}
            </Alert>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => router.push("/login")}
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Render invitation signup form
  if (isInvitationSignup && invitationInfo?.valid) {
    const inv = invitationInfo.invitation!;
    const { register, handleSubmit, formState } = invitationForm;

  return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100%",
        }}
      >
        <Card
          elevation={0}
          sx={{
            maxWidth: 520,
            width: "100%",
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            border: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          <Box
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              p: 4,
              textAlign: "center",
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              fontWeight={700}
              gutterBottom
              sx={{ letterSpacing: "-0.5px" }}
            >
              Join {inv.company.name}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              You&apos;ve been invited as {inv.role.replace("_", " ")}
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {error && (
              <Fade in={!!error}>
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
                </Alert>
              </Fade>
            )}

            {/* Read-only invitation info */}
            <Box sx={{ mb: 3, p: 2, bgcolor: "action.hover", borderRadius: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <CheckCircle color="success" fontSize="small" />
                <Typography variant="body2" fontWeight={600}>
                  Invitation Details
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                <strong>Email:</strong> {inv.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Role:</strong> {inv.role.replace("_", " ")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Company:</strong> {inv.company.name}
              </Typography>
            </Box>

            <Box
              component="form"
              onSubmit={handleSubmit(onSubmitInvitation)}
            >
              <TextField
                {...register("name")}
                fullWidth
                label="Full Name"
                      autoComplete="name"
                error={!!formState.errors.name}
                helperText={formState.errors.name?.message}
                sx={{ mb: 2.5 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                {...register("password")}
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                error={!!formState.errors.password}
                helperText={
                  formState.errors.password?.message || "Minimum 8 characters"
                }
                sx={{ mb: 2.5 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: "text.secondary", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                {...register("confirmPassword")}
                fullWidth
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                error={!!formState.errors.confirmPassword}
                helperText={formState.errors.confirmPassword?.message}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: "text.secondary", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        edge="end"
                        size="small"
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                endIcon={!loading && <ArrowForward />}
                sx={{
                  py: 1.5,
                  mb: 3,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  fontSize: "1rem",
                  fontWeight: 600,
                  textTransform: "none",
                  boxShadow: "0 4px 14px rgba(102, 126, 234, 0.4)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                    boxShadow: "0 6px 20px rgba(102, 126, 234, 0.5)",
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: "white" }} />
                ) : (
                  "Create Account"
                )}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Render company admin signup form
  const { register, handleSubmit, formState } = companyAdminForm;

  // Show OTP verification screen
  if (otpStep === "otp" && formData) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100%",
        }}
      >
        <Card
          elevation={0}
          sx={{
            maxWidth: 520,
            width: "100%",
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            border: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          <Box
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              p: 4,
              textAlign: "center",
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              fontWeight={700}
              gutterBottom
              sx={{ letterSpacing: "-0.5px" }}
            >
              Verify Your Email
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              We&apos;ve sent a 6-digit code to {formData.email}
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {error && (
              <Fade in={!!error}>
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              </Fade>
            )}

            <Box sx={{ mb: 3, textAlign: "center" }}>
              <Verified sx={{ fontSize: 64, color: "primary.main", mb: 2 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Enter the verification code sent to your email
              </Typography>
              {otpExpiresIn > 0 && (
                <Typography variant="caption" color="text.secondary">
                  Code expires in {Math.floor(otpExpiresIn / 60)}:
                  {(otpExpiresIn % 60).toString().padStart(2, "0")}
                </Typography>
              )}
            </Box>

            <TextField
              fullWidth
              label="Enter OTP"
              value={otpCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                setOtpCode(value);
              }}
              placeholder="000000"
              inputProps={{
                maxLength: 6,
                style: {
                  textAlign: "center",
                  fontSize: "24px",
                  letterSpacing: "8px",
                  fontWeight: 600,
                },
              }}
              sx={{ mb: 2 }}
              error={!!error && otpCode.length === 6}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={otpCode.length !== 6 || verifyingOTP || loading}
              onClick={handleVerifyOTPAndSignup}
              sx={{
                py: 1.5,
                mb: 2,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                fontSize: "1rem",
                fontWeight: 600,
                textTransform: "none",
                boxShadow: "0 4px 14px rgba(102, 126, 234, 0.4)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                  boxShadow: "0 6px 20px rgba(102, 126, 234, 0.5)",
                },
              }}
            >
              {(verifyingOTP || loading) ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : (
                "Verify & Create Account"
              )}
            </Button>

            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Didn&apos;t receive the code?
              </Typography>
              <Button
                variant="text"
                size="small"
                onClick={handleResendOTP}
                disabled={sendingOTP || otpExpiresIn > 540} // Disable if less than 1 min remaining
                sx={{ textTransform: "none" }}
              >
                {sendingOTP ? "Sending..." : "Resend OTP"}
              </Button>
              {otpExpiresIn > 540 && (
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                  Wait {Math.ceil((otpExpiresIn - 540) / 60)} min before resending
                </Typography>
              )}
            </Box>

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Button
                variant="text"
                size="small"
                onClick={() => {
                  setOtpStep("form");
                  setOtpCode("");
                  setOtpSent(false);
                }}
                sx={{ textTransform: "none" }}
              >
                ← Back to form
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100%",
      }}
    >
      <Card
        elevation={0}
        sx={{
          maxWidth: 520,
          width: "100%",
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
          border: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        <Box
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            p: 4,
            textAlign: "center",
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            fontWeight={700}
            gutterBottom
            sx={{ letterSpacing: "-0.5px" }}
          >
            Get Started
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
            Create your company and admin account
          </Typography>
        </Box>

        <CardContent sx={{ p: 4 }}>
          {error && (
            <Fade in={!!error}>
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            </Fade>
          )}

          <Box component="form" onSubmit={handleSubmit(handleSendOTP)}>
            <TextField
              {...register("name")}
              fullWidth
              label="Full Name"
              autoComplete="name"
              error={!!formState.errors.name}
              helperText={formState.errors.name?.message}
              sx={{ mb: 2.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              {...register("email")}
              fullWidth
              label="Email Address"
                      type="email"
                      autoComplete="email"
              error={!!formState.errors.email}
              helperText={formState.errors.email?.message}
              sx={{ mb: 2.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: "text.secondary", fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              {...register("companyName")}
              fullWidth
              label="Company Name"
              error={!!formState.errors.companyName}
              helperText={
                formState.errors.companyName?.message ||
                "Enter your company name"
              }
              sx={{ mb: 2.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BusinessCenter
                      sx={{ color: "text.secondary", fontSize: 20 }}
                    />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              {...register("password")}
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
              error={!!formState.errors.password}
              helperText={
                formState.errors.password?.message || "Minimum 8 characters"
              }
              sx={{ mb: 2.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: "text.secondary", fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              {...register("confirmPassword")}
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
              error={!!formState.errors.confirmPassword}
              helperText={formState.errors.confirmPassword?.message}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: "text.secondary", fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      size="small"
                    >
                      {showConfirmPassword ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={sendingOTP}
                endIcon={!sendingOTP && <Send />}
                sx={{
                  py: 1.5,
                  mb: 3,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  fontSize: "1rem",
                  fontWeight: 600,
                  textTransform: "none",
                  boxShadow: "0 4px 14px rgba(102, 126, 234, 0.4)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                    boxShadow: "0 6px 20px rgba(102, 126, 234, 0.5)",
                  },
                }}
              >
                {sendingOTP ? (
                  <CircularProgress size={24} sx={{ color: "white" }} />
                ) : (
                  "Send Verification Code"
                )}
              </Button>

            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
              Already have an account?{" "}
                <Button
                  variant="text"
                  size="small"
                  onClick={() => router.push("/login")}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    color: "primary.main",
                    "&:hover": {
                      bgcolor: "transparent",
                      textDecoration: "underline",
                    },
                  }}
                >
                  Sign in
                </Button>
              </Typography>
            </Box>
          </Box>
      </CardContent>
    </Card>
    </Box>
  );
}
