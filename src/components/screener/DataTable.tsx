"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";

// Types
type Stock = {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
  marketCap: number;
  pe: number;
  volume: number;
  exchange: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function DataTable({ selectedTicker }: { selectedTicker?: string }) {
  const [listType, setListType] = useState<"default" | "gainers" | "losers" | "search">("default");
  
  useEffect(() => {
    if (selectedTicker) {
      setListType("search");
    }
  }, [selectedTicker]);

  const url = listType === "search" && selectedTicker 
    ? `/stockscreen/api/screener?ticker=${selectedTicker}`
    : `/stockscreen/api/screener?type=${listType}`;

  const { data: stocks, error, isLoading } = useSWR<Stock[]>(
    url, 
    fetcher, 
    { refreshInterval: 60000 }
  );

  const [sortConfig, setSortConfig] = useState<{ key: keyof Stock; direction: "asc" | "desc" } | null>(null);

  let sortedStocks = stocks ? (Array.isArray(stocks) ? [...stocks] : []) : [];
  if (sortConfig !== null) {
    sortedStocks.sort((a, b) => {
      // Handle missing values
      const valA = a[sortConfig.key] || 0;
      const valB = b[sortConfig.key] || 0;
      
      if (valA < valB) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (valA > valB) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }

  const requestSort = (key: keyof Stock) => {
    let direction: "asc" | "desc" = "desc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  const formatNumber = (num: number) => {
    if (!num) return "-";
    if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    return num.toLocaleString();
  };

  return (
    <GlassCard className="w-full overflow-x-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold tracking-tight">
          {listType === "default" && "Market Overview"}
          {listType === "gainers" && "Top Gainers"}
          {listType === "losers" && "Top Losers"}
          {listType === "search" && `Search: ${selectedTicker}`}
        </h2>
        <div className="flex gap-2">
          <GlassButton 
            className={`text-xs px-3 py-1 ${listType === 'default' ? 'bg-white/20' : ''}`} 
            onClick={() => setListType("default")}
          >
            Overview
          </GlassButton>
          <GlassButton 
            className={`text-xs px-3 py-1 ${listType === 'gainers' ? 'bg-emerald-500/20 text-emerald-400' : ''}`}
            onClick={() => setListType("gainers")}
          >
            Gainers
          </GlassButton>
          <GlassButton 
            className={`text-xs px-3 py-1 ${listType === 'losers' ? 'bg-rose-500/20 text-rose-400' : ''}`}
            onClick={() => setListType("losers")}
          >
            Losers
          </GlassButton>
        </div>
      </div>

      {error ? (
        <div className="text-rose-400 py-8 text-center">Failed to load market data.</div>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 text-sm">
              <th className="py-3 px-4 font-medium cursor-pointer hover:text-white transition-colors" onClick={() => requestSort("symbol")}>Ticker</th>
              <th className="py-3 px-4 font-medium hidden md:table-cell">Company</th>
              <th className="py-3 px-4 font-medium cursor-pointer hover:text-white transition-colors" onClick={() => requestSort("price")}>Price</th>
              <th className="py-3 px-4 font-medium cursor-pointer hover:text-white transition-colors" onClick={() => requestSort("changesPercentage")}>% Change</th>
              <th className="py-3 px-4 font-medium cursor-pointer hover:text-white transition-colors hidden lg:table-cell" onClick={() => requestSort("marketCap")}>Market Cap</th>
              <th className="py-3 px-4 font-medium hidden xl:table-cell">P/E</th>
              <th className="py-3 px-4 font-medium cursor-pointer hover:text-white transition-colors hidden sm:table-cell" onClick={() => requestSort("volume")}>Volume</th>
              <th className="py-3 px-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">Loading live data...</td>
              </tr>
            ) : sortedStocks.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">No stocks found.</td>
              </tr>
            ) : (
              sortedStocks.map((stock) => (
                <tr key={stock.symbol} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="py-4 px-4 font-semibold">{stock.symbol}</td>
                  <td className="py-4 px-4 hidden md:table-cell text-slate-300">{stock.name || stock.symbol}</td>
                  <td className="py-4 px-4">${Number(stock.price).toFixed(2)}</td>
                  <td className={`py-4 px-4 flex items-center gap-1 ${stock.changesPercentage >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {stock.changesPercentage >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {Math.abs(stock.changesPercentage).toFixed(2)}%
                  </td>
                  <td className="py-4 px-4 hidden lg:table-cell text-slate-300">{formatNumber(stock.marketCap)}</td>
                  <td className="py-4 px-4 hidden xl:table-cell text-slate-300">{stock.pe?.toFixed(1) || "-"}</td>
                  <td className="py-4 px-4 hidden sm:table-cell text-slate-300">{formatNumber(stock.volume)}</td>
                  <td className="py-4 px-4 text-right">
                    <a 
                      href={`https://www.tradingview.com/chart/?symbol=${stock.exchange || 'NASDAQ'}:${stock.symbol}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <GlassButton className="ml-auto px-3 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        <Activity className="w-3 h-3 mr-1" /> Trade
                      </GlassButton>
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </GlassCard>
  );
}
