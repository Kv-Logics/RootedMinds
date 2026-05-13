import ChatPanel from "@/components/ChatPanel";
import { Bot, Sparkles } from "lucide-react";

export default function AIConsolePage() {
  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-brand-500/20 border border-brand-500/30">
          <Bot className="w-5 h-5 text-brand-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            AI Console
            <Sparkles className="w-5 h-5 text-amber-400" />
          </h1>
          <p className="text-gray-500 text-sm">Chat with Gemini / OpenAI via your FastAPI backend</p>
        </div>
      </div>

      <div className="h-[calc(100vh-180px)]">
        <ChatPanel
          systemPrompt="You are an expert AI assistant helping a hackathon team build amazing software. Be concise, technical, and helpful."
          placeholder="Ask me to help with code, architecture, ideas..."
        />
      </div>
    </div>
  );
}
