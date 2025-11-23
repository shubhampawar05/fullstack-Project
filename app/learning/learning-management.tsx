/**
 * Learning Management - Complete UI
 * Professional, Minimal, and Premium UI
 */

"use client";

import { Box, Typography, Grid, Tabs, Tab, Card, CardContent, Button, Chip, Stack } from "@mui/material";
import { Add, School, TrendingUp, Search, FilterList } from "@mui/icons-material";
import { useState } from "react";
import CourseCard from "@/app/learning/course-card";

// Minimal Card Component for consistency
const MinimalCard = ({ children, sx = {}, ...props }: any) => (
  <Card
    elevation={0}
    sx={{
      height: "100%",
      borderRadius: 3,
      border: "1px solid",
      borderColor: "divider",
      background: "white",
      boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
      transition: "all 0.2s ease-in-out",
      "&:hover": {
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        borderColor: "rgba(0,0,0,0.08)",
      },
      ...sx,
    }}
    {...props}
  >
    {children}
  </Card>
);

const courses = [
  { id: "1", title: "Advanced React & Next.js", description: "Master modern React patterns and Next.js 14", thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=200&fit=crop", instructor: { name: "Sarah Johnson", avatar: "" }, duration: "12 hours", level: "intermediate" as const, category: "Development", rating: 4.8, enrolledCount: 1247, progress: 65, isEnrolled: true, isCompleted: false, isSaved: true },
  { id: "2", title: "UI/UX Design Fundamentals", description: "Learn user-centered design principles", thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=200&fit=crop", instructor: { name: "Emily Davis", avatar: "" }, duration: "8 hours", level: "beginner" as const, category: "Design", rating: 4.6, enrolledCount: 892, isEnrolled: false },
  { id: "3", title: "Advanced TypeScript", description: "Master TypeScript patterns for scalable apps", thumbnail: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=200&fit=crop", instructor: { name: "Michael Chen", avatar: "" }, duration: "10 hours", level: "advanced" as const, category: "Development", rating: 4.9, enrolledCount: 654, progress: 100, isEnrolled: true, isCompleted: true },
  { id: "4", title: "Leadership Skills", description: "Develop essential leadership capabilities", thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=200&fit=crop", instructor: { name: "Priya Sharma", avatar: "" }, duration: "6 hours", level: "intermediate" as const, category: "Leadership", rating: 4.7, enrolledCount: 1123, progress: 30, isEnrolled: true },
  { id: "5", title: "Data Analytics Basics", description: "Introduction to data analysis and visualization", thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop", instructor: { name: "James Wilson", avatar: "" }, duration: "14 hours", level: "beginner" as const, category: "Analytics", rating: 4.5, enrolledCount: 987, isEnrolled: false },
  { id: "6", title: "Agile Project Management", description: "Master Agile methodologies and Scrum", thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=200&fit=crop", instructor: { name: "Amit Kumar", avatar: "" }, duration: "9 hours", level: "intermediate" as const, category: "Management", rating: 4.6, enrolledCount: 756, isEnrolled: false },
];

export default function LearningManagement() {
  const [activeTab, setActiveTab] = useState(0);

  const enrolledCourses = courses.filter(c => c.isEnrolled);
  const availableCourses = courses.filter(c => !c.isEnrolled);

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom sx={{ letterSpacing: "-0.5px" }}>
            Learning & Development
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Enhance your skills with our curated courses and workshops.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          sx={{ 
            borderRadius: 2, 
            px: 3,
            py: 1,
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "none",
            "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }
          }}
        >
          Create Course
        </Button>
      </Box>

      {/* Stats - Minimal Style */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: "Enrolled Courses", value: enrolledCourses.length, icon: <School sx={{ fontSize: 24 }} />, color: "#667eea" },
          { title: "Completed", value: enrolledCourses.filter(c => c.isCompleted).length, icon: <TrendingUp sx={{ fontSize: 24 }} />, color: "#10b981" },
          { title: "In Progress", value: enrolledCourses.filter(c => !c.isCompleted).length, icon: <School sx={{ fontSize: 24 }} />, color: "#f59e0b" },
          { title: "Available", value: availableCourses.length, icon: <School sx={{ fontSize: 24 }} />, color: "#8b5cf6" },
        ].map((stat, idx) => (
          <Grid item xs={12} sm={6} lg={3} key={idx}>
            <MinimalCard>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                  <Box
                    sx={{
                      p: 1.2,
                      borderRadius: 2,
                      bgcolor: `${stat.color}10`,
                      color: stat.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
                <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5, color: "text.primary" }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  {stat.title}
                </Typography>
              </CardContent>
            </MinimalCard>
          </Grid>
        ))}
      </Grid>

      {/* Tabs & Filters */}
      <Box sx={{ mb: 4, borderBottom: 1, borderColor: "divider" }}>
        <Tabs 
          value={activeTab} 
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "1rem",
              minHeight: 48,
            }
          }}
        >
          <Tab label="My Courses" />
          <Tab label="Course Catalog" />
        </Tabs>
      </Box>

      {/* My Courses */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {enrolledCourses.map((course) => (
            <Grid item xs={12} sm={6} lg={4} key={course.id}>
              <CourseCard course={course} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Course Catalog */}
      {activeTab === 1 && (
        <Box>
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
             {/* Add search/filter inputs here if needed in future */}
          </Box>
          <Grid container spacing={3}>
            {availableCourses.map((course) => (
              <Grid item xs={12} sm={6} lg={4} key={course.id}>
                <CourseCard course={course} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}
