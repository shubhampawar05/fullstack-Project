/**
 * Performance Review Card - Premium UI
 * Features: Rating system, progress tracking, 360-degree feedback
 */

"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Avatar,
  Rating,
  Button,
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  Star,
  TrendingUp,
  TrendingDown,
  EmojiEvents,
  Assessment,
  Comment,
  MoreVert,
} from "@mui/icons-material";

interface PerformanceMetric {
  category: string;
  score: number;
  maxScore: number;
  feedback?: string;
}

interface PerformanceReviewCardProps {
  employeeName: string;
  employeeAvatar?: string;
  position: string;
  department: string;
  reviewPeriod: string;
  overallRating: number;
  metrics: PerformanceMetric[];
  previousRating?: number;
  status: "draft" | "submitted" | "completed";
  onViewDetails?: () => void;
}

export default function PerformanceReviewCard({
  employeeName,
  employeeAvatar,
  position,
  department,
  reviewPeriod,
  overallRating,
  metrics,
  previousRating,
  status,
  onViewDetails,
}: PerformanceReviewCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case "draft":
        return "#f59e0b";
      case "submitted":
        return "#3b82f6";
      case "completed":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case "draft":
        return "Draft";
      case "submitted":
        return "Under Review";
      case "completed":
        return "Completed";
      default:
        return "Unknown";
    }
  };

  const getTrend = () => {
    if (!previousRating) return null;
    const diff = overallRating - previousRating;
    return {
      value: Math.abs(diff).toFixed(1),
      isPositive: diff > 0,
      percentage: ((Math.abs(diff) / previousRating) * 100).toFixed(0),
    };
  };

  const trend = getTrend();
  const averageScore = metrics.reduce((acc, m) => acc + (m.score / m.maxScore) * 5, 0) / metrics.length;

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
          <Box sx={{ display: "flex", gap: 2, flex: 1 }}>
            <Avatar
              src={employeeAvatar}
              sx={{
                width: 64,
                height: 64,
                border: "3px solid #f0f0f0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              {employeeName.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                {employeeName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {position} • {department}
              </Typography>
              <Chip
                label={getStatusLabel()}
                size="small"
                sx={{
                  bgcolor: `${getStatusColor()}15`,
                  color: getStatusColor(),
                  fontWeight: 600,
                  fontSize: "0.7rem",
                }}
              />
            </Box>
          </Box>
          <IconButton size="small">
            <MoreVert />
          </IconButton>
        </Box>

        {/* Review Period */}
        <Box
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 2,
            bgcolor: "rgba(102, 126, 234, 0.05)",
            border: "1px solid rgba(102, 126, 234, 0.1)",
          }}
        >
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Review Period
          </Typography>
          <Typography variant="body2" fontWeight={700}>
            {reviewPeriod}
          </Typography>
        </Box>

        {/* Overall Rating */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              Overall Performance
            </Typography>
            {trend && (
              <Chip
                icon={trend.isPositive ? <TrendingUp sx={{ fontSize: 16 }} /> : <TrendingDown sx={{ fontSize: 16 }} />}
                label={`${trend.isPositive ? "+" : "-"}${trend.value} (${trend.percentage}%)`}
                size="small"
                sx={{
                  bgcolor: trend.isPositive ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                  color: trend.isPositive ? "#10b981" : "#ef4444",
                  fontWeight: 600,
                  "& .MuiChip-icon": { color: "inherit" },
                }}
              />
            )}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
            <Typography variant="h2" fontWeight={700} sx={{ color: "#667eea" }}>
              {overallRating.toFixed(1)}
            </Typography>
            <Box>
              <Rating value={overallRating} precision={0.1} readOnly size="large" />
              <Typography variant="caption" color="text.secondary" display="block">
                out of 5.0
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Performance Metrics */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            Performance Breakdown
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            {metrics.map((metric, idx) => (
              <Box key={idx}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {metric.category}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {metric.score}/{metric.maxScore}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(metric.score / metric.maxScore) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: "rgba(0,0,0,0.05)",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 4,
                      background: `linear-gradient(90deg, #667eea ${idx * 10}%, #764ba2 100%)`,
                    },
                  }}
                />
                {metric.feedback && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                    {metric.feedback}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Achievement Badge */}
        {overallRating >= 4.5 && (
          <Box
            sx={{
              mb: 3,
              p: 2,
              borderRadius: 3,
              background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <EmojiEvents sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="subtitle2" fontWeight={700}>
                Outstanding Performance! 🎉
              </Typography>
              <Typography variant="caption">
                Exceeded expectations in this review period
              </Typography>
            </Box>
          </Box>
        )}

        {/* Actions */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<Assessment />}
            onClick={onViewDetails}
            sx={{
              borderRadius: 2,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
            }}
          >
            View Details
          </Button>
          <Tooltip title="Add Comment">
            <IconButton
              sx={{
                bgcolor: "rgba(102, 126, 234, 0.1)",
                "&:hover": { bgcolor: "rgba(102, 126, 234, 0.2)" },
              }}
            >
              <Comment />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
}
