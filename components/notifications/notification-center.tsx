/**
 * Notification Center - Dropdown Component
 * Features: Unread count, notification list, mark as read, delete
 */

"use client";

import { useState } from "react";
import {
  Box,
  IconButton,
  Badge,
  Popover,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Button,
  Chip,
} from "@mui/material";
import {
  Notifications,
  Circle,
  CheckCircle,
  Work,
  CalendarToday,
  People,
  AttachMoney,
  Close,
} from "@mui/icons-material";

interface Notification {
  id: string;
  type: "leave" | "interview" | "employee" | "payroll" | "general";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const dummyNotifications: Notification[] = [
  { id: "1", type: "leave", title: "Leave Request", message: "Rajesh Kumar requested 2 days leave", timestamp: "2 hours ago", read: false },
  { id: "2", type: "interview", title: "Interview Scheduled", message: "Interview with Anita Desai at 2:00 PM", timestamp: "4 hours ago", read: false },
  { id: "3", type: "employee", title: "New Employee", message: "Priya Sharma joined as Senior Developer", timestamp: "1 day ago", read: true },
  { id: "4", type: "payroll", title: "Payroll Processed", message: "November payroll has been processed", timestamp: "2 days ago", read: true },
];

export default function NotificationCenter() {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [notifications, setNotifications] = useState(dummyNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: Notification["type"]) => {
    const icons = {
      leave: <CalendarToday sx={{ color: "#f59e0b" }} />,
      interview: <Work sx={{ color: "#667eea" }} />,
      employee: <People sx={{ color: "#10b981" }} />,
      payroll: <AttachMoney sx={{ color: "#8b5cf6" }} />,
      general: <Notifications sx={{ color: "#6b7280" }} />,
    };
    return icons[type];
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
        <Badge badgeContent={unreadCount} color="error">
          <Notifications />
        </Badge>
      </IconButton>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 600,
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            mt: 1,
          },
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography variant="h6" fontWeight={700}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Chip label={`${unreadCount} new`} size="small" color="primary" />
            )}
          </Box>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllAsRead} sx={{ textTransform: "none" }}>
              Mark all as read
            </Button>
          )}
        </Box>

        {/* Notification List */}
        <List sx={{ p: 0, maxHeight: 400, overflow: "auto" }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <CheckCircle sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                No notifications
              </Typography>
            </Box>
          ) : (
            notifications.map((notification, index) => (
              <Box key={notification.id}>
                <ListItem
                  sx={{
                    bgcolor: notification.read ? "transparent" : "rgba(102, 126, 234, 0.05)",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.02)" },
                    cursor: "pointer",
                  }}
                  secondaryAction={
                    <IconButton size="small" onClick={() => handleDelete(notification.id)}>
                      <Close fontSize="small" />
                    </IconButton>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "transparent", border: "2px solid #f0f0f0" }}>
                      {getIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {notification.title}
                        </Typography>
                        {!notification.read && (
                          <Circle sx={{ fontSize: 8, color: "#667eea" }} />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="caption" display="block">
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {notification.timestamp}
                        </Typography>
                      </>
                    }
                    onClick={() => handleMarkAsRead(notification.id)}
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </Box>
            ))
          )}
        </List>

        {/* Footer */}
        {notifications.length > 0 && (
          <Box sx={{ p: 2, borderTop: "1px solid rgba(0,0,0,0.08)", textAlign: "center" }}>
            <Button fullWidth sx={{ textTransform: "none" }} href="/notifications">
              View All Notifications
            </Button>
          </Box>
        )}
      </Popover>
    </>
  );
}
