"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  Box,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { useAuth } from "@/contexts/auth-context";

export default function AttendanceList() {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });

  const fetchRecords = async () => {
    setLoading(true);
    try {
      let url = `/api/attendance?`;
      if (dateRange.start) url += `startDate=${dateRange.start}&`;
      if (dateRange.end) url += `endDate=${dateRange.end}&`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        setRecords(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch records", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRecords();
    }
  }, [user, dateRange]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present":
        return "success";
      case "Absent":
        return "error";
      case "Late":
        return "warning";
      case "Half-day":
        return "info";
      default:
        return "default";
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "-";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const filteredRecords = records.filter((record) => {
    const searchLower = searchTerm.toLowerCase();
    const employeeName = record.employeeId?.userId?.name?.toLowerCase() || "";
    const status = record.status?.toLowerCase() || "";
    return employeeName.includes(searchLower) || status.includes(searchLower);
  });

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        border: "1px solid rgba(255,255,255,0.5)",
        background: "rgba(255, 255, 255, 0.6)",
        backdropFilter: "blur(12px)",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h6">Attendance History</Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              size="small"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              size="small"
              type="date"
              label="Start Date"
              InputLabelProps={{ shrink: true }}
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
            <TextField
              size="small"
              type="date"
              label="End Date"
              InputLabelProps={{ shrink: true }}
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ "& th": { fontWeight: 600, color: "text.secondary", borderBottom: "2px solid", borderColor: "divider" } }}>
                <TableCell>Date</TableCell>
                <TableCell>Employee</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Clock In</TableCell>
                <TableCell>Clock Out</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">Loading...</TableCell>
                </TableRow>
              ) : filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">No records found</TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => (
                  <TableRow key={record._id} hover>
                    <TableCell>
                      {new Date(record.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {record.employeeId?.userId?.name || "Unknown"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {record.employeeId?.position || "Employee"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={record.status}
                        color={getStatusColor(record.status) as any}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{formatTime(record.clockIn)}</TableCell>
                    <TableCell>{formatTime(record.clockOut)}</TableCell>
                    <TableCell>{formatDuration(record.workDuration)}</TableCell>
                    <TableCell>
                      {record.notes && (
                        <Tooltip title={record.notes}>
                          <IconButton size="small">
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
