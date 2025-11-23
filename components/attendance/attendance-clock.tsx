/**
 * Attendance Clock Widget - Premium UI Component
 * Features: Clock in/out, real-time status, location tracking, animations
 */

"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  AccessTime,
  LocationOn,
  CheckCircle,
  Cancel,
  TrendingUp,
  Coffee,
  PlayArrow,
  Stop,
} from "@mui/icons-material";

interface AttendanceClockProps {
  employeeName?: string;
  employeeAvatar?: string;
  onClockIn?: (location: string) => void;
  onClockOut?: () => void;
  onBreakStart?: () => void;
  onBreakEnd?: () => void;
}

export default function AttendanceClock({
  employeeName = "John Doe",
  employeeAvatar,
  onClockIn,
  onClockOut,
  onBreakStart,
  onBreakEnd,
}: AttendanceClockProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [breakStartTime, setBreakStartTime] = useState<Date | null>(null);
  const [workDuration, setWorkDuration] = useState(0);
  const [breakDuration, setBreakDuration] = useState(0);
  const [location, setLocation] = useState("Mumbai, India");

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate work duration
  useEffect(() => {
    if (isClockedIn && clockInTime) {
      const timer = setInterval(() => {
        const duration = Math.floor((Date.now() - clockInTime.getTime()) / 1000);
        setWorkDuration(duration);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isClockedIn, clockInTime]);

  // Calculate break duration
  useEffect(() => {
    if (isOnBreak && breakStartTime) {
      const timer = setInterval(() => {
        const duration = Math.floor((Date.now() - breakStartTime.getTime()) / 1000);
        setBreakDuration(duration);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOnBreak, breakStartTime]);

  const handleClockIn = () => {
    setIsClockedIn(true);
    setClockInTime(new Date());
    onClockIn?.(location);
  };

  const handleClockOut = () => {
    setIsClockedIn(false);
    setIsOnBreak(false);
    setClockInTime(null);
    setWorkDuration(0);
    setBreakDuration(0);
    onClockOut?.();
  };

  const handleBreakStart = () => {
    setIsOnBreak(true);
    setBreakStartTime(new Date());
    onBreakStart?.();
  };

  const handleBreakEnd = () => {
    setIsOnBreak(false);
    setBreakStartTime(null);
    setBreakDuration(0);
    onBreakEnd?.();
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const getStatusColor = () => {
    if (isOnBreak) return "#f59e0b";
    if (isClockedIn) return "#10b981";
    return "#6b7280";
  };

  const getStatusText = () => {
    if (isOnBreak) return "On Break";
    if (isClockedIn) return "Clocked In";
    return "Not Clocked In";
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 5,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(118, 75, 162, 0.4)",
      }}
    >
      {/* Animated background circles */}
      <Box
        sx={{
          position: "absolute",
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
          animation: "pulse 3s ease-in-out infinite",
          "@keyframes pulse": {
            "0%, 100%": { transform: "scale(1)", opacity: 0.5 },
            "50%": { transform: "scale(1.1)", opacity: 0.8 },
          },
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -80,
          left: -80,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
          animation: "pulse 4s ease-in-out infinite 1s",
        }}
      />

      <CardContent sx={{ p: 4, position: "relative", zIndex: 1 }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              src={employeeAvatar}
              sx={{
                width: 64,
                height: 64,
                border: "4px solid rgba(255,255,255,0.3)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
              }}
            >
              {employeeName.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                {employeeName}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                <LocationOn sx={{ fontSize: 16, opacity: 0.9 }} />
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  {location}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Chip
            label={getStatusText()}
            sx={{
              bgcolor: "rgba(255,255,255,0.25)",
              color: "white",
              fontWeight: 600,
              backdropFilter: "blur(10px)",
              border: `2px solid ${getStatusColor()}`,
              boxShadow: `0 0 20px ${getStatusColor()}50`,
            }}
          />
        </Box>

        {/* Current Time Display */}
        <Box
          sx={{
            textAlign: "center",
            mb: 4,
            p: 3,
            borderRadius: 4,
            bgcolor: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Typography variant="caption" sx={{ opacity: 0.9, display: "block", mb: 1 }}>
            Current Time
          </Typography>
          <Typography variant="h2" fontWeight={700} sx={{ letterSpacing: "2px" }}>
            {formatTime(currentTime)}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
            {currentTime.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Typography>
        </Box>

        {/* Work Duration */}
        {isClockedIn && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Work Duration
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {formatDuration(workDuration)}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min((workDuration / (8 * 3600)) * 100, 100)}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: "rgba(255,255,255,0.2)",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 4,
                  bgcolor: "#10b981",
                  boxShadow: "0 0 10px #10b981",
                },
              }}
            />
            <Typography variant="caption" sx={{ opacity: 0.8, display: "block", mt: 0.5 }}>
              Target: 8 hours
            </Typography>
          </Box>
        )}

        {/* Break Duration */}
        {isOnBreak && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Break Duration
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {formatDuration(breakDuration)}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min((breakDuration / 3600) * 100, 100)}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: "rgba(255,255,255,0.2)",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 4,
                  bgcolor: "#f59e0b",
                  boxShadow: "0 0 10px #f59e0b",
                },
              }}
            />
            <Typography variant="caption" sx={{ opacity: 0.8, display: "block", mt: 0.5 }}>
              Max: 1 hour
            </Typography>
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: "flex", gap: 2, flexDirection: "column" }}>
          {!isClockedIn ? (
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleClockIn}
              startIcon={<PlayArrow />}
              sx={{
                py: 2,
                borderRadius: 3,
                bgcolor: "white",
                color: "#667eea",
                fontWeight: 700,
                fontSize: "1.1rem",
                boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.95)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 12px 32px rgba(0,0,0,0.3)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Clock In
            </Button>
          ) : (
            <>
              <Box sx={{ display: "flex", gap: 2 }}>
                {!isOnBreak ? (
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handleBreakStart}
                    startIcon={<Coffee />}
                    sx={{
                      py: 1.5,
                      borderRadius: 3,
                      bgcolor: "rgba(255,255,255,0.25)",
                      color: "white",
                      fontWeight: 600,
                      backdropFilter: "blur(10px)",
                      border: "2px solid rgba(255,255,255,0.3)",
                      "&:hover": {
                        bgcolor: "rgba(255,255,255,0.35)",
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    Start Break
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handleBreakEnd}
                    startIcon={<PlayArrow />}
                    sx={{
                      py: 1.5,
                      borderRadius: 3,
                      bgcolor: "#f59e0b",
                      color: "white",
                      fontWeight: 600,
                      boxShadow: "0 0 20px #f59e0b50",
                      "&:hover": {
                        bgcolor: "#d97706",
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    End Break
                  </Button>
                )}
              </Box>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleClockOut}
                startIcon={<Stop />}
                sx={{
                  py: 2,
                  borderRadius: 3,
                  bgcolor: "white",
                  color: "#ef4444",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.95)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 12px 32px rgba(0,0,0,0.3)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Clock Out
              </Button>
            </>
          )}
        </Box>

        {/* Clock In Time */}
        {isClockedIn && clockInTime && (
          <Box
            sx={{
              mt: 3,
              p: 2,
              borderRadius: 3,
              bgcolor: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Clocked in at
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {formatTime(clockInTime)}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
