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
    <Box>
      <Toolbar
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Business />
          <Typography variant="h6" noWrap component="div" fontWeight={600}>
            TalentHR
          </Typography>
        </Box>
        {isMobile && (
          <IconButton
            onClick={handleDrawerToggle}
            sx={{ color: "white" }}
          >
            <ChevronLeft />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <List sx={{ pt: 2 }}>
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
                  "&.Mui-selected": {
                    backgroundColor: "primary.main",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "primary.dark",
                    },
                    "& .MuiListItemIcon-root": {
                      color: "white",
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? "white" : "text.secondary",
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
                <ListItemText primary={item.title} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          background: "white",
          color: "text.primary",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
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

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
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
          backgroundColor: "background.default",
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
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

