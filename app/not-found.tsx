/**
 * 404 Not Found Page - TalentHR
 */

"use client";

import Link from "next/link";
import { Box, Container, Typography, Button, Paper } from "@mui/material";
import { Home, Search } from "@mui/icons-material";

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper sx={{ p: 6, textAlign: "center" }}>
          <Typography
            variant="h1"
            component="div"
            sx={{ fontSize: "6rem", mb: 2 }}
          >
            🔍
          </Typography>
          <Typography variant="h3" component="h1" gutterBottom fontWeight={600}>
            404
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            gutterBottom
            sx={{ mb: 2 }}
          >
            Page Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="contained"
              component={Link}
              href="/"
              startIcon={<Home />}
            >
              Go Home
            </Button>
            <Button
              variant="outlined"
              component={Link}
              href="/login"
              startIcon={<Search />}
            >
              Sign In
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
