/**
 * Attendance Clock Widget - TalentHR
 * Large button for clock in/out with status display
 */

"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import {
  AccessTime,
  CheckCircle,
  Schedule,
} from "@mui/icons-material";

interface AttendanceClockProps {
  onClockAction?: () => void;
}

export default function AttendanceClock({ onClockAction }: AttendanceClockProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch today's attendance on mount
  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await fetch(
        `/api/attendance?startDate=${today}&endDate=${today}`,
        { credentials: "include" }
      );
      const data = await response.json();
      if (data.success && data.attendance.length > 0) {
        setTodayAttendance(data.attendance[0]);
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };

  const handleClockAction = async (action: "clock-in" | "clock-out") => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message);
        setLoading(false);
        return;
      }

      setSuccess(
        action === "clock-in"
          ? "Clocked in successfully!"
          : "Clocked out successfully!"
      );
      await fetchTodayAttendance();
      onClockAction?.();
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isClockedIn = todayAttendance && !todayAttendance.clockOut;
  const isClockedOut = todayAttendance && todayAttendance.clockOut;

  return (
    <Paper sx={{ p: 4, textAlign: "center" }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          {currentTime.toLocaleTimeString()}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {currentTime.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {todayAttendance && (
        <Box sx={{ mb: 3 }}>
          <Chip
            icon={isClockedOut ? <CheckCircle /> : <Schedule />}
            label={
              isClockedOut
                ? `Clocked Out at ${new Date(
                    todayAttendance.clockOut
                  ).toLocaleTimeString()}`
                : `Clocked In at ${new Date(
                    todayAttendance.clockIn
                  ).toLocaleTimeString()}`
            }
            color={isClockedOut ? "success" : "primary"}
            sx={{ fontSize: "1rem", py: 2, px: 1 }}
          />
          {isClockedOut && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Work Hours: {todayAttendance.workHours} hours
            </Typography>
          )}
        </Box>
      )}

      <Button
        variant="contained"
        size="large"
        disabled={loading || isClockedOut}
        onClick={() =>
          handleClockAction(isClockedIn ? "clock-out" : "clock-in")
        }
        startIcon={
          loading ? (
            <CircularProgress size={20} />
          ) : (
            <AccessTime />
          )
        }
        sx={{
          py: 2,
          px: 4,
          fontSize: "1.2rem",
          background: isClockedIn
            ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          "&:hover": {
            background: isClockedIn
              ? "linear-gradient(135deg, #e082ea 0%, #e4465b 100%)"
              : "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
          },
          "&:disabled": {
            background: "#ccc",
          },
        }}
      >
        {loading
          ? "Processing..."
          : isClockedOut
          ? "Already Clocked Out"
          : isClockedIn
          ? "Clock Out"
          : "Clock In"}
      </Button>

      {isClockedOut && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
          You have completed your work for today. See you tomorrow!
        </Typography>
      )}
    </Paper>
  );
}
