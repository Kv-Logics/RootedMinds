import Link from "next/link";
import { ArrowRight, Zap, Bot, Database, Shield } from "lucide-react";

const FEATURES = [
  {
    icon: <Zap className="w-5 h-5 text-brand-400" />,
    title: "Lightning Fast",
    desc: "Next.js 14 + FastAPI async backend for sub-100ms responses.",
  },
  {
    icon: <Bot className="w-5 h-5 text-purple-400" />,
    title: "AI-Powered",
    desc: "Gemini & OpenAI integrations ready out of the box.",
  },
  {
    icon: <Database className="w-5 h-5 text-cyan-400" />,
    title: "Persistent Storage",
    desc: "SQLite + async SQLAlchemy — swap to PostgreSQL in one line.",
  },
  {
    icon: <Shield className="w-5 h-5 text-emerald-400" />,
    title: "Production Ready",
    desc: "CORS, env management, typed API client, and error handling.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 relative overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(74,90,240,0.12) 0%, transparent 70%)",
          }}
        />

        <div className="animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 badge-info mb-6 text-sm px-4 py-1.5">
            <Zap className="w-3.5 h-3.5" />
            Built for The Anvil Hackathon 2026
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            Build{" "}
            <span className="text-gradient animate-gradient">Faster.</span>
            <br />
            Win{" "}
            <span className="text-gradient animate-gradient">Bigger.</span>
          </h1>

          <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
            A production-grade Next.js + FastAPI boilerplate with AI, database,
            real-time APIs — ready to fork and ship in minutes.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/dashboard" id="cta-dashboard" className="btn-primary text-base px-8 py-3.5">
              Open Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              id="cta-api-docs"
              className="btn-secondary text-base px-8 py-3.5"
            >
              API Docs
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto w-full px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="glass-hover p-5 animate-slide-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="mb-3">{f.icon}</div>
              <h3 className="text-sm font-semibold text-white mb-1">{f.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
