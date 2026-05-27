"use client";

import { useState } from "react";
import useSWR from "swr";
import { useAuth } from "@/components/providers/AuthProvider";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { Plus, Trash2, ChevronRight, Activity, BrainCircuit } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Watchlist = {
  id: string;
  name: string;
  tickers: string[];
};

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function WatchlistManager({ 
  selectedTicker, 
  onSelectTicker 
}: { 
  selectedTicker: string;
  onSelectTicker: (ticker: string) => void 
}) {
  const { user, isPremium } = useAuth();
  const { data, mutate, isLoading } = useSWR(user ? "/stockscreen/api/watchlists" : null, fetcher);
  
  const [newListName, setNewListName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const watchlists: Watchlist[] = data?.watchlists || [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim() || isCreating) return;

    setIsCreating(true);
    const res = await fetch("/stockscreen/api/watchlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newListName.trim() }),
    });

    const json = await res.json();
    if (json.error) {
      alert(json.error);
    } else {
      setNewListName("");
      mutate();
    }
    setIsCreating(false);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this watchlist?")) return;
    
    await fetch(`/stockscreen/api/watchlists?id=${id}`, { method: "DELETE" });
    if (activeListId === id) setActiveListId(null);
    mutate();
  };

  const handleRemoveTicker = async (list: Watchlist, tickerToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedTickers = list.tickers.filter(t => t !== tickerToRemove);
    await fetch("/stockscreen/api/watchlists", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: list.id, tickers: updatedTickers }),
    });
    mutate();
  };

  const handleAddTicker = async (list: Watchlist, e: React.MouseEvent) => {
    e.stopPropagation();
    if (list.tickers.includes(selectedTicker)) {
      alert(`${selectedTicker} is already in this watchlist.`);
      return;
    }
    const updatedTickers = [...list.tickers, selectedTicker];
    await fetch("/stockscreen/api/watchlists", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: list.id, tickers: updatedTickers }),
    });
    mutate();
  };

  const handleAnalyze = async (list: Watchlist) => {
    if (!isPremium) {
      alert("Watchlist AI Analysis is a Premium feature. Please upgrade.");
      return;
    }
    if (list.tickers.length === 0) {
      alert("Add some stocks to the watchlist first!");
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysis(null);
    try {
      const res = await fetch("/stockscreen/api/ai/watchlist-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickers: list.tickers, name: list.name }),
      });
      const json = await res.json();
      if (json.error) alert(json.error);
      else setAnalysis(json.analysis);
    } catch (error) {
      console.error(error);
    }
    setIsAnalyzing(false);
  };

  if (!user) {
    return (
      <GlassCard className="h-full flex flex-col items-center justify-center text-center p-8">
        <Activity className="w-12 h-12 text-slate-500 mb-4 opacity-50" />
        <h3 className="text-lg font-semibold text-white mb-2">Watchlists</h3>
        <p className="text-sm text-slate-400">Login to create and manage your custom watchlists.</p>
      </GlassCard>
    );
  }

  const activeList = watchlists.find(w => w.id === activeListId);

  return (
    <GlassCard className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
          Watchlists
        </h2>
        <span className="text-xs text-slate-400 bg-white/5 px-2 py-1 rounded-full">
          {watchlists.length} / 5
        </span>
      </div>

      {!activeList ? (
        <div className="flex flex-col gap-4 flex-1">
          {isLoading ? (
            <div className="text-sm text-slate-400 text-center py-4">Loading...</div>
          ) : watchlists.length > 0 ? (
            <div className="flex flex-col gap-2">
              {watchlists.map(list => (
                <div 
                  key={list.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                  onClick={() => { setActiveListId(list.id); setAnalysis(null); }}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">{list.name}</span>
                    <span className="text-xs text-slate-400">{list.tickers.length} symbols</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => handleDelete(list.id, e)}
                      className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-400 text-center py-8">No watchlists yet.</div>
          )}

          {watchlists.length < 5 && (
            <form onSubmit={handleCreate} className="mt-auto pt-4 border-t border-white/10 flex gap-2">
              <input
                type="text"
                placeholder="New watchlist name..."
                value={newListName}
                onChange={e => setNewListName(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
              />
              <GlassButton type="submit" disabled={isCreating || !newListName.trim()} className="px-3">
                <Plus className="w-4 h-4" />
              </GlassButton>
            </form>
          )}
        </div>
      ) : (
        <div className="flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
            <button onClick={() => setActiveListId(null)} className="text-xs text-indigo-400 hover:text-indigo-300">
              &larr; Back
            </button>
            <h3 className="text-md font-semibold text-white ml-2">{activeList.name}</h3>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {activeList.tickers.length === 0 ? (
              <span className="text-sm text-slate-400 italic">Empty. Add stocks from the screener.</span>
            ) : (
              activeList.tickers.map(t => (
                <div key={t} className="flex items-center gap-1 bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-md text-xs border border-indigo-500/30 cursor-pointer hover:bg-indigo-500/30 transition-colors" onClick={() => onSelectTicker(t)}>
                  <span className="font-semibold">{t}</span>
                  <button 
                    onClick={(e) => handleRemoveTicker(activeList, t, e)}
                    className="ml-1 text-indigo-400 hover:text-rose-400"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
            
            {!activeList.tickers.includes(selectedTicker) && (
              <button 
                onClick={(e) => handleAddTicker(activeList, e)}
                className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md text-xs border border-emerald-500/20 cursor-pointer hover:bg-emerald-500/20 transition-colors"
              >
                <Plus className="w-3 h-3" /> Add {selectedTicker}
              </button>
            )}
          </div>

          <GlassButton 
            className="w-full justify-center bg-indigo-600/30 text-indigo-300 border-indigo-500/40 hover:bg-indigo-600/50 py-2 mb-4"
            onClick={() => handleAnalyze(activeList)}
            disabled={isAnalyzing || activeList.tickers.length === 0}
          >
            <BrainCircuit className="w-4 h-4 mr-2" />
            {isAnalyzing ? "Analyzing Portfolio..." : "Analyze with FinKing v2 Pro"}
          </GlassButton>

          {analysis && (
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar mt-2 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{analysis}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}
