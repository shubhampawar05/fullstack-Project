/**
 * Attendance Dashboard Component - TalentHR
 * Soft Claymorphism Design
 */

"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Avatar,
} from "@mui/material";
import {
  AccessTime,
  EventAvailable,
  EventBusy,
  Timer,
  History,
  MoreVert,
  PlayArrow,
  Stop,
  Pause,
} from "@mui/icons-material";
import ClayCard from "@/components/ui/clay-card";
import ClayButton from "@/components/ui/clay-button";

export default function AttendanceDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [status, setStatus] = useState<"clocked-in" | "clocked-out" | "break">("clocked-out");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box>
      {/* Header & Clock In Widget */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <ClayCard
            sx={{
              p: 4,
              background: "linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)",
              color: "white",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: "rgba(255,255,255,0.2)", borderRadius: 3 }}>
                <AccessTime sx={{ fontSize: 32 }} />
              </Box>
              <Typography variant="h4" fontWeight={800}>
                Attendance
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
              Track your work hours, manage leave requests, and view attendance history.
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <ClayButton
                variant="contained"
                sx={{ bgcolor: "white", color: "primary.main", "&:hover": { bgcolor: "#f0f4f8" } }}
              >
                Request Leave
              </ClayButton>
              <ClayButton
                variant="outlined"
                sx={{ borderColor: "rgba(255,255,255,0.5)", color: "white", "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" } }}
              >
                View Calendar
              </ClayButton>
            </Box>
          </ClayCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <ClayCard sx={{ p: 4, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <Typography variant="h3" fontWeight={800} sx={{ mb: 1, fontFamily: "monospace" }}>
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {currentTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
            
            {status === "clocked-out" ? (
              <ClayButton
                variant="contained"
                size="large"
                startIcon={<PlayArrow />}
                onClick={() => setStatus("clocked-in")}
                sx={{ 
                  bgcolor: "success.main", 
                  "&:hover": { bgcolor: "success.dark" },
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem"
                }}
              >
                Clock In
              </ClayButton>
            ) : status === "clocked-in" ? (
              <Stack direction="row" spacing={2}>
                <ClayButton
                  variant="contained"
                  startIcon={<Pause />}
                  onClick={() => setStatus("break")}
                  sx={{ bgcolor: "warning.main", "&:hover": { bgcolor: "warning.dark" } }}
                >
                  Break
                </ClayButton>
                <ClayButton
                  variant="contained"
                  startIcon={<Stop />}
                  onClick={() => setStatus("clocked-out")}
                  sx={{ bgcolor: "error.main", "&:hover": { bgcolor: "error.dark" } }}
                >
                  Clock Out
                </ClayButton>
              </Stack>
            ) : (
              <ClayButton
                variant="contained"
                startIcon={<PlayArrow />}
                onClick={() => setStatus("clocked-in")}
                sx={{ bgcolor: "success.main", "&:hover": { bgcolor: "success.dark" } }}
              >
                Resume Work
              </ClayButton>
            )}
          </ClayCard>
        </Grid>
      </Grid>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: "Working Days", value: "22", sub: "This Month", icon: <EventAvailable />, color: "#6c5ce7" },
          { title: "Absent Days", value: "1", sub: "This Month", icon: <EventBusy />, color: "#ff7675" },
          { title: "Overtime", value: "4h 30m", sub: "This Month", icon: <Timer />, color: "#fdcb6e" },
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

      {/* Recent Activity */}
      <ClayCard sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h6" fontWeight={700}>
            Recent Activity
          </Typography>
          <ClayButton variant="text" size="small">View Full History</ClayButton>
        </Box>
        <Stack spacing={2}>
          {[
            { action: "Clocked Out", time: "Yesterday, 6:00 PM", status: "On Time", color: "success" },
            { action: "Clocked In", time: "Yesterday, 9:00 AM", status: "On Time", color: "success" },
            { action: "Clocked Out", time: "Oct 26, 6:15 PM", status: "Overtime", color: "warning" },
            { action: "Clocked In", time: "Oct 26, 9:05 AM", status: "Late", color: "error" },
          ].map((item, idx) => (
            <Box
              key={idx}
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: "#f8faff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ bgcolor: "white", color: "primary.main", boxShadow: "2px 2px 4px rgba(0,0,0,0.1)" }}>
                  <History fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {item.action}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.time}
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={item.status}
                size="small"
                color={item.color as any}
                sx={{ fontWeight: 700, borderRadius: 2 }}
              />
            </Box>
          ))}
        </Stack>
      </ClayCard>
    </Box>
  );
}
