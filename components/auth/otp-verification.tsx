/**
 * OTP Verification Component
 * Features: 6-digit input, countdown timer, resend
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { Box, Typography, Button, TextField } from "@mui/material";
import { Refresh } from "@mui/icons-material";

interface OTPVerificationProps {
  onVerify: (otp: string) => void;
  onResend: () => void;
  email?: string;
}

export default function OTPVerification({ onVerify, onResend, email }: OTPVerificationProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (newOtp.every((digit) => digit !== "") && index === 5) {
      onVerify(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split("").concat(Array(6).fill("")).slice(0, 6);
    setOtp(newOtp);

    if (newOtp.every((digit) => digit !== "")) {
      onVerify(newOtp.join(""));
    }
  };

  const handleResend = () => {
    setTimer(60);
    setCanResend(false);
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
    onResend();
  };

  return (
    <Box>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Verify Your Email
        </Typography>
        <Typography variant="body2" color="text.secondary">
          We've sent a 6-digit code to
        </Typography>
        <Typography variant="body2" fontWeight={600} color="primary">
          {email || "your email"}
        </Typography>
      </Box>

      {/* OTP Input */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          justifyContent: "center",
          mb: 3,
        }}
        onPaste={handlePaste}
      >
        {otp.map((digit, index) => (
          <TextField
            key={index}
            inputRef={(el) => (inputRefs.current[index] = el)}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            inputProps={{
              maxLength: 1,
              style: {
                textAlign: "center",
                fontSize: "1.5rem",
                fontWeight: 700,
              },
            }}
            sx={{
              width: 56,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&.Mui-focused": {
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#667eea",
                    borderWidth: 2,
                  },
                },
              },
            }}
          />
        ))}
      </Box>

      {/* Timer & Resend */}
      <Box sx={{ textAlign: "center", mb: 3 }}>
        {!canResend ? (
          <Typography variant="body2" color="text.secondary">
            Resend code in{" "}
            <Typography component="span" fontWeight={700} color="primary">
              {timer}s
            </Typography>
          </Typography>
        ) : (
          <Button
            startIcon={<Refresh />}
            onClick={handleResend}
            sx={{
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Resend Code
          </Button>
        )}
      </Box>

      {/* Verify Button */}
      <Button
        fullWidth
        variant="contained"
        size="large"
        onClick={() => onVerify(otp.join(""))}
        disabled={otp.some((digit) => digit === "")}
        sx={{
          borderRadius: 2,
          py: 1.5,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
          fontWeight: 600,
        }}
      >
        Verify Code
      </Button>
    </Box>
  );
}
