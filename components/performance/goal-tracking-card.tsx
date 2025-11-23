/**
 * Goal Tracking Component - Premium UI
 * Features: OKR visualization, progress tracking, milestone management
 */

"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  AvatarGroup,
  Button,
} from "@mui/material";
import {
  Flag,
  TrendingUp,
  CheckCircle,
  Schedule,
  MoreVert,
  Add,
  EmojiEvents,
} from "@mui/icons-material";

interface Milestone {
  title: string;
  completed: boolean;
  dueDate: string;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  category: "individual" | "team" | "company";
  progress: number;
  target: number;
  unit: string;
  startDate: string;
  endDate: string;
  status: "on-track" | "at-risk" | "behind" | "completed";
  owner: {
    name: string;
    avatar?: string;
  };
  collaborators?: Array<{ name: string; avatar?: string }>;
  milestones?: Milestone[];
}

interface GoalTrackingCardProps {
  goal: Goal;
  onEdit?: () => void;
  onUpdateProgress?: () => void;
}

export default function GoalTrackingCard({ goal, onEdit, onUpdateProgress }: GoalTrackingCardProps) {
  const getStatusColor = () => {
    switch (goal.status) {
      case "on-track":
        return "#10b981";
      case "at-risk":
        return "#f59e0b";
      case "behind":
        return "#ef4444";
      case "completed":
        return "#8b5cf6";
      default:
        return "#6b7280";
    }
  };

  const getStatusLabel = () => {
    switch (goal.status) {
      case "on-track":
        return "On Track";
      case "at-risk":
        return "At Risk";
      case "behind":
        return "Behind Schedule";
      case "completed":
        return "Completed";
      default:
        return "Unknown";
    }
  };

  const getCategoryColor = () => {
    switch (goal.category) {
      case "individual":
        return "#3b82f6";
      case "team":
        return "#8b5cf6";
      case "company":
        return "#ec4899";
      default:
        return "#6b7280";
    }
  };

  const getCategoryLabel = () => {
    switch (goal.category) {
      case "individual":
        return "Individual Goal";
      case "team":
        return "Team Goal";
      case "company":
        return "Company Goal";
      default:
        return "Unknown";
    }
  };

  const progressPercentage = (goal.progress / goal.target) * 100;
  const completedMilestones = goal.milestones?.filter((m) => m.completed).length || 0;
  const totalMilestones = goal.milestones?.length || 0;
  const daysRemaining = Math.ceil(
    (new Date(goal.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        border: "1px solid rgba(255,255,255,0.6)",
        background: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(12px)",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <Chip
                label={getCategoryLabel()}
                size="small"
                sx={{
                  bgcolor: `${getCategoryColor()}15`,
                  color: getCategoryColor(),
                  fontWeight: 600,
                  fontSize: "0.7rem",
                }}
              />
              <Chip
                label={getStatusLabel()}
                size="small"
                icon={goal.status === "completed" ? <CheckCircle sx={{ fontSize: 14 }} /> : undefined}
                sx={{
                  bgcolor: `${getStatusColor()}15`,
                  color: getStatusColor(),
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  "& .MuiChip-icon": { color: getStatusColor() },
                }}
              />
            </Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {goal.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {goal.description}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onEdit}>
            <MoreVert />
          </IconButton>
        </Box>

        {/* Progress */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              Progress
            </Typography>
            <Typography variant="h6" fontWeight={700} sx={{ color: getStatusColor() }}>
              {goal.progress} / {goal.target} {goal.unit}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(progressPercentage, 100)}
            sx={{
              height: 12,
              borderRadius: 6,
              bgcolor: "rgba(0,0,0,0.05)",
              "& .MuiLinearProgress-bar": {
                borderRadius: 6,
                background: `linear-gradient(90deg, ${getStatusColor()} 0%, ${getStatusColor()}dd 100%)`,
                boxShadow: `0 0 10px ${getStatusColor()}50`,
              },
            }}
          />
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {progressPercentage.toFixed(0)}% Complete
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {daysRemaining > 0 ? `${daysRemaining} days remaining` : "Overdue"}
            </Typography>
          </Box>
        </Box>

        {/* Milestones */}
        {goal.milestones && goal.milestones.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                Milestones
              </Typography>
              <Chip
                label={`${completedMilestones}/${totalMilestones}`}
                size="small"
                sx={{
                  bgcolor: "rgba(102, 126, 234, 0.1)",
                  color: "#667eea",
                  fontWeight: 600,
                  fontSize: "0.7rem",
                }}
              />
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {goal.milestones.slice(0, 3).map((milestone, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: milestone.completed ? "rgba(16, 185, 129, 0.05)" : "rgba(0,0,0,0.02)",
                    border: `1px solid ${milestone.completed ? "#10b98120" : "rgba(0,0,0,0.05)"}`,
                  }}
                >
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: milestone.completed ? "#10b981" : "rgba(0,0,0,0.1)",
                      color: "white",
                    }}
                  >
                    {milestone.completed ? <CheckCircle sx={{ fontSize: 16 }} /> : <Flag sx={{ fontSize: 14 }} />}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{
                        textDecoration: milestone.completed ? "line-through" : "none",
                        color: milestone.completed ? "text.secondary" : "text.primary",
                      }}
                    >
                      {milestone.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Due: {new Date(milestone.dueDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Team */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              Team
            </Typography>
            {goal.collaborators && goal.collaborators.length > 0 && (
              <AvatarGroup max={4} sx={{ "& .MuiAvatar-root": { width: 32, height: 32, fontSize: "0.875rem" } }}>
                {goal.collaborators.map((collab, idx) => (
                  <Tooltip key={idx} title={collab.name}>
                    <Avatar src={collab.avatar} alt={collab.name}>
                      {collab.name.charAt(0)}
                    </Avatar>
                  </Tooltip>
                ))}
              </AvatarGroup>
            )}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar src={goal.owner.avatar} sx={{ width: 40, height: 40 }}>
              {goal.owner.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {goal.owner.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Goal Owner
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Achievement */}
        {goal.status === "completed" && (
          <Box
            sx={{
              mb: 3,
              p: 2,
              borderRadius: 3,
              background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <EmojiEvents sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="subtitle2" fontWeight={700}>
                Goal Achieved! 🎉
              </Typography>
              <Typography variant="caption">
                Completed on {new Date(goal.endDate).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Actions */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<TrendingUp />}
            onClick={onUpdateProgress}
            disabled={goal.status === "completed"}
            sx={{
              borderRadius: 2,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
            }}
          >
            Update Progress
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
