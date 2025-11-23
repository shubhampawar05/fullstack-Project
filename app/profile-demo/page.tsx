/**
 * User Profile Page - Complete UI
 * Features: Avatar upload, personal info, work details, documents
 */

"use client";

import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Grid,
  Chip,
  Divider,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import {
  Edit,
  CameraAlt,
  Email,
  Phone,
  LocationOn,
  Work,
  CalendarToday,
  AttachFile,
  CheckCircle,
} from "@mui/icons-material";

export default function ProfilePage() {
  const profileCompletion = 85;

  const user = {
    name: "John Doe",
    email: "john.doe@company.com",
    phone: "+1 234-567-8901",
    position: "Senior Developer",
    department: "Engineering",
    location: "New York, USA",
    joinDate: "Jan 15, 2022",
    employeeId: "EMP-001",
    manager: "Sarah Johnson",
    avatar: "",
  };

  const documents = [
    { name: "Resume.pdf", uploadedDate: "Nov 20, 2024", size: "2.4 MB" },
    { name: "ID Proof.pdf", uploadedDate: "Nov 18, 2024", size: "1.2 MB" },
    { name: "Offer Letter.pdf", uploadedDate: "Jan 10, 2022", size: "856 KB" },
  ];

  return (
    <Box sx={{ bgcolor: "#f5f7fa", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">
        {/* Profile Header */}
        <Card elevation={0} sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", mb: 3 }}>
          <Box
            sx={{
              height: 200,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "16px 16px 0 0",
            }}
          />
          <CardContent sx={{ p: 4, mt: -8 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <Box sx={{ display: "flex", gap: 3, alignItems: "end" }}>
                <Box sx={{ position: "relative" }}>
                  <Avatar
                    sx={{
                      width: 160,
                      height: 160,
                      border: "6px solid white",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                      fontSize: "3rem",
                    }}
                  >
                    {user.name.charAt(0)}
                  </Avatar>
                  <IconButton
                    sx={{
                      position: "absolute",
                      bottom: 8,
                      right: 8,
                      bgcolor: "white",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      "&:hover": { bgcolor: "white" },
                    }}
                  >
                    <CameraAlt />
                  </IconButton>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    {user.name}
                  </Typography>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {user.position}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Chip label={user.department} color="primary" size="small" />
                    <Chip label={user.employeeId} variant="outlined" size="small" />
                  </Box>
                </Box>
              </Box>
              <Button variant="contained" startIcon={<Edit />} sx={{ borderRadius: 2 }}>
                Edit Profile
              </Button>
            </Box>

            {/* Profile Completion */}
            <Box sx={{ mt: 3, p: 3, borderRadius: 3, bgcolor: "rgba(102, 126, 234, 0.05)" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2" fontWeight={600}>
                  Profile Completion
                </Typography>
                <Typography variant="body2" fontWeight={700} color="primary">
                  {profileCompletion}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={profileCompletion}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: "rgba(0,0,0,0.05)",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 4,
                    background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                Complete your profile to unlock all features
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Personal Information
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Email sx={{ color: "text.secondary" }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Phone sx={{ color: "text.secondary" }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Phone
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {user.phone}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <LocationOn sx={{ color: "text.secondary" }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Location
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {user.location}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Work Information */}
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Work Information
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Work sx={{ color: "text.secondary" }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Department
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {user.department}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <CalendarToday sx={{ color: "text.secondary" }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Join Date
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {user.joinDate}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <CheckCircle sx={{ color: "text.secondary" }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Reports To
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {user.manager}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Documents */}
          <Grid item xs={12}>
            <Card elevation={0} sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="h6" fontWeight={700}>
                    Documents
                  </Typography>
                  <Button variant="outlined" startIcon={<AttachFile />} sx={{ borderRadius: 2 }}>
                    Upload Document
                  </Button>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <List>
                  {documents.map((doc, idx) => (
                    <ListItem
                      key={idx}
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        bgcolor: "rgba(0,0,0,0.02)",
                        "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
                      }}
                    >
                      <ListItemIcon>
                        <AttachFile />
                      </ListItemIcon>
                      <ListItemText
                        primary={doc.name}
                        secondary={`${doc.uploadedDate} • ${doc.size}`}
                      />
                      <Button size="small" variant="outlined" sx={{ borderRadius: 2 }}>
                        Download
                      </Button>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
