/**
 * Dashboard Layout Component - TalentHR
 * Soft Claymorphism Design
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
import ClayCard from "@/components/ui/clay-card";

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
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", p: 2 }}>
      {/* Logo Area */}
      <Box sx={{ 
        p: 2, 
        mb: 2, 
        display: "flex", 
        alignItems: "center", 
        gap: 2,
        borderRadius: 4,
        background: "linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)",
        boxShadow: "8px 8px 16px rgba(108, 92, 231, 0.2), -8px -8px 16px #ffffff",
        color: "white"
      }}>
        <Box
          sx={{
            bgcolor: "rgba(255,255,255,0.2)",
            p: 1,
            borderRadius: 3,
            display: "flex",
          }}
        >
          <Business sx={{ fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>
            TalentHR
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 500 }}>
            HR Management
          </Typography>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", px: 1 }}>
        <List sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {filteredMenuItems.map((item) => {
            const itemPathWithoutQuery = item.path.split("?")[0];
            const currentPath = pathname;
            const pathMatches = currentPath === itemPathWithoutQuery || currentPath.startsWith(itemPathWithoutQuery + "/");
            let queryMatches = true;
            if (item.path.includes("?")) {
              const itemQueryString = item.path.split("?")[1];
              const itemQueryParams = new URLSearchParams(itemQueryString);
              const currentQueryParams = searchParams;
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
                    borderRadius: 4,
                    py: 1.5,
                    px: 2,
                    transition: "all 0.2s ease-in-out",
                    background: isActive ? "#f0f4f8" : "transparent",
                    boxShadow: isActive 
                      ? "inset 4px 4px 8px #d1d9e6, inset -4px -4px 8px #ffffff" 
                      : "none",
                    "&:hover": {
                      background: !isActive ? "#f8faff" : undefined,
                      transform: !isActive ? "translateX(4px)" : "none",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: isActive ? "primary.main" : "text.secondary",
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
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? "primary.main" : "text.primary",
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Pro Tip Card */}
      <Box sx={{ mt: 2, px: 1 }}>
        <ClayCard
          sx={{
            background: "linear-gradient(135deg, #fdcb6e 0%, #ffeaa7 100%)",
            color: "#d35400",
            p: 2,
            overflow: "hidden",
            border: "none"
          }}
        >
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Typography variant="subtitle2" fontWeight={800}>Pro Tip</Typography>
            <Typography variant="caption" sx={{ display: "block", mt: 0.5, fontWeight: 600 }}>
              Complete your profile to unlock all features.
            </Typography>
          </Box>
          <Notifications sx={{ position: "absolute", right: -10, bottom: -10, fontSize: 60, opacity: 0.2, transform: "rotate(-15deg)" }} />
        </ClayCard>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", bgcolor: "#f0f4f8", minHeight: "100vh" }}>
      {/* Top Bar - Floating Pill */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px - 32px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          mr: { md: 3 },
          mt: { xs: 2, md: 3 },
          right: 0,
          borderRadius: 6,
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(20px)",
          color: "text.primary",
          boxShadow: "12px 12px 24px #d1d9e6, -12px -12px 24px #ffffff",
          border: "1px solid rgba(255,255,255,0.6)",
        }}
      >
        <Toolbar sx={{ minHeight: "70px !important" }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h5" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 800, letterSpacing: "-0.5px" }}>
            {menuItems.find((item) => pathname === item.path)?.title || "Dashboard"}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton 
              sx={{ 
                bgcolor: "#f0f4f8", 
                boxShadow: "4px 4px 8px #d1d9e6, -4px -4px 8px #ffffff",
                "&:hover": { bgcolor: "#e6eaf0" }
              }}
            >
              <Badge badgeContent={0} color="error">
                <Notifications color="action" />
              </Badge>
            </IconButton>

            <IconButton onClick={handleMenuOpen} sx={{ p: 0, ml: 1 }}>
              <Avatar
                sx={{
                  bgcolor: "primary.main",
                  width: 44,
                  height: 44,
                  boxShadow: "4px 4px 8px rgba(108, 92, 231, 0.3), -4px -4px 8px #ffffff",
                  border: "2px solid white"
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
              PaperProps={{
                elevation: 0,
                sx: {
                  mt: 1.5,
                  borderRadius: 4,
                  boxShadow: "12px 12px 24px #d1d9e6, -12px -12px 24px #ffffff",
                  border: "1px solid rgba(255,255,255,0.6)",
                  overflow: "hidden"
                }
              }}
            >
              <MenuItem onClick={() => router.push("/dashboard/profile")} sx={{ py: 1.5, px: 2.5 }}>
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>
                <ListItemText>Profile</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ py: 1.5, px: 2.5 }}>
                <ListItemIcon>
                  <Logout fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText sx={{ color: "error.main" }}>Logout</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Container */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
              bgcolor: "#f0f4f8",
              borderRight: "none"
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
              bgcolor: "transparent", // Transparent to show body bg
              borderRight: "none",
              p: 2
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: "100vh",
          mt: { xs: 10, md: 12 }, // More space for floating header
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
