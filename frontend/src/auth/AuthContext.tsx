import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import type { AuthUser } from "../types";

type LoginResponse = {
  token: string;
  user: AuthUser;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<AuthUser>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("authToken"));
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem("authUser");
    return stored ? (JSON.parse(stored) as AuthUser) : null;
  });
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    async function loadMe() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get<AuthUser>("/auth/me");
        setUser(response.data);
        localStorage.setItem("authUser", JSON.stringify(response.data));
      } catch {
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    void loadMe();
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      isAdmin: user?.role === "ADMIN",
      async login(username: string, password: string) {
        const response = await api.raw<LoginResponse>("/auth/login", {
          method: "POST",
          body: { username, password }
        });
        localStorage.setItem("authToken", response.token);
        localStorage.setItem("authUser", JSON.stringify(response.user));
        setToken(response.token);
        setUser(response.user);
        return response.user;
      },
      logout() {
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        setToken(null);
        setUser(null);
      }
    }),
    [loading, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return value;
}
