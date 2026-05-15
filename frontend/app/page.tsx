import Link from "next/link";
import { ArrowRight, Zap, Bot, Database, Shield } from "lucide-react";

const FEATURES = [
  {
    icon: <Zap className="w-5 h-5 text-sarvam-saffron" />,
    title: "Lightning Fast",
    desc: "Next.js 14 + FastAPI async backend for sub-100ms responses.",
  },
  {
    icon: <Bot className="w-5 h-5 text-sarvam-saffron" />,
    title: "AI-Powered",
    desc: "Gemini & OpenAI integrations ready out of the box.",
  },
  {
    icon: <Database className="w-5 h-5 text-sarvam-saffron" />,
    title: "Persistent Storage",
    desc: "SQLite + async SQLAlchemy — swap to PostgreSQL in one line.",
  },
  {
    icon: <Shield className="w-5 h-5 text-sarvam-saffron" />,
    title: "Production Ready",
    desc: "CORS, env management, typed API client, and error handling.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-[#131313] text-white">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-32 relative overflow-hidden">
        <div className="animate-fade-in z-10 flex flex-col items-center max-w-4xl">
          
          {/* Subtle Decorative Element */}
          <div className="mb-8 flex items-center justify-center space-x-2 opacity-80">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-sarvam-saffron"></div>
            <span className="text-sarvam-saffron font-serif italic text-sm tracking-widest uppercase">The Anvil Hackathon</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-sarvam-saffron"></div>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-serif font-light leading-tight mb-8 tracking-tight">
            Build <span className="italic text-white/90">Faster.</span><br />
            Win <span className="text-gradient-brand animate-gradient">Bigger.</span>
          </h1>

          <p className="text-lg md:text-xl text-[#999999] max-w-2xl mx-auto mb-12 font-sans font-light leading-relaxed">
            A production-grade Next.js + FastAPI boilerplate built on sovereign compute. 
            Powered by frontier-class models, ready to fork and ship in minutes.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto">
            <Link href="/dashboard" id="cta-dashboard" className="btn-primary w-full sm:w-auto">
              Open Dashboard
            </Link>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              id="cta-api-docs"
              className="btn-secondary w-full sm:w-auto"
            >
              API Docs
            </a>
          </div>
          
          <div className="mt-16 text-xs font-sans tracking-[0.2em] text-[#555555] uppercase">
            Built for Population-Scale Impact
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto w-full px-6 pb-32 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="glass-hover p-8 rounded-2xl animate-slide-up bg-black/40 border border-white/5 backdrop-blur-md"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <div className="mb-5 bg-white/5 w-12 h-12 rounded-full flex items-center justify-center border border-white/10">
                {f.icon}
              </div>
              <h3 className="text-lg font-serif text-white mb-2">{f.title}</h3>
              <p className="text-sm font-sans text-[#888888] leading-relaxed font-light">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
