/**
 * Recruitment Dashboard - Complete UI
 */

"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  Tab,
  Tabs,
} from "@mui/material";
import { Add, Work, People, Schedule, CheckCircle } from "@mui/icons-material";
import { useState } from "react";

const jobs = [
  { id: "1", title: "Senior Frontend Developer", department: "Engineering", location: "Remote", type: "Full-time", applicants: 45, status: "Active", posted: "2024-11-15" },
  { id: "2", title: "Product Manager", department: "Product", location: "New York", type: "Full-time", applicants: 32, status: "Active", posted: "2024-11-10" },
  { id: "3", title: "UX Designer", department: "Design", location: "San Francisco", type: "Full-time", applicants: 28, status: "Active", posted: "2024-11-12" },
  { id: "4", title: "DevOps Engineer", department: "Engineering", location: "Remote", type: "Contract", applicants: 19, status: "Active", posted: "2024-11-18" },
];

const candidates = [
  { id: "1", name: "Rahul Verma", position: "Senior Frontend Developer", status: "Interview", rating: 4.5, experience: "5 years", avatar: "" },
  { id: "2", name: "Anita Desai", position: "Product Manager", status: "Offer", rating: 4.8, experience: "7 years", avatar: "" },
  { id: "3", name: "Karan Mehta", position: "UX Designer", status: "Screening", rating: 4.2, experience: "3 years", avatar: "" },
  { id: "4", name: "Sneha Patel", position: "DevOps Engineer", status: "Applied", rating: 4.0, experience: "4 years", avatar: "" },
];

export default function RecruitmentDashboard() {
  const [activeTab, setActiveTab] = useState(0);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Active: "#10b981",
      Interview: "#3b82f6",
      Offer: "#8b5cf6",
      Screening: "#f59e0b",
      Applied: "#6b7280",
    };
    return colors[status] || "#6b7280";
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>Recruitment</Typography>
          <Typography variant="body2" color="text.secondary">Manage job postings and candidates</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} sx={{ borderRadius: 2, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)" }}>
          Post New Job
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: "Active Jobs", value: jobs.length, icon: <Work />, color: "#667eea" },
          { title: "Total Candidates", value: 124, icon: <People />, color: "#10b981" },
          { title: "Interviews Scheduled", value: 18, icon: <Schedule />, color: "#f59e0b" },
          { title: "Offers Extended", value: 5, icon: <CheckCircle />, color: "#8b5cf6" },
        ].map((stat, idx) => (
          <Grid item xs={12} sm={6} lg={3} key={idx}>
            <Card elevation={0} sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)" }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: 3, background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}25 100%)` }}>
                    <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>{stat.title}</Typography>
                <Typography variant="h3" fontWeight={700}>{stat.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Card elevation={0} sx={{ mb: 3, borderRadius: 4 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label="Job Postings" />
          <Tab label="Candidates" />
        </Tabs>
      </Card>

      {/* Job Postings */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {jobs.map((job) => (
            <Grid item xs={12} key={job.id}>
              <Card elevation={0} sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)" }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={700} gutterBottom>{job.title}</Typography>
                      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                        <Chip label={job.department} size="small" variant="outlined" />
                        <Chip label={job.location} size="small" variant="outlined" />
                        <Chip label={job.type} size="small" variant="outlined" />
                      </Box>
                      <Box sx={{ display: "flex", gap: 3 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Applicants</Typography>
                          <Typography variant="h6" fontWeight={700}>{job.applicants}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Posted</Typography>
                          <Typography variant="body2" fontWeight={600}>{new Date(job.posted).toLocaleDateString()}</Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                      <Chip label={job.status} sx={{ bgcolor: `${getStatusColor(job.status)}15`, color: getStatusColor(job.status), fontWeight: 600 }} />
                      <Button variant="outlined" size="small" sx={{ borderRadius: 2 }}>View Details</Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Candidates */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          {candidates.map((candidate) => (
            <Grid item xs={12} sm={6} lg={4} key={candidate.id}>
              <Card elevation={0} sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", transition: "all 0.3s", "&:hover": { transform: "translateY(-8px)" } }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                    <Avatar sx={{ width: 56, height: 56 }}>{candidate.name.charAt(0)}</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={700}>{candidate.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{candidate.position}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Chip label={candidate.status} size="small" sx={{ bgcolor: `${getStatusColor(candidate.status)}15`, color: getStatusColor(candidate.status), fontWeight: 600, mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">{candidate.experience} experience</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
                      <Typography variant="body2" fontWeight={700}>{candidate.rating}</Typography>
                      <Typography variant="body2" color="text.secondary">⭐ Rating</Typography>
                    </Box>
                  </Box>
                  <Button fullWidth variant="outlined" size="small" sx={{ borderRadius: 2 }}>View Profile</Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
