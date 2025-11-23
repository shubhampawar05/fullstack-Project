/**
 * Dashboard Layout Component - TalentHR
 * Shared layout for all dashboard pages with sidebar and header
 */

"use client";

import { useState, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Badge,
  CircularProgress,
  Card,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Mail,
  Settings,
  Business,
  Logout,
  AccountCircle,
  Notifications,
  ChevronLeft,
  AccessTime,
  School,
  AttachMoney,
} from "@mui/icons-material";

const DRAWER_WIDTH = 280;

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "company_admin" | "hr_manager" | "recruiter" | "manager" | "employee";
}

interface MenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  roles?: string[]; // If not specified, available to all roles
  badge?: number;
}

function DashboardLayoutContent({
  children,
  role,
}: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout: authLogout } = useAuth();

  // Menu items based on role
  const menuItems: MenuItem[] = [
    {
      title: "Dashboard",
      path: `/dashboard/${role === "company_admin" ? "admin" : role}`,
      icon: <Dashboard />,
    },
    ...(role === "company_admin" || role === "hr_manager"
      ? [
          {
            title: "Invitations",
            path: "/dashboard/invitations",
            icon: <Mail />,
            roles: ["company_admin", "hr_manager"],
          },
        ]
      : []),
    ...(role === "company_admin" || role === "hr_manager"
      ? [
          {
            title: "Users",
            path: "/dashboard/users",
            icon: <People />,
            roles: ["company_admin", "hr_manager"],
          },
        ]
      : []),
    ...(role === "company_admin" || role === "hr_manager" || role === "manager"
      ? [
          {
            title: "Employees",
            path: "/dashboard/employees",
            icon: <People />,
            roles: ["company_admin", "hr_manager", "manager"],
          },
        ]
      : []),
    {
      title: "Attendance",
      path: "/dashboard/attendance",
      icon: <AccessTime />,
    },
    {
      title: "Learning & Development",
      path: "/dashboard/learning",
      icon: <School />,
    },
    {
      title: "Payroll",
      path: "/dashboard/payroll",
      icon: <AttachMoney />,
    },
    ...(role === "company_admin"
      ? [
          {
            title: "Company Settings",
            path: "/dashboard/settings",
            icon: <Settings />,
            roles: ["company_admin"],
          },
        ]
      : []),
  ];

  // Filter menu items based on role
  const filteredMenuItems = menuItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await authLogout();
  };

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Toolbar
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          minHeight: "80px !important",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              p: 0.8,
              borderRadius: 2,
              display: "flex",
            }}
          >
            <Business sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" noWrap component="div" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              TalentHR
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8, display: "block", lineHeight: 1 }}>
              HR Management
            </Typography>
          </Box>
        </Box>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle} sx={{ color: "white" }}>
            <ChevronLeft />
          </IconButton>
        )}
      </Toolbar>
      
      <Box sx={{ p: 2, flexGrow: 1, overflowY: "auto" }}>
        <List sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          {filteredMenuItems.map((item) => {
            // Check if path matches (handle query params)
            const itemPathWithoutQuery = item.path.split("?")[0];
            const currentPath = pathname;
            
            // Check if path matches
            const pathMatches = currentPath === itemPathWithoutQuery || 
                               currentPath.startsWith(itemPathWithoutQuery + "/");
            
            // Check if query params match (if item has query params)
            let queryMatches = true;
            if (item.path.includes("?")) {
              const itemQueryString = item.path.split("?")[1];
              const itemQueryParams = new URLSearchParams(itemQueryString);
              const currentQueryParams = searchParams;
              
              // Check if all query params from item match current query params
              queryMatches = Array.from(itemQueryParams.entries()).every(([key, value]) => {
                return currentQueryParams.get(key) === value;
              });
            }
            
            const isActive = pathMatches && queryMatches;
            
            return (
              <ListItem key={item.title} disablePadding>
                <ListItemButton
                  component={Link}
                  href={item.path}
                  selected={isActive}
                  onClick={() => {
                    if (isMobile) setMobileOpen(false);
                  }}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    py: 1.5,
                    px: 2,
                    transition: "all 0.2s ease-in-out",
                    "&.Mui-selected": {
                      background: "linear-gradient(90deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%)",
                      color: "primary.main",
                      borderLeft: "4px solid",
                      borderColor: "primary.main",
                      "&:hover": {
                        background: "linear-gradient(90deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.1) 100%)",
                      },
                      "& .MuiListItemIcon-root": {
                        color: "primary.main",
                      },
                    },
                    "&:hover": {
                      backgroundColor: "rgba(0,0,0,0.02)",
                      transform: "translateX(4px)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: isActive ? "primary.main" : "text.secondary",
                      transition: "color 0.2s",
                    }}
                  >
                    {item.badge ? (
                      <Badge badgeContent={item.badge} color="error">
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.title} 
                    primaryTypographyProps={{ 
                      fontWeight: isActive ? 600 : 500,
                      fontSize: "0.95rem",
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
        <Card
            elevation={0}
            sx={{
                background: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
                color: "white",
                borderRadius: 3,
                p: 2,
                position: "relative",
                overflow: "hidden"
            }}
        >
            <Box sx={{ position: "relative", zIndex: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold">Pro Tip</Typography>
                <Typography variant="caption" sx={{ display: "block", mt: 0.5, opacity: 0.9 }}>
                    Complete your profile to unlock all features.
                </Typography>
            </Box>
            <Box 
                sx={{ 
                    position: "absolute", 
                    right: -10, 
                    bottom: -10, 
                    opacity: 0.2, 
                    transform: "rotate(-15deg)" 
                }}
            >
                <Notifications sx={{ fontSize: 60 }} />
            </Box>
        </Card>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", bgcolor: "#f5f7fa", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px - 32px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          mr: { md: "16px" },
          mt: { md: "16px" },
          right: 0,
          borderRadius: 3,
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(12px)",
          color: "text.primary",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          border: "1px solid rgba(255,255,255,0.5)",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {menuItems.find((item) => pathname === item.path)?.title || "Dashboard"}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton color="inherit">
              <Badge badgeContent={0} color="error">
                <Notifications />
              </Badge>
            </IconButton>

            <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
              <Avatar
                sx={{
                  bgcolor: "primary.main",
                  width: 40,
                  height: 40,
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <MenuItem onClick={() => router.push("/dashboard/profile")}>
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>
                <ListItemText>Profile</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: "100vh",
          mt: { xs: 8, md: 10 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default function DashboardLayout({
  children,
  role,
}: DashboardLayoutProps) {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          <CircularProgress />
        </Box>
      }
    >
      <DashboardLayoutContent role={role}>{children}</DashboardLayoutContent>
    </Suspense>
  );
}

