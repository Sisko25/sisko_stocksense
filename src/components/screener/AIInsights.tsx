"use client";

import useSWR from "swr";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Zap, BrainCircuit, BarChart3, Loader2, Send } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { useAuth } from "@/components/providers/AuthProvider";

import ReactMarkdown from "react-markdown";

const fetchAIInsights = async (url: string, ticker: string) => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ticker }),
  });
  return res.json();
};

type ChatMessage = { role: "user" | "assistant"; content: string };

export function AIInsights({ selectedTicker }: { selectedTicker: string }) {
  const { user, isPremium } = useAuth();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  
  const { data, isLoading } = useSWR(
    selectedTicker ? ["/stockscreen/api/ai/insights", selectedTicker] : null,
    ([url, ticker]) => fetchAIInsights(url, ticker)
  );

  useEffect(() => {
    setChatMessages([]);
  }, [selectedTicker]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isChatLoading]);

  const handleCheckout = async () => {
    if (!user) {
      alert("Please login or register first before upgrading to Premium.");
      return;
    }
    
    setIsCheckoutLoading(true);
    try {
      const response = await fetch("/stockscreen/api/stripe/checkout", {
        method: "POST",
      });
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Payment setup failed. Check console or API keys.");
        setIsCheckoutLoading(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setIsCheckoutLoading(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const newMessages: ChatMessage[] = [...chatMessages, { role: "user", content: chatInput }];
    setChatMessages(newMessages);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const response = await fetch("/stockscreen/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, ticker: selectedTicker }),
      });
      const data = await response.json();
      if (data.content) {
        setChatMessages([...newMessages, { role: "assistant", content: data.content }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages([...newMessages, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <GlassCard className="flex-1 flex flex-col relative overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <BrainCircuit className="w-5 h-5 text-indigo-400" />
        <h2 className="text-xl font-semibold tracking-tight">Sisko AI Analysis</h2>
      </div>

      <div className={`flex-1 flex flex-col gap-4 ${!isPremium ? "blur-md pointer-events-none select-none" : ""}`}>
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-white/10 rounded w-1/3"></div>
            <div className="h-16 bg-white/10 rounded w-full"></div>
            <div className="h-4 bg-white/10 rounded w-1/4"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                <p className="text-sm text-slate-400 mb-1 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Sentiment
                </p>
                <p className={`text-lg font-bold ${data?.sentiment === 'Bullish' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {data?.sentiment || "Bullish"}
                </p>
              </div>
              <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                <p className="text-sm text-slate-400 mb-1 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" /> Quant Score
                </p>
                <p className="text-lg font-bold text-white">
                  {data?.quantScore || "85"} <span className="text-xs text-slate-500 font-normal">/ 100</span>
                </p>
              </div>
            </div>
            
            <div className="bg-black/20 p-4 rounded-xl border border-white/5">
              <p className="text-sm text-slate-400 mb-2">Sisko Institutional Summary</p>
              <p className="text-sm text-slate-200 leading-relaxed">
                {data?.summary || `Sisko AI has analyzed ${selectedTicker || 'the asset'} based on recent technical breakouts and fundamental volume shifts. The stock is demonstrating strong momentum.`}
              </p>
            </div>

            {/* Chat Interface */}
            <div className="flex-1 flex flex-col bg-black/20 rounded-xl border border-white/5 overflow-hidden min-h-[300px] max-h-[400px]">
              <div className="bg-white/5 px-4 py-2 border-b border-white/5">
                <p className="text-xs text-slate-400">Chat with FinKing v2 pro</p>
              </div>
              
              <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 && (
                  <p className="text-xs text-slate-500 text-center mt-4">Ask a question about {selectedTicker}...</p>
                )}
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`text-sm px-4 py-3 rounded-xl max-w-[95%] ${msg.role === 'user' ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-100' : 'bg-white/5 border border-white/10 text-slate-300'}`}>
                      {msg.role === 'user' ? (
                        msg.content
                      ) : (
                        <div className="prose prose-sm prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex items-start">
                    <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-xl">
                      <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleChatSubmit} className="p-3 border-t border-white/5 flex gap-2">
                <input
                  type="text"
                  placeholder="Ask follow-up questions..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={isChatLoading}
                />
                <GlassButton type="submit" disabled={isChatLoading || !chatInput.trim()} className="px-4">
                  <Send className="w-4 h-4" />
                </GlassButton>
              </form>
            </div>
          </>
        )}
      </div>

      {!isPremium && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center"
        >
          <div className="bg-slate-900/80 p-6 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl max-w-sm w-full">
            <Lock className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Unlock Sisko Premium</h3>
            <p className="text-xs text-slate-300 mb-4">
              Access real-time FinKing v2 pro sentiment analysis, proprietary Quant Scores, and interactive chat.
            </p>
            <GlassButton 
              onClick={handleCheckout} 
              disabled={isCheckoutLoading}
              className="w-full bg-indigo-500/20 hover:bg-indigo-500/40 border-indigo-500/50 disabled:opacity-50"
            >
              {isCheckoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upgrade to Premium - $49"}
            </GlassButton>
          </div>
        </motion.div>
      )}
    </GlassCard>
  );
}
