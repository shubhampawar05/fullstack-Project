"use client";

import { Button, ButtonProps, useTheme } from "@mui/material";

interface ClayButtonProps extends ButtonProps {
  variant?: "contained" | "outlined" | "text";
}

export default function ClayButton({ children, sx = {}, variant = "contained", ...props }: ClayButtonProps) {
  const theme = useTheme();
  
  const isContained = variant === "contained";
  
  return (
    <Button
      variant={variant}
      sx={{
        borderRadius: 4,
        textTransform: "none",
        fontWeight: 600,
        padding: "10px 24px",
        boxShadow: isContained 
          ? "8px 8px 16px rgba(108, 92, 231, 0.25), -8px -8px 16px #ffffff" 
          : "6px 6px 12px #d1d9e6, -6px -6px 12px #ffffff",
        transition: "all 0.2s ease",
        color: isContained ? "white" : theme.palette.text.primary,
        background: isContained ? undefined : "#f0f4f8",
        border: variant === "outlined" ? "1px solid rgba(255,255,255,0.5)" : "none",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: isContained
            ? "10px 10px 20px rgba(108, 92, 231, 0.35), -10px -10px 20px #ffffff"
            : "8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff",
          background: isContained ? undefined : "#f8faff",
        },
        "&:active": {
          transform: "translateY(1px)",
          boxShadow: "inset 4px 4px 8px rgba(0,0,0,0.1), inset -4px -4px 8px rgba(255,255,255,0.8)",
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
}
