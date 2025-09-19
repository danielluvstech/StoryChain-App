import React, { createContext, useContext, useEffect, useState } from "react";
import { api, setAuthToken } from "../lib/api";

type AuthContextType = {
  token: string | null;
  user: { id: number; username?: string } | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({} as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: number; username?: string } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("token");
    if (saved) {
      setToken(saved);
      setAuthToken(saved);
      // optional: fetch /me to hydrate user (your /me returns just {id})
      setUser({ id: 0 });
    }
  }, []);

  async function login(username: string, password: string) {
    const { data } = await api.post("/api/auth/login", { username, password });
    setToken(data.accessToken);
    localStorage.setItem("token", data.accessToken);
    setAuthToken(data.accessToken);
    setUser(data.user);
  }

  async function register(username: string, password: string) {
    const { data } = await api.post("/api/auth/register", { username, password });
    setToken(data.accessToken);
    localStorage.setItem("token", data.accessToken);
    setAuthToken(data.accessToken);
    setUser(data.user);
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    setAuthToken(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}