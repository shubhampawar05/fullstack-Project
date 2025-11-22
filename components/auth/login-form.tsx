/**
 * Login Form Component - TalentHR
 * Modern, beautiful login form with role selection
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Paper,
  Fade,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Business,
  Person,
  Email,
  Lock,
  ArrowForward,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoginCredentials, UserRole } from "@/types/auth";

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
  role: z.enum([
    "company_admin",
    "hr_manager",
    "recruiter",
    "manager",
    "employee",
  ]),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      role: "company_admin",
    },
  });

  const selectedRole = watch("role");

  const handleRoleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newRole: UserRole | null
  ) => {
    if (newRole !== null) {
      setValue("role", newRole);
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || "Login failed. Please try again.");
        setLoading(false);
        return;
      }

      // Redirect based on role
      let dashboardPath = "/dashboard/employee";
      if (data.role === "company_admin") dashboardPath = "/dashboard/admin";
      else if (data.role === "hr_manager") dashboardPath = "/dashboard/hr";
      else if (data.role === "recruiter")
        dashboardPath = "/dashboard/recruiter";
      else if (data.role === "manager") dashboardPath = "/dashboard/manager";

      router.push(dashboardPath);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

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
          maxWidth: 480,
          width: "100%",
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
          border: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        {/* Header with gradient */}
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
            Welcome Back
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
            Sign in to continue to TalentHR
          </Typography>
        </Box>

        <CardContent sx={{ p: 4 }}>
          {error && (
            <Fade in={!!error}>
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  "& .MuiAlert-icon": {
                    alignItems: "center",
                  },
                }}
              >
                {error}
              </Alert>
            </Fade>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {/* Role Selection */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="body2"
                fontWeight={600}
                color="text.secondary"
                sx={{ mb: 1.5, fontSize: "0.875rem" }}
              >
                I am a
              </Typography>
              <ToggleButtonGroup
                value={selectedRole}
                exclusive
                onChange={handleRoleChange}
                fullWidth
                sx={{
                  "& .MuiToggleButton-root": {
                    py: 1.5,
                    px: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    textTransform: "none",
                    fontWeight: 500,
                    "&.Mui-selected": {
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      borderColor: "transparent",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        opacity: 0.9,
                      },
                    },
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  },
                }}
              >
                <ToggleButton value="company_admin">
                  <Business sx={{ mr: 1, fontSize: 20 }} />
                  Company Admin
                </ToggleButton>
                <ToggleButton value="hr_manager">
                  <Person sx={{ mr: 1, fontSize: 20 }} />
                  HR Manager
                </ToggleButton>
                <ToggleButton value="recruiter">
                  <Person sx={{ mr: 1, fontSize: 20 }} />
                  Recruiter
                </ToggleButton>
                <ToggleButton value="manager">
                  <Person sx={{ mr: 1, fontSize: 20 }} />
                  Manager
                </ToggleButton>
                <ToggleButton value="employee">
                  <Person sx={{ mr: 1, fontSize: 20 }} />
                  Employee
                </ToggleButton>
              </ToggleButtonGroup>
              <input type="hidden" {...register("role")} />
            </Box>

            {/* Email Field */}
            <TextField
              {...register("email")}
              fullWidth
              label="Email Address"
              type="email"
              autoComplete="email"
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{ mb: 2.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: "text.secondary", fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />

            {/* Password Field */}
            <TextField
              {...register("password")}
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              error={!!errors.password}
              helperText={errors.password?.message}
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

            {/* Submit Button */}
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
                "&:disabled": {
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : (
                "Sign In"
              )}
            </Button>

            {/* Sign Up Link */}
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Don&apos;t have an account?{" "}
                <Button
                  variant="text"
                  size="small"
                  onClick={() => router.push("/signup")}
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
                  Sign up
                </Button>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
