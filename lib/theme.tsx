/**
 * MUI Theme Configuration - TalentHR
 * Soft Claymorphism Design System
 */

"use client";

import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#6c5ce7", // Soft Purple
      light: "#a29bfe",
      dark: "#4834d4",
      contrastText: "#fff",
    },
    secondary: {
      main: "#00cec9", // Soft Teal
      light: "#81ecec",
      dark: "#00b894",
      contrastText: "#fff",
    },
    error: {
      main: "#ff7675", // Soft Red
    },
    warning: {
      main: "#fdcb6e", // Soft Orange
    },
    info: {
      main: "#74b9ff", // Soft Blue
    },
    success: {
      main: "#55efc4", // Soft Green
    },
    background: {
      default: "#f0f4f8", // Very light blue-grey
      paper: "#ffffff",
    },
    text: {
      primary: "#2d3436",
      secondary: "#636e72",
    },
  },
  typography: {
    fontFamily: [
      "Outfit", // Friendly, rounded font (assuming it's loaded or falls back)
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      "sans-serif",
    ].join(","),
    h1: { fontSize: "2.5rem", fontWeight: 700 },
    h2: { fontSize: "2rem", fontWeight: 700 },
    h3: { fontSize: "1.75rem", fontWeight: 700 },
    h4: { fontSize: "1.5rem", fontWeight: 700 },
    h5: { fontSize: "1.25rem", fontWeight: 700 },
    h6: { fontSize: "1rem", fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600, borderRadius: 12 },
  },
  shape: {
    borderRadius: 24, // Much rounder corners
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#f0f4f8",
          backgroundImage: "radial-gradient(circle at 10% 20%, rgba(108, 92, 231, 0.05) 0%, rgba(240, 244, 248, 0) 90%)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          padding: "10px 24px",
          boxShadow: "8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff", // Clay shadow
          transition: "all 0.2s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "10px 10px 20px #d1d9e6, -10px -10px 20px #ffffff",
          },
          "&:active": {
            transform: "translateY(1px)",
            boxShadow: "inset 4px 4px 8px #d1d9e6, inset -4px -4px 8px #ffffff", // Pressed effect
          },
        },
        contained: {
          boxShadow: "8px 8px 16px rgba(108, 92, 231, 0.3), -8px -8px 16px #ffffff",
          "&:hover": {
             boxShadow: "10px 10px 20px rgba(108, 92, 231, 0.4), -10px -10px 20px #ffffff",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          backgroundColor: "#ffffff",
          boxShadow: "12px 12px 24px #d1d9e6, -12px -12px 24px #ffffff", // Clay card shadow
          border: "1px solid rgba(255,255,255,0.8)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 24,
        },
        elevation1: {
          boxShadow: "12px 12px 24px #d1d9e6, -12px -12px 24px #ffffff",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
        },
      },
    },
  },
});
