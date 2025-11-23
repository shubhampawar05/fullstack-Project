/**
 * Quick Actions Widget
 * Features: Common actions for dashboard
 */

"use client";

import { Box, Card, CardContent, Typography, Grid, Button } from "@mui/material";
import {
  AccessTime,
  EventNote,
  AttachMoney,
  Description,
  MeetingRoom,
  HelpOutline,
} from "@mui/icons-material";

const actions = [
  { icon: <AccessTime />, label: "Clock In/Out", color: "#667eea", action: "clock" },
  { icon: <EventNote />, label: "Request Leave", color: "#f59e0b", action: "leave" },
  { icon: <AttachMoney />, label: "Submit Expense", color: "#10b981", action: "expense" },
  { icon: <Description />, label: "View Payslip", color: "#8b5cf6", action: "payslip" },
  { icon: <MeetingRoom />, label: "Book Room", color: "#3b82f6", action: "room" },
  { icon: <HelpOutline />, label: "Raise Ticket", color: "#ec4899", action: "ticket" },
];

export default function QuickActions() {
  const handleAction = (action: string) => {
    console.log("Action:", action);
  };

  return (
    <Card elevation={0} sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)" }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {actions.map((item, idx) => (
            <Grid item xs={6} sm={4} key={idx}>
              <Button
                fullWidth
                onClick={() => handleAction(item.action)}
                sx={{
                  flexDirection: "column",
                  gap: 1,
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid rgba(0,0,0,0.08)",
                  bgcolor: "white",
                  color: "text.primary",
                  "&:hover": {
                    bgcolor: `${item.color}10`,
                    borderColor: item.color,
                  },
                }}
              >
                <Box sx={{ color: item.color }}>{item.icon}</Box>
                <Typography variant="caption" fontWeight={600} textAlign="center">
                  {item.label}
                </Typography>
              </Button>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
