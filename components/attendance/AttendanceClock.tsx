"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Stack,
  Chip,
} from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useAuth } from "@/contexts/auth-context";

interface AttendanceClockProps {
  onStatusChange?: () => void;
}

export default function AttendanceClock({ onStatusChange }: AttendanceClockProps) {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [todayRecord, setTodayRecord] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch today's attendance status
  const fetchTodayStatus = async () => {
    try {
      const today = new Date();
      const startDate = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endDate = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      const res = await fetch(
        `/api/attendance?startDate=${startDate}&endDate=${endDate}&employeeId=${user?.employeeId}`,
        {
            // We need to handle the case where we might not have the employeeId in the user object directly
            // if the user object structure is different. 
            // However, the API handles "my attendance" if no employeeId is passed for employees.
            // But for managers/admins, we want to see THEIR attendance here, not list of others.
            // The API GET /api/attendance logic:
            // - Employee: sees own.
            // - Manager: sees team + self. If employeeId param is missing, lists all.
            // So we should probably filter by "my own" explicitly if we are a manager, 
            // OR the API should have a "me" endpoint or flag.
            // Let's rely on the fact that the list endpoint returns an array. 
            // We'll filter client side or just take the first one if it matches today.
        }
      );
      
      // Actually, let's just call the list endpoint and filter for today's record for the current user.
      // Since the API for managers returns a list, we need to be careful.
      // A better approach for the "Clock" widget is to have a specific endpoint or just filter the list.
      // Let's try to fetch with employeeId if we have it, otherwise just fetch and find ours.
      
      const res2 = await fetch(`/api/attendance?startDate=${startDate}&endDate=${endDate}`);
      const data = await res2.json();
      
      if (data.success && data.data.length > 0) {
        // Find record for current user
        // The API returns populated employeeId, which has userId inside.
        const myRecord = data.data.find((record: any) => 
            record.employeeId?.userId?._id === user?._id || 
            record.employeeId?.userId === user?._id
        );
        setTodayRecord(myRecord || null);
      } else {
        setTodayRecord(null);
      }
    } catch (err) {
      console.error("Failed to fetch attendance status", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTodayStatus();
    }
  }, [user]);

  const handleClockIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/attendance/clock-in", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setTodayRecord(data.data);
        if (onStatusChange) onStatusChange();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to clock in");
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/attendance/clock-out", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setTodayRecord(data.data);
        if (onStatusChange) onStatusChange();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to clock out");
    } finally {
      setLoading(false);
    }
  };

  const getWorkDuration = () => {
    if (!todayRecord?.clockIn) return "0h 0m";
    
    const start = new Date(todayRecord.clockIn).getTime();
    const end = todayRecord.clockOut 
      ? new Date(todayRecord.clockOut).getTime() 
      : currentTime.getTime();
      
    const diffMinutes = Math.floor((end - start) / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        position: "relative",
        overflow: "visible",
        borderRadius: 4,
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        border: "1px solid rgba(255,255,255,0.5)",
        background: "rgba(255, 255, 255, 0.6)",
        backdropFilter: "blur(12px)",
      }}
    >
      <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, py: 4 }}>
        <Box sx={{ position: "relative", display: "inline-flex" }}>
          <CircularProgress
            variant="determinate"
            value={100}
            size={180}
            thickness={2}
            sx={{ color: "grey.200" }}
          />
          <CircularProgress
            variant="determinate"
            value={todayRecord?.clockIn ? (todayRecord.clockOut ? 100 : 75) : 0} // visual indicator
            size={180}
            thickness={2}
            sx={{ 
                color: todayRecord?.clockOut ? "success.main" : "primary.main",
                position: "absolute",
                left: 0,
            }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: "absolute",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <Typography variant="h4" component="div" fontWeight="bold" color="text.primary">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </Typography>
          </Box>
        </Box>

        <Stack spacing={1} alignItems="center">
          <Typography variant="h6" color="text.secondary">
            {todayRecord?.clockIn ? (todayRecord.clockOut ? "Shift Completed" : "Currently Working") : "Not Clocked In"}
          </Typography>
          
          {todayRecord?.clockIn && (
            <Chip 
                label={`Duration: ${getWorkDuration()}`} 
                color={todayRecord.clockOut ? "success" : "primary"} 
                variant="outlined" 
                icon={<AccessTimeIcon />}
            />
          )}
        </Stack>

        {error && (
            <Typography color="error" variant="body2">
                {error}
            </Typography>
        )}

        <Box>
          {!todayRecord ? (
            <Button
              variant="contained"
              size="large"
              startIcon={<LoginIcon />}
              onClick={handleClockIn}
              disabled={loading}
              sx={{ 
                px: 4, 
                py: 1.5, 
                borderRadius: 2,
                background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
              }}
            >
              {loading ? "Clocking In..." : "Clock In"}
            </Button>
          ) : !todayRecord.clockOut ? (
            <Button
              variant="contained"
              color="error"
              size="large"
              startIcon={<LogoutIcon />}
              onClick={handleClockOut}
              disabled={loading}
              sx={{ px: 4, py: 1.5, borderRadius: 2 }}
            >
              {loading ? "Clocking Out..." : "Clock Out"}
            </Button>
          ) : (
            <Button
              variant="outlined"
              size="large"
              disabled
              sx={{ px: 4, py: 1.5, borderRadius: 2 }}
            >
              Completed for Today
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
