"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { AuthTokenData, CRMUserRole, UserProfile } from "@/types/crm";
import { api, TOKEN_COOKIE_KEY, USER_COOKIE_KEY } from "./api";

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    const token = Cookies.get(TOKEN_COOKIE_KEY);
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get<UserProfile>("/auth/me");
      setUser(response.data);
      Cookies.set(USER_COOKIE_KEY, JSON.stringify(response.data), { expires: 7 });
    } catch {
      Cookies.remove(TOKEN_COOKIE_KEY);
      Cookies.remove(USER_COOKIE_KEY);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Attempt cache read first to avoid layout flash
    const cachedUser = Cookies.get(USER_COOKIE_KEY);
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch {
        // ignore parse error
      }
    }
    refreshUser();
  }, []);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    const response = await api.post<AuthTokenData>("/auth/login", { email, password });
    const { access_token, user: loggedUser } = response.data;

    // Persist token in cookie (expires in 7 days or per token expiry)
    Cookies.set(TOKEN_COOKIE_KEY, access_token, { expires: 7, sameSite: "Lax" });
    Cookies.set(USER_COOKIE_KEY, JSON.stringify(loggedUser), { expires: 7, sameSite: "Lax" });
    setUser(loggedUser);

    return loggedUser;
  };

  const logout = () => {
    Cookies.remove(TOKEN_COOKIE_KEY);
    Cookies.remove(USER_COOKIE_KEY);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
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
