"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getProfile } from "@/lib/supabase/api";
import type { UserRole } from "@/lib/types";

interface UserContextType {
  role: UserRole | null;
  isAdmin: boolean;
  isManager: boolean;
  isViewer: boolean;
  canEdit: boolean; // admin or manager
  canDelete: boolean; // admin or manager
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  role: null,
  isAdmin: false,
  isManager: false,
  isViewer: false,
  canEdit: false,
  canDelete: false,
  loading: true,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserRole() {
      try {
        const profile = await getProfile();
        setRole(profile?.role || null);
      } catch (error) {
        console.error("Failed to load user role:", error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    }

    loadUserRole();
  }, []);

  const value: UserContextType = {
    role,
    isAdmin: role === "admin",
    isManager: role === "manager",
    isViewer: role === "viewer",
    canEdit: role === "admin" || role === "manager",
    canDelete: role === "admin" || role === "manager",
    loading,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
