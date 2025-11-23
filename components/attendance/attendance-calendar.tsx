/**
 * Attendance Calendar Component - Premium UI
 * Features: Monthly view, status indicators, tooltips, filters
 */

"use client";

import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Grid,
  Tooltip,
  Button,
  ButtonGroup,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Cancel,
  Schedule,
  EventBusy,
  Today,
} from "@mui/icons-material";

interface AttendanceDay {
  date: Date;
  status: "present" | "absent" | "late" | "half-day" | "leave" | "holiday" | "weekend";
  clockIn?: string;
  clockOut?: string;
  workHours?: number;
}

interface AttendanceCalendarProps {
  attendanceData?: AttendanceDay[];
  onDateClick?: (date: Date) => void;
}

export default function AttendanceCalendar({
  attendanceData = [],
  onDateClick,
}: AttendanceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");

  const getStatusColor = (status: AttendanceDay["status"]) => {
    const colors = {
      present: "#10b981",
      absent: "#ef4444",
      late: "#f59e0b",
      "half-day": "#3b82f6",
      leave: "#8b5cf6",
      holiday: "#ec4899",
      weekend: "#6b7280",
    };
    return colors[status];
  };

  const getStatusIcon = (status: AttendanceDay["status"]) => {
    const icons = {
      present: <CheckCircle sx={{ fontSize: 16 }} />,
      absent: <Cancel sx={{ fontSize: 16 }} />,
      late: <Schedule sx={{ fontSize: 16 }} />,
      "half-day": <Schedule sx={{ fontSize: 16 }} />,
      leave: <EventBusy sx={{ fontSize: 16 }} />,
      holiday: <EventBusy sx={{ fontSize: 16 }} />,
      weekend: <EventBusy sx={{ fontSize: 16 }} />,
    };
    return icons[status];
  };

  const getStatusLabel = (status: AttendanceDay["status"]) => {
    const labels = {
      present: "Present",
      absent: "Absent",
      late: "Late",
      "half-day": "Half Day",
      leave: "On Leave",
      holiday: "Holiday",
      weekend: "Weekend",
    };
    return labels[status];
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getAttendanceForDate = (date: Date | null): AttendanceDay | null => {
    if (!date) return null;
    return (
      attendanceData.find(
        (a) =>
          a.date.getDate() === date.getDate() &&
          a.date.getMonth() === date.getMonth() &&
          a.date.getFullYear() === date.getFullYear()
      ) || null
    );
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Calculate stats
  const currentMonthData = attendanceData.filter(
    (a) =>
      a.date.getMonth() === currentDate.getMonth() &&
      a.date.getFullYear() === currentDate.getFullYear()
  );
  const presentDays = currentMonthData.filter((a) => a.status === "present").length;
  const absentDays = currentMonthData.filter((a) => a.status === "absent").length;
  const lateDays = currentMonthData.filter((a) => a.status === "late").length;
  const leaveDays = currentMonthData.filter((a) => a.status === "leave").length;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        border: "1px solid rgba(255,255,255,0.6)",
        background: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(12px)",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Attendance Calendar
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Track your attendance and work hours
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Today />}
            onClick={handleToday}
            sx={{ borderRadius: 2 }}
          >
            Today
          </Button>
        </Box>

        {/* Stats Summary */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: "Present", value: presentDays, color: "#10b981", icon: <CheckCircle /> },
            { label: "Absent", value: absentDays, color: "#ef4444", icon: <Cancel /> },
            { label: "Late", value: lateDays, color: "#f59e0b", icon: <Schedule /> },
            { label: "Leave", value: leaveDays, color: "#8b5cf6", icon: <EventBusy /> },
          ].map((stat, idx) => (
            <Grid item xs={6} sm={3} key={idx}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}25 100%)`,
                  border: `1px solid ${stat.color}30`,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {stat.label}
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700} sx={{ color: stat.color }}>
                  {stat.value}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Month Navigation */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <IconButton
            onClick={handlePrevMonth}
            sx={{
              bgcolor: "rgba(102, 126, 234, 0.1)",
              "&:hover": { bgcolor: "rgba(102, 126, 234, 0.2)" },
            }}
          >
            <ChevronLeft />
          </IconButton>
          <Typography variant="h6" fontWeight={700}>
            {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </Typography>
          <IconButton
            onClick={handleNextMonth}
            sx={{
              bgcolor: "rgba(102, 126, 234, 0.1)",
              "&:hover": { bgcolor: "rgba(102, 126, 234, 0.2)" },
            }}
          >
            <ChevronRight />
          </IconButton>
        </Box>

        {/* Calendar Grid */}
        <Box>
          {/* Week Day Headers */}
          <Grid container spacing={1} sx={{ mb: 1 }}>
            {weekDays.map((day) => (
              <Grid item xs={12 / 7} key={day}>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="text.secondary"
                  sx={{ display: "block", textAlign: "center" }}
                >
                  {day}
                </Typography>
              </Grid>
            ))}
          </Grid>

          {/* Calendar Days */}
          <Grid container spacing={1}>
            {days.map((date, idx) => {
              const attendance = getAttendanceForDate(date);
              const isToday =
                date &&
                date.getDate() === new Date().getDate() &&
                date.getMonth() === new Date().getMonth() &&
                date.getFullYear() === new Date().getFullYear();

              return (
                <Grid item xs={12 / 7} key={idx}>
                  {date ? (
                    <Tooltip
                      title={
                        attendance ? (
                          <Box>
                            <Typography variant="caption" fontWeight={600}>
                              {getStatusLabel(attendance.status)}
                            </Typography>
                            {attendance.clockIn && (
                              <Typography variant="caption" display="block">
                                In: {attendance.clockIn}
                              </Typography>
                            )}
                            {attendance.clockOut && (
                              <Typography variant="caption" display="block">
                                Out: {attendance.clockOut}
                              </Typography>
                            )}
                            {attendance.workHours && (
                              <Typography variant="caption" display="block">
                                Hours: {attendance.workHours}h
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          "No data"
                        )
                      }
                      arrow
                    >
                      <Box
                        onClick={() => onDateClick?.(date)}
                        sx={{
                          aspectRatio: "1",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 2,
                          cursor: "pointer",
                          border: isToday ? "2px solid #667eea" : "1px solid transparent",
                          bgcolor: attendance
                            ? `${getStatusColor(attendance.status)}15`
                            : "transparent",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            bgcolor: attendance
                              ? `${getStatusColor(attendance.status)}25`
                              : "rgba(0,0,0,0.05)",
                            transform: "scale(1.05)",
                          },
                        }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={isToday ? 700 : 600}
                          sx={{
                            color: attendance ? getStatusColor(attendance.status) : "text.primary",
                          }}
                        >
                          {date.getDate()}
                        </Typography>
                        {attendance && (
                          <Box sx={{ color: getStatusColor(attendance.status), mt: 0.5 }}>
                            {getStatusIcon(attendance.status)}
                          </Box>
                        )}
                      </Box>
                    </Tooltip>
                  ) : (
                    <Box sx={{ aspectRatio: "1" }} />
                  )}
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* Legend */}
        <Box sx={{ mt: 3, pt: 3, borderTop: "1px solid rgba(0,0,0,0.08)" }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600} gutterBottom>
            Legend
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
            {[
              "present",
              "absent",
              "late",
              "half-day",
              "leave",
              "holiday",
              "weekend",
            ].map((status) => (
              <Chip
                key={status}
                icon={getStatusIcon(status as AttendanceDay["status"])}
                label={getStatusLabel(status as AttendanceDay["status"])}
                size="small"
                sx={{
                  bgcolor: `${getStatusColor(status as AttendanceDay["status"])}15`,
                  color: getStatusColor(status as AttendanceDay["status"]),
                  fontWeight: 600,
                  "& .MuiChip-icon": {
                    color: getStatusColor(status as AttendanceDay["status"]),
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
