"use client";

import { useState } from "react";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { DataTable } from "@/components/screener/DataTable";
import { AIInsights } from "@/components/screener/AIInsights";
import { WatchlistManager } from "@/components/screener/WatchlistManager";
import { Activity, Search } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { AuthModule } from "@/components/ui/AuthModule";
import dynamic from "next/dynamic";

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const LinkedinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect width="4" height="12" x="2" y="9"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const TradingChart = dynamic(
  () => import("@/components/screener/TradingChart").then((mod) => mod.TradingChart),
  { ssr: false }
);

export default function Home() {
  const [searchInput, setSearchInput] = useState("");
  const [selectedTicker, setSelectedTicker] = useState("NVDA");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSelectedTicker(searchInput.toUpperCase().trim());
      setSearchInput("");
    }
  };

  return (
    <AuthProvider>
      <div className="container mx-auto px-4 py-8 max-w-7xl h-full flex flex-col gap-6">
        {/* Header & Search Bar */}
        <header className="flex flex-col md:flex-row items-center justify-between mb-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/20 p-2 rounded-lg border border-indigo-500/30">
              <Activity className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Sisko Stock Sense</h1>
              <p className="text-xs text-slate-400">Institutional Equity Screener</p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <form onSubmit={handleSearch} className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search ticker (e.g. AAPL)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white/10 transition-colors"
              />
            </form>
            
            <AuthModule />
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          {/* Left Column: Data Table & Chart */}
          <div className="lg:col-span-2 flex flex-col min-h-[600px] gap-6">
            <DataTable selectedTicker={selectedTicker} />
            <TradingChart selectedTicker={selectedTicker} />
          </div>

          {/* Right Column: AI Insights & Watchlists */}
          <div className="flex flex-col gap-6 min-h-[400px]">
            <WatchlistManager selectedTicker={selectedTicker} onSelectTicker={setSelectedTicker} />
            <AIInsights selectedTicker={selectedTicker} />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-slate-400 gap-4">
          <p className="text-sm">© {new Date().getFullYear()} Sisko Capital LLP. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="https://www.instagram.com/siskocapital" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full hover:bg-indigo-500/20 hover:text-indigo-400 transition-colors">
              <InstagramIcon />
            </a>
            <a href="https://www.linkedin.com/company/siskomore-capital" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full hover:bg-indigo-500/20 hover:text-indigo-400 transition-colors">
              <LinkedinIcon />
            </a>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}
