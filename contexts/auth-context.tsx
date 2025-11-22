/**
 * Auth Context - TalentHR
 * Centralized authentication state management to reduce API calls
 */

"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from "react";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  companyId: string;
  status?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const hasFetched = useRef(false);

  // Fetch user data - only called when needed
  const fetchUser = useCallback(async (): Promise<User | null> => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok || response.status === 401) {
        return null;
      }

      const data = await response.json();
      if (data.success && data.user) {
        return data.user;
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch user:", error);
      return null;
    }
  }, []);

  // Initial load - fetch user once (only if not already fetched)
  useEffect(() => {
    if (hasFetched.current) {
      return; // Already fetched, don't fetch again
    }

    let mounted = true;
    hasFetched.current = true;

    const loadUser = async () => {
      const userData = await fetchUser();
      if (mounted) {
        setUser(userData);
        setLoading(false);
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, [fetchUser]);

  // Refresh user data (call this after login, or when user data might have changed)
  const refreshUser = useCallback(async () => {
    const userData = await fetchUser();
    setUser(userData);
    if (!userData) {
      router.push("/login");
    }
  }, [fetchUser, router]);

  // Logout
  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      router.push("/login");
    }
  }, [router]);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    refreshUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

