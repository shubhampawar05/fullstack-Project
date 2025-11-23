/**
 * Performance Management Page - TalentHR
 * Goals and Reviews management
 */

"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Rating,
} from "@mui/material";
import {
  TrendingUp,
  Add,
  Edit,
  Delete,
  CheckCircle,
} from "@mui/icons-material";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useAuth } from "@/contexts/auth-context";
import { useForm } from "react-hook-form";

export default function PerformancePage() {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [goals, setGoals] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [goalDialog, setGoalDialog] = useState({ open: false, goal: null as any });
  const [reviewDialog, setReviewDialog] = useState({ open: false, review: null as any });

  useEffect(() => {
    fetchGoals();
    fetchReviews();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await fetch("/api/goals", { credentials: "include" });
      const data = await response.json();
      if (data.success) setGoals(data.goals || []);
    } catch (err) {
      console.error("Error fetching goals:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch("/api/reviews", { credentials: "include" });
      const data = await response.json();
      if (data.success) setReviews(data.reviews || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  const handleCreateGoal = async (data: any) => {
    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.success) {
        setGoalDialog({ open: false, goal: null });
        fetchGoals();
      }
    } catch (err) {
      console.error("Error creating goal:", err);
    }
  };

  const handleUpdateProgress = async (goalId: string, progress: number) => {
    try {
      await fetch(`/api/goals/${goalId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update-progress", progress }),
      });
      fetchGoals();
    } catch (err) {
      console.error("Error updating progress:", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "success";
      case "in-progress": return "primary";
      case "not-started": return "default";
      default: return "default";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "error";
      case "medium": return "warning";
      case "low": return "info";
      default: return "default";
    }
  };

  return (
    <DashboardLayout role={(user?.role as any) || "employee"}>
      <Container maxWidth="xl">
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <TrendingUp sx={{ fontSize: 40 }} color="primary" />
              <Box>
                <Typography variant="h4" component="h1" fontWeight={600}>
                  Performance Management
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Track goals and manage performance reviews
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tab label="Goals" />
            <Tab label="Reviews" />
          </Tabs>
        </Paper>

        {/* Goals Tab */}
        {tabValue === 0 && (
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>My Goals</Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setGoalDialog({ open: true, goal: null })}
                sx={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  "&:hover": { background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)" },
                }}
              >
                Add Goal
              </Button>
            </Box>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                {goals.map((goal) => (
                  <Grid item xs={12} md={6} key={goal.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                          <Typography variant="h6" fontWeight={600}>{goal.title}</Typography>
                          <Box>
                            <Chip label={goal.priority} color={getPriorityColor(goal.priority) as any} size="small" sx={{ mr: 1 }} />
                            <Chip label={goal.status} color={getStatusColor(goal.status) as any} size="small" />
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {goal.description}
                        </Typography>
                        <Box sx={{ mb: 1 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                            <Typography variant="caption">Progress</Typography>
                            <Typography variant="caption" fontWeight={600}>{goal.progress}%</Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={goal.progress} sx={{ height: 8, borderRadius: 4 }} />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Target: {new Date(goal.targetDate).toLocaleDateString()}
                        </Typography>
                        <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                          <Button
                            size="small"
                            onClick={() => {
                              const newProgress = Math.min(100, goal.progress + 10);
                              handleUpdateProgress(goal.id, newProgress);
                            }}
                          >
                            +10%
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleUpdateProgress(goal.id, 100)}
                          >
                            Complete
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Reviews Tab */}
        {tabValue === 1 && (
          <Box>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>Performance Reviews</Typography>
            <Grid container spacing={3}>
              {reviews.map((review) => (
                <Grid item xs={12} md={6} key={review.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                        <Box>
                          <Typography variant="h6" fontWeight={600}>{review.employee.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {review.employee.position}
                          </Typography>
                        </Box>
                        <Chip label={review.status} color={review.status === "submitted" ? "success" : "default"} size="small" />
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">Overall Rating</Typography>
                        <Rating value={review.overallRating} readOnly size="small" />
                      </Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Period:</strong> {new Date(review.reviewPeriod.startDate).toLocaleDateString()} - {new Date(review.reviewPeriod.endDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Strengths:</strong> {review.strengths.substring(0, 100)}...
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Goal Dialog */}
        <GoalDialog
          open={goalDialog.open}
          onClose={() => setGoalDialog({ open: false, goal: null })}
          onSubmit={handleCreateGoal}
        />
      </Container>
    </DashboardLayout>
  );
}

// Goal Dialog Component
function GoalDialog({ open, onClose, onSubmit }: any) {
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Create Goal</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField {...register("title")} fullWidth label="Goal Title" required />
            </Grid>
            <Grid item xs={12}>
              <TextField {...register("description")} fullWidth multiline rows={3} label="Description" required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select {...register("category")} label="Category" defaultValue="individual">
                  <MenuItem value="individual">Individual</MenuItem>
                  <MenuItem value="team">Team</MenuItem>
                  <MenuItem value="company">Company</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select {...register("priority")} label="Priority" defaultValue="medium">
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField {...register("targetDate")} fullWidth type="date" label="Target Date" InputLabelProps={{ shrink: true }} required />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">Create Goal</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
