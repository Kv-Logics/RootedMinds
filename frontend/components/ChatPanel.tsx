"use client";
import { useState } from "react";
import { Send, Loader2, Bot, User } from "lucide-react";
import { api } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  systemPrompt?: string;
  placeholder?: string;
}

export default function ChatPanel({
  systemPrompt = "You are a helpful AI assistant.",
  placeholder = "Ask me anything...",
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.ai.chat(input, systemPrompt);
      setMessages((prev) => [...prev, { role: "assistant", content: res.response }]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "AI failed to respond";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ Error: ${message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="glass flex flex-col h-full min-h-[400px]">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/5">
        <div className="p-2 rounded-lg bg-brand-500/20 border border-brand-500/30">
          <Bot className="w-4 h-4 text-brand-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">AI Assistant</p>
          <p className="text-xs text-gray-500">Powered by Gemini</p>
        </div>
        <span className="ml-auto dot-active" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <Bot className="w-8 h-8 text-brand-400 mb-2 animate-float" />
            <p className="text-sm text-gray-500">Start a conversation…</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div
              className={`p-2 rounded-lg h-fit mt-0.5 ${
                msg.role === "user"
                  ? "bg-brand-500/20 border border-brand-500/30"
                  : "bg-white/5 border border-white/8"
              }`}
            >
              {msg.role === "user" ? (
                <User className="w-3.5 h-3.5 text-brand-400" />
              ) : (
                <Bot className="w-3.5 h-3.5 text-gray-400" />
              )}
            </div>
            <div
              className={`max-w-[80%] px-4 py-3 rounded-xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-brand-500/20 text-white border border-brand-500/20"
                  : "bg-white/4 text-gray-200 border border-white/6"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 items-start">
            <div className="p-2 rounded-lg bg-white/5 border border-white/8 h-fit">
              <Bot className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <div className="bg-white/4 border border-white/6 px-4 py-3 rounded-xl">
              <Loader2 className="w-4 h-4 text-brand-400 animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/5">
        <div className="flex gap-2">
          <textarea
            id="chat-input"
            className="input flex-1 resize-none h-10 leading-tight py-2.5"
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
          />
          <button
            id="chat-send-btn"
            className="btn-primary px-4 py-2.5"
            onClick={send}
            disabled={loading || !input.trim()}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
