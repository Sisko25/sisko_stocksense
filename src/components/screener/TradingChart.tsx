"use client";

import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";
import { GlassCard } from "@/components/ui/GlassCard";

export function TradingChart({ selectedTicker }: { selectedTicker: string }) {
  // Ensure the ticker maps properly to TradingView symbols if needed. 
  // By default, TradingView can auto-resolve most US equity symbols just by ticker.
  // We prepend NASDAQ: or just let TradingView auto-resolve. 
  // We'll let TradingView auto-resolve by passing just the symbol or prepending a default exchange if necessary.
  // TradingView usually prefers "EXCHANGE:TICKER", but just "TICKER" works well for auto-search.
  
  return (
    <GlassCard className="w-full h-[500px] p-2">
      <div className="w-full h-full rounded-xl overflow-hidden">
        <AdvancedRealTimeChart 
          theme="dark" 
          symbol={selectedTicker || "NVDA"} 
          height={500}
          width="100%"
          hide_side_toolbar={false}
          backgroundColor="rgba(15, 23, 42, 0.4)" // matches our slate-900 glass bg
          toolbar_bg="rgba(15, 23, 42, 0.6)"
          allow_symbol_change={false}
        />
      </div>
    </GlassCard>
  );
}
