"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Customer = { id: string; name: string; phone: string; email?: string | null };

type AuthContextValue = {
  customer: Customer | null;
  loading: boolean;
  loginModalOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setCustomer(data.ok && data.customer ? data.customer : null);
    } catch {
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setCustomer(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        customer,
        loading,
        loginModalOpen,
        openLogin: () => setLoginModalOpen(true),
        closeLogin: () => setLoginModalOpen(false),
        refresh,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
