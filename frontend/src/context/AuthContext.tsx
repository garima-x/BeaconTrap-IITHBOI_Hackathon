import React, { createContext, useContext, useState, ReactNode } from "react";

export interface UserSession {
  username: string;
  name: string;
  role: "ANALYST" | "BANK_OFFICER" | "CITIZEN" | "AUDITOR" | "ADMIN";
  organization: string;
  clearanceLevel: string;
  jwtToken: string;
  lastLogin: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserSession;
  token: string | null;
  role: string | null;
  login: (token: string, role: "ANALYST" | "BANK_OFFICER" | "CITIZEN" | "AUDITOR" | "ADMIN", name?: string) => void;
  updateRole: (newRole: "ANALYST" | "BANK_OFFICER" | "CITIZEN" | "AUDITOR" | "ADMIN") => void;
  logout: () => void;
}

const DEFAULT_USER: UserSession = {
  username: "harshitaa_analyst",
  name: "Officer Harshitaa",
  role: "ANALYST",
  organization: "Bank of India Cyber Security Taskforce",
  clearanceLevel: "LEVEL-4 RESTRICTED / CERT-IN AUTHORIZED",
  jwtToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJoYXJzaGl0YWEiLCJyb2xlIjoiQU5BTFlTVCIsImlhdCI6MTc4MjM5MH0.signature",
  lastLogin: new Date().toLocaleTimeString() + " - ACTIVE SESSION"
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token") || DEFAULT_USER.jwtToken);
  const [user, setUser] = useState<UserSession>(DEFAULT_USER);

  const login = (jwt: string, userRole: "ANALYST" | "BANK_OFFICER" | "CITIZEN" | "AUDITOR" | "ADMIN", name?: string) => {
    const updatedUser: UserSession = {
      ...DEFAULT_USER,
      name: name || DEFAULT_USER.name,
      role: userRole,
      jwtToken: jwt,
      lastLogin: new Date().toLocaleTimeString() + " - ACTIVE SESSION"
    };
    localStorage.setItem("token", jwt);
    localStorage.setItem("role", userRole);
    setToken(jwt);
    setUser(updatedUser);
  };

  const updateRole = (newRole: "ANALYST" | "BANK_OFFICER" | "CITIZEN" | "AUDITOR" | "ADMIN") => {
    localStorage.setItem("role", newRole);
    setUser(prev => ({ ...prev, role: newRole }));
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken(null);
    setUser({
      ...DEFAULT_USER,
      name: "Guest Investigator",
      role: "ANALYST",
      clearanceLevel: "UNAUTHENTICATED GUEST",
      jwtToken: "GUEST_EXPIRED_TOKEN"
    });
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated: !!token && token !== "GUEST_EXPIRED_TOKEN", 
      user, 
      token, 
      role: user.role, 
      login, 
      updateRole, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
