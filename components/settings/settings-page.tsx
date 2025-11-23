/**
 * Settings Page - Complete UI
 */

"use client";

import { Box, Typography, Grid, Card, CardContent, TextField, Button, Switch, FormControlLabel, Divider, MenuItem } from "@mui/material";
import { Save, Business, Notifications, Security, Palette } from "@mui/icons-material";

export default function SettingsPage() {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>Settings</Typography>
        <Typography variant="body2" color="text.secondary">Manage your application preferences</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Company Settings */}
        <Grid item xs={12}>
          <Card elevation={0} sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)" }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Box sx={{ p: 1.5, borderRadius: 3, background: "linear-gradient(135deg, #667eea15 0%, #667eea25 100%)" }}>
                  <Business sx={{ color: "#667eea" }} />
                </Box>
                <Typography variant="h6" fontWeight={700}>Company Information</Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Company Name" defaultValue="TalentHR Inc." />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Industry" defaultValue="Technology" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Company Size" defaultValue="201-500 employees" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Website" defaultValue="https://talenthr.com" />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth multiline rows={3} label="Company Description" defaultValue="Leading HR management solution provider" />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Regional Settings */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Regional Settings</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 3 }}>
                <TextField select fullWidth label="Timezone" defaultValue="America/New_York">
                  <MenuItem value="America/New_York">Eastern Time (ET)</MenuItem>
                  <MenuItem value="America/Chicago">Central Time (CT)</MenuItem>
                  <MenuItem value="America/Los_Angeles">Pacific Time (PT)</MenuItem>
                  <MenuItem value="Asia/Kolkata">India Standard Time (IST)</MenuItem>
                </TextField>
                <TextField select fullWidth label="Currency" defaultValue="USD">
                  <MenuItem value="USD">US Dollar ($)</MenuItem>
                  <MenuItem value="EUR">Euro (€)</MenuItem>
                  <MenuItem value="GBP">British Pound (£)</MenuItem>
                  <MenuItem value="INR">Indian Rupee (₹)</MenuItem>
                </TextField>
                <TextField select fullWidth label="Date Format" defaultValue="MM/DD/YYYY">
                  <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                  <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                  <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                </TextField>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)" }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Box sx={{ p: 1.5, borderRadius: 3, background: "linear-gradient(135deg, #10b98115 0%, #10b98125 100%)" }}>
                  <Notifications sx={{ color: "#10b981" }} />
                </Box>
                <Typography variant="h6" fontWeight={700}>Notifications</Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <FormControlLabel control={<Switch defaultChecked />} label="Email Notifications" />
                <FormControlLabel control={<Switch defaultChecked />} label="New Employee Alerts" />
                <FormControlLabel control={<Switch defaultChecked />} label="Leave Request Notifications" />
                <FormControlLabel control={<Switch />} label="Interview Reminders" />
                <FormControlLabel control={<Switch defaultChecked />} label="Payroll Notifications" />
                <FormControlLabel control={<Switch />} label="Performance Review Reminders" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)" }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Box sx={{ p: 1.5, borderRadius: 3, background: "linear-gradient(135deg, #ef444415 0%, #ef444425 100%)" }}>
                  <Security sx={{ color: "#ef4444" }} />
                </Box>
                <Typography variant="h6" fontWeight={700}>Security</Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <FormControlLabel control={<Switch defaultChecked />} label="Two-Factor Authentication" />
                <FormControlLabel control={<Switch defaultChecked />} label="Session Timeout (30 min)" />
                <FormControlLabel control={<Switch />} label="IP Whitelisting" />
                <Divider sx={{ my: 1 }} />
                <Button variant="outlined" fullWidth sx={{ borderRadius: 2 }}>Change Password</Button>
                <Button variant="outlined" color="error" fullWidth sx={{ borderRadius: 2 }}>Revoke All Sessions</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Appearance */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)" }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Box sx={{ p: 1.5, borderRadius: 3, background: "linear-gradient(135deg, #8b5cf615 0%, #8b5cf625 100%)" }}>
                  <Palette sx={{ color: "#8b5cf6" }} />
                </Box>
                <Typography variant="h6" fontWeight={700}>Appearance</Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <TextField select fullWidth label="Theme" defaultValue="light">
                  <MenuItem value="light">Light Mode</MenuItem>
                  <MenuItem value="dark">Dark Mode</MenuItem>
                  <MenuItem value="auto">Auto (System)</MenuItem>
                </TextField>
                <TextField select fullWidth label="Sidebar Position" defaultValue="left">
                  <MenuItem value="left">Left</MenuItem>
                  <MenuItem value="right">Right</MenuItem>
                </TextField>
                <FormControlLabel control={<Switch defaultChecked />} label="Compact Mode" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Save Button */}
        <Grid item xs={12}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button variant="outlined" size="large" sx={{ borderRadius: 2, px: 4 }}>Cancel</Button>
            <Button variant="contained" size="large" startIcon={<Save />} sx={{ borderRadius: 2, px: 4, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)" }}>
              Save Changes
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
