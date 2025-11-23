/**
 * Course Card Component - Premium UI
 * Features: Enrollment, progress tracking, certificate display
 */

"use client";

import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  LinearProgress,
  Chip,
  Button,
  IconButton,
  Avatar,
  Tooltip,
  Rating,
} from "@mui/material";
import {
  PlayCircle,
  Schedule,
  People,
  Star,
  Bookmark,
  BookmarkBorder,
  EmojiEvents,
  CheckCircle,
} from "@mui/icons-material";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructor: {
    name: string;
    avatar?: string;
  };
  duration: string;
  level: "beginner" | "intermediate" | "advanced";
  category: string;
  rating: number;
  enrolledCount: number;
  progress?: number;
  isEnrolled?: boolean;
  isCompleted?: boolean;
  isSaved?: boolean;
}

interface CourseCardProps {
  course: Course;
  onEnroll?: () => void;
  onContinue?: () => void;
  onSave?: () => void;
}

export default function CourseCard({ course, onEnroll, onContinue, onSave }: CourseCardProps) {
  const getLevelColor = () => {
    switch (course.level) {
      case "beginner":
        return "#10b981";
      case "intermediate":
        return "#f59e0b";
      case "advanced":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getLevelLabel = () => {
    switch (course.level) {
      case "beginner":
        return "Beginner";
      case "intermediate":
        return "Intermediate";
      case "advanced":
        return "Advanced";
      default:
        return "Unknown";
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 4,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        border: "1px solid rgba(255,255,255,0.6)",
        background: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(12px)",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
        },
      }}
    >
      {/* Thumbnail */}
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          height="200"
          image={course.thumbnail}
          alt={course.title}
          sx={{
            borderRadius: "16px 16px 0 0",
            objectFit: "cover",
          }}
        />
        {/* Overlay */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 50%)",
            borderRadius: "16px 16px 0 0",
          }}
        />
        {/* Badges */}
        <Box sx={{ position: "absolute", top: 16, left: 16, display: "flex", gap: 1 }}>
          <Chip
            label={course.category}
            size="small"
            sx={{
              bgcolor: "rgba(255,255,255,0.95)",
              fontWeight: 600,
              backdropFilter: "blur(10px)",
            }}
          />
          <Chip
            label={getLevelLabel()}
            size="small"
            sx={{
              bgcolor: `${getLevelColor()}15`,
              color: getLevelColor(),
              fontWeight: 600,
              backdropFilter: "blur(10px)",
              border: `1px solid ${getLevelColor()}30`,
            }}
          />
        </Box>
        {/* Save Button */}
        <IconButton
          onClick={onSave}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            bgcolor: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(10px)",
            "&:hover": { bgcolor: "white" },
          }}
        >
          {course.isSaved ? <Bookmark sx={{ color: "#667eea" }} /> : <BookmarkBorder />}
        </IconButton>
        {/* Completion Badge */}
        {course.isCompleted && (
          <Box
            sx={{
              position: "absolute",
              bottom: 16,
              left: 16,
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "rgba(16, 185, 129, 0.95)",
              color: "white",
              px: 2,
              py: 1,
              borderRadius: 3,
              backdropFilter: "blur(10px)",
            }}
          >
            <EmojiEvents sx={{ fontSize: 20 }} />
            <Typography variant="caption" fontWeight={700}>
              Completed
            </Typography>
          </Box>
        )}
      </Box>

      <CardContent sx={{ p: 3 }}>
        {/* Title */}
        <Typography variant="h6" fontWeight={700} gutterBottom sx={{ minHeight: 64 }}>
          {course.title}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {course.description}
        </Typography>

        {/* Instructor */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <Avatar src={course.instructor.avatar} sx={{ width: 32, height: 32 }}>
            {course.instructor.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Instructor
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {course.instructor.name}
            </Typography>
          </Box>
        </Box>

        {/* Stats */}
        <Box sx={{ display: "flex", gap: 3, mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Schedule sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary">
              {course.duration}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <People sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary">
              {course.enrolledCount.toLocaleString()} enrolled
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Star sx={{ fontSize: 16, color: "#fbbf24" }} />
            <Typography variant="caption" fontWeight={600}>
              {course.rating.toFixed(1)}
            </Typography>
          </Box>
        </Box>

        {/* Progress */}
        {course.isEnrolled && !course.isCompleted && course.progress !== undefined && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Progress
              </Typography>
              <Typography variant="caption" fontWeight={700} sx={{ color: "#667eea" }}>
                {course.progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={course.progress}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: "rgba(0,0,0,0.05)",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 4,
                  background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                  boxShadow: "0 0 10px rgba(102, 126, 234, 0.5)",
                },
              }}
            />
          </Box>
        )}

        {/* Action Button */}
        {course.isCompleted ? (
          <Button
            variant="outlined"
            fullWidth
            startIcon={<CheckCircle />}
            sx={{
              borderRadius: 2,
              borderColor: "#10b981",
              color: "#10b981",
              fontWeight: 600,
              "&:hover": {
                borderColor: "#059669",
                bgcolor: "rgba(16, 185, 129, 0.05)",
              },
            }}
          >
            View Certificate
          </Button>
        ) : course.isEnrolled ? (
          <Button
            variant="contained"
            fullWidth
            startIcon={<PlayCircle />}
            onClick={onContinue}
            sx={{
              borderRadius: 2,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
              fontWeight: 600,
            }}
          >
            Continue Learning
          </Button>
        ) : (
          <Button
            variant="contained"
            fullWidth
            onClick={onEnroll}
            sx={{
              borderRadius: 2,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
              fontWeight: 600,
            }}
          >
            Enroll Now
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
