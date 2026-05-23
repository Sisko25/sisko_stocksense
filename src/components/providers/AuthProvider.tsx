"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import useSWR from "swr";

interface AuthContextType {
  user: any | null;
  isPremium: boolean;
  isLoading: boolean;
  mutateUser: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isPremium: false,
  isLoading: true,
  mutateUser: () => {},
});

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, mutate, isLoading } = useSWR("/api/auth/me", fetcher);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const user = data?.user || null;
  const isPremium = user?.isPremium || false;

  useEffect(() => {
    // Basic check for Stripe success redirect
    if (typeof window !== "undefined" && user && !user.isPremium && !isUpgrading) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("success") === "true") {
        setIsUpgrading(true);
        // Call upgrade API to mark user as premium
        fetch("/api/auth/upgrade", { method: "POST" }).then(() => {
          mutate();
          // Clean up URL without reloading the page
          window.history.replaceState({}, document.title, window.location.pathname);
          setIsUpgrading(false);
        });
      }
    }
  }, [user, mutate, isUpgrading]);

  return (
    <AuthContext.Provider value={{ user, isPremium, isLoading, mutateUser: mutate }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
