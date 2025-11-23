/**
 * Recognition & Rewards Component - Premium UI
 * Features: Peer recognition, badges, leaderboard
 */

"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  Grid,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  EmojiEvents,
  Star,
  ThumbUp,
  Favorite,
  WorkspacePremium,
  TrendingUp,
  Send,
} from "@mui/icons-material";

interface Recognition {
  id: string;
  from: {
    name: string;
    avatar?: string;
    position: string;
  };
  to: {
    name: string;
    avatar?: string;
    position: string;
  };
  badge: {
    name: string;
    icon: string;
    color: string;
  };
  message: string;
  likes: number;
  timestamp: string;
}

interface RecognitionCardProps {
  recognition: Recognition;
  onLike?: () => void;
  onSendRecognition?: () => void;
}

export default function RecognitionCard({
  recognition,
  onLike,
  onSendRecognition,
}: RecognitionCardProps) {
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
            <Avatar src={recognition.from.avatar} sx={{ width: 48, height: 48 }}>
              {recognition.from.name.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight={600}>
                {recognition.from.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {recognition.from.position}
              </Typography>
            </Box>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {recognition.timestamp}
          </Typography>
        </Box>

        {/* Recognition Message */}
        <Box
          sx={{
            mb: 3,
            p: 3,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${recognition.badge.color}15 0%, ${recognition.badge.color}25 100%)`,
            border: `2px solid ${recognition.badge.color}30`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Box
              sx={{
                fontSize: "2rem",
                width: 56,
                height: 56,
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "white",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              {recognition.badge.icon}
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Recognized for
              </Typography>
              <Typography variant="h6" fontWeight={700} sx={{ color: recognition.badge.color }}>
                {recognition.badge.name}
              </Typography>
            </Box>
          </Box>
          <Typography variant="body2" sx={{ fontStyle: "italic" }}>
            "{recognition.message}"
          </Typography>
        </Box>

        {/* Recipient */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Typography variant="caption" color="text.secondary">
            Recognized:
          </Typography>
          <Avatar src={recognition.to.avatar} sx={{ width: 40, height: 40 }}>
            {recognition.to.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {recognition.to.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {recognition.to.position}
            </Typography>
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Button
            startIcon={<ThumbUp />}
            onClick={onLike}
            sx={{
              borderRadius: 2,
              color: "text.secondary",
              "&:hover": {
                bgcolor: "rgba(102, 126, 234, 0.1)",
                color: "#667eea",
              },
            }}
          >
            {recognition.likes} Likes
          </Button>
          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={onSendRecognition}
            sx={{
              borderRadius: 2,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
            }}
          >
            Send Recognition
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

// Leaderboard Component
interface LeaderboardEntry {
  rank: number;
  employee: {
    name: string;
    avatar?: string;
    position: string;
  };
  points: number;
  badges: number;
  trend: "up" | "down" | "same";
}

interface RecognitionLeaderboardProps {
  entries: LeaderboardEntry[];
}

export function RecognitionLeaderboard({ entries }: RecognitionLeaderboardProps) {
  const getTrendIcon = (trend: LeaderboardEntry["trend"]) => {
    if (trend === "up") return <TrendingUp sx={{ fontSize: 16, color: "#10b981" }} />;
    if (trend === "down") return <TrendingUp sx={{ fontSize: 16, color: "#ef4444", transform: "rotate(180deg)" }} />;
    return null;
  };

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
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <EmojiEvents sx={{ fontSize: 32, color: "#fbbf24" }} />
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Recognition Leaderboard
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Top performers this month
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {entries.map((entry, idx) => (
            <Box
              key={idx}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 2,
                borderRadius: 3,
                bgcolor: entry.rank <= 3 ? `rgba(251, 191, 36, ${0.1 - entry.rank * 0.02})` : "transparent",
                border: entry.rank <= 3 ? "2px solid #fbbf2430" : "1px solid rgba(0,0,0,0.05)",
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: entry.rank <= 3 ? "#fbbf24" : "rgba(0,0,0,0.1)",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                }}
              >
                {entry.rank}
              </Box>
              <Avatar src={entry.employee.avatar} sx={{ width: 48, height: 48 }}>
                {entry.employee.name.charAt(0)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={600}>
                  {entry.employee.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {entry.employee.position}
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, justifyContent: "flex-end", mb: 0.5 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ color: "#667eea" }}>
                    {entry.points}
                  </Typography>
                  {getTrendIcon(entry.trend)}
                </Box>
                <Chip
                  icon={<WorkspacePremium sx={{ fontSize: 14 }} />}
                  label={`${entry.badges} badges`}
                  size="small"
                  sx={{
                    bgcolor: "rgba(102, 126, 234, 0.1)",
                    color: "#667eea",
                    fontWeight: 600,
                    fontSize: "0.7rem",
                    height: 20,
                  }}
                />
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
