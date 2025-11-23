/**
 * Learning Management Component - TalentHR
 * Soft Claymorphism Design
 */

"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  CardContent,
  LinearProgress,
  Chip,
  Tabs,
  Tab,
  InputAdornment,
  TextField,
  IconButton,
} from "@mui/material";
import {
  School,
  Search,
  PlayCircle,
  CheckCircle,
  Timer,
  Star,
  MoreVert,
  BookmarkBorder,
} from "@mui/icons-material";
import ClayCard from "@/components/ui/clay-card";
import ClayButton from "@/components/ui/clay-button";

// Dummy Data
const courses = [
  {
    id: 1,
    title: "Advanced Leadership Skills",
    instructor: "Sarah Johnson",
    duration: "4h 30m",
    progress: 75,
    rating: 4.8,
    image: "https://source.unsplash.com/random/800x600?meeting",
    category: "Leadership",
  },
  {
    id: 2,
    title: "React 19 Masterclass",
    instructor: "Code Academy",
    duration: "12h 15m",
    progress: 30,
    rating: 4.9,
    image: "https://source.unsplash.com/random/800x600?coding",
    category: "Technical",
  },
  {
    id: 3,
    title: "Workplace Safety 101",
    instructor: "HR Dept",
    duration: "1h 00m",
    progress: 0,
    rating: 4.5,
    image: "https://source.unsplash.com/random/800x600?safety",
    category: "Compliance",
  },
  {
    id: 4,
    title: "Effective Communication",
    instructor: "Dr. Emily White",
    duration: "3h 45m",
    progress: 0,
    rating: 4.7,
    image: "https://source.unsplash.com/random/800x600?talk",
    category: "Soft Skills",
  },
];

export default function LearningManagement() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      {/* Header Stats */}
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
                <School sx={{ fontSize: 32 }} />
              </Box>
              <Typography variant="h4" fontWeight={800}>
                Learning Center
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
              Expand your skills and advance your career with our curated courses.
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <ClayButton
                variant="contained"
                sx={{ bgcolor: "white", color: "primary.main", "&:hover": { bgcolor: "#f0f4f8" } }}
              >
                Browse Catalog
              </ClayButton>
              <ClayButton
                variant="outlined"
                sx={{ borderColor: "rgba(255,255,255,0.5)", color: "white", "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" } }}
              >
                My Certifications
              </ClayButton>
            </Box>
          </ClayCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <ClayCard sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Weekly Progress
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Box sx={{ position: "relative", display: "inline-flex" }}>
                <CircularProgress variant="determinate" value={75} size={80} thickness={4} sx={{ color: "success.main" }} />
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
                  }}
                >
                  <Typography variant="caption" component="div" color="text.secondary" fontWeight={700}>
                    75%
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={800}>3.5h</Typography>
                <Typography variant="body2" color="text.secondary">Learning time this week</Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CheckCircle fontSize="small" color="success" />
              You're on track to meet your goal!
            </Typography>
          </ClayCard>
        </Grid>
      </Grid>

      {/* Tabs & Search */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <ClayCard sx={{ p: 0.5, borderRadius: 3, display: "inline-flex" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              "& .MuiTabs-indicator": { display: "none" },
              minHeight: 48,
            }}
          >
            {["My Courses", "Course Catalog", "Completed"].map((label, index) => (
              <Tab
                key={label}
                label={label}
                sx={{
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 600,
                  minHeight: 40,
                  px: 3,
                  color: "text.secondary",
                  "&.Mui-selected": {
                    color: "primary.main",
                    bgcolor: "#f0f4f8",
                    boxShadow: "inset 2px 2px 4px #d1d9e6, inset -2px -2px 4px #ffffff",
                  },
                }}
              />
            ))}
          </Tabs>
        </ClayCard>

        <TextField
          placeholder="Search courses..."
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
            sx: {
              borderRadius: 3,
              bgcolor: "white",
              boxShadow: "inset 2px 2px 4px #d1d9e6, inset -2px -2px 4px #ffffff",
              "& fieldset": { border: "none" },
            },
          }}
          sx={{ width: 300 }}
        />
      </Box>

      {/* Course Grid */}
      <Grid container spacing={3}>
        {courses.map((course) => (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
            <ClayCard
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                p: 0,
                transition: "all 0.3s ease",
                "&:hover": { transform: "translateY(-8px)" },
              }}
            >
              <Box sx={{ position: "relative", height: 160, bgcolor: "grey.200" }}>
                {/* Placeholder Image */}
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    background: `linear-gradient(135deg, ${
                      course.category === "Leadership" ? "#a29bfe" :
                      course.category === "Technical" ? "#74b9ff" :
                      course.category === "Compliance" ? "#ff7675" : "#fdcb6e"
                    } 0%, #dfe6e9 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <School sx={{ fontSize: 64, color: "white", opacity: 0.5 }} />
                </Box>
                <Chip
                  label={course.category}
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 16,
                    left: 16,
                    bgcolor: "rgba(255,255,255,0.9)",
                    backdropFilter: "blur(4px)",
                    fontWeight: 700,
                  }}
                />
                <IconButton
                  sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    bgcolor: "rgba(255,255,255,0.9)",
                    "&:hover": { bgcolor: "white" },
                  }}
                  size="small"
                >
                  <BookmarkBorder fontSize="small" />
                </IconButton>
              </Box>

              <CardContent sx={{ p: 3, flexGrow: 1 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ lineHeight: 1.3 }}>
                  {course.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  by {course.instructor}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, mt: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Timer fontSize="small" color="action" sx={{ fontSize: 16 }} />
                    <Typography variant="caption" fontWeight={600} color="text.secondary">
                      {course.duration}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Star fontSize="small" sx={{ fontSize: 16, color: "#fdcb6e" }} />
                    <Typography variant="caption" fontWeight={600} color="text.secondary">
                      {course.rating}
                    </Typography>
                  </Box>
                </Box>

                {course.progress > 0 ? (
                  <Box sx={{ mt: "auto" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="caption" fontWeight={600}>Progress</Typography>
                      <Typography variant="caption" fontWeight={600}>{course.progress}%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={course.progress}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: "#f0f4f8",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 4,
                          bgcolor: "primary.main",
                        },
                      }}
                    />
                    <ClayButton
                      fullWidth
                      variant="contained"
                      sx={{ mt: 2 }}
                      startIcon={<PlayCircle />}
                    >
                      Continue
                    </ClayButton>
                  </Box>
                ) : (
                  <ClayButton
                    fullWidth
                    variant="outlined"
                    sx={{ mt: "auto" }}
                  >
                    Start Course
                  </ClayButton>
                )}
              </CardContent>
            </ClayCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
