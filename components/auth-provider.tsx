"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Role = "admin" | "inventory" | "documents" | "health" | "finance" | null;

interface AuthContextType {
  role: Role;
  setRole: (role: Role) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  role: null,
  setRole: () => {},
  isLoading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedRole = localStorage.getItem("smartbarangay_role") as Role;
    if (savedRole) {
      setRoleState(savedRole);
    }
    setIsLoading(false);
  }, []);

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    if (newRole) {
      localStorage.setItem("smartbarangay_role", newRole);
    } else {
      localStorage.removeItem("smartbarangay_role");
    }
  };

  return (
    <AuthContext.Provider value={{ role, setRole, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
