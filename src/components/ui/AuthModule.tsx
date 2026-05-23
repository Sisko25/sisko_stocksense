"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { GlassButton } from "@/components/ui/GlassButton";

export function AuthModule() {
  const { user, mutateUser, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) return <div className="text-sm text-slate-400">Loading...</div>;

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-300">
          {user.email} {user.isPremium ? <span className="text-emerald-400 text-xs ml-1">(Premium)</span> : ""}
        </span>
        <GlassButton 
          className="text-xs px-3 py-1 bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/40"
          onClick={async () => {
            await fetch("/stockscreen/api/auth/logout", { method: "POST" });
            mutateUser();
          }}
        >
          Logout
        </GlassButton>
      </div>
    );
  }

  return (
    <div className="relative">
      <GlassButton onClick={() => setIsOpen(!isOpen)} className="text-xs px-4 py-2">
        Login / Register
      </GlassButton>
      
      {isOpen && (
        <div className="absolute right-0 top-12 w-64 p-4 rounded-xl glass-panel z-50">
          <h3 className="text-sm font-bold text-white mb-4">{isLogin ? "Login" : "Register"}</h3>
          {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
          <div className="flex flex-col gap-3">
            <input 
              type="email" 
              placeholder="Email" 
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <GlassButton 
              className="w-full bg-indigo-500/20 text-white border-indigo-500/50 mt-2"
              onClick={async () => {
                setError("");
                const endpoint = isLogin ? "/stockscreen/api/auth/login" : "/stockscreen/api/auth/register";
                const res = await fetch(endpoint, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email, password }),
                });
                const data = await res.json();
                if (data.error) {
                  setError(data.error);
                } else {
                  setIsOpen(false);
                  mutateUser();
                }
              }}
            >
              {isLogin ? "Sign In" : "Create Account"}
            </GlassButton>
            <button 
              className="text-xs text-slate-400 mt-2 hover:text-white"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Need an account? Register" : "Have an account? Login"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
