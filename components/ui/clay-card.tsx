"use client";

import { Card, CardProps, useTheme } from "@mui/material";

interface ClayCardProps extends CardProps {
  children: React.ReactNode;
  active?: boolean;
}

export default function ClayCard({ children, sx = {}, active = false, ...props }: ClayCardProps) {
  const theme = useTheme();
  
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 6,
        background: active ? "#f8faff" : "#ffffff",
        boxShadow: active 
          ? "inset 6px 6px 12px #d1d9e6, inset -6px -6px 12px #ffffff" // Pressed state
          : "12px 12px 24px #d1d9e6, -12px -12px 24px #ffffff", // Floating state
        border: "1px solid rgba(255,255,255,0.6)",
        transition: "all 0.3s ease",
        position: "relative",
        overflow: "visible",
        "&:hover": {
          transform: !active ? "translateY(-4px)" : "none",
          boxShadow: !active 
            ? "16px 16px 32px #d1d9e6, -16px -16px 32px #ffffff"
            : undefined,
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Card>
  );
}
