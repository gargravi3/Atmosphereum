"use client";
import { useState } from "react";
import { Send, Sparkles, Plus, BookOpen, Quote } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fmt, cn } from "@/lib/utils";

type Message = {
  role: "user" | "assistant" | "suggestions";
  content: string;
  suggestions?: {
    title: string;
    description: string;
    abate: number;
    save: number;
    confidence: "high" | "medium" | "low";
    sources: string[];
  }[];
};

const SAMPLE_PROMPTS = [
  "Find reduction opportunities for our fleet operations",
  "What can we do about matchday fan travel emissions?",
  "How can we cut stadium electricity waste faster?",
  "Compare PPA vs on-site solar for stadium power",
];

const CANNED_RESPONSE: Message[] = [
  {
    role: "assistant",
    content:
      "Looking at Northfield FC's fleet profile — 14 ops vans + 6 directors' cars, ~92 tCO₂e annually and £138k fuel spend. I pulled analogue reductions from three Sustainpedia case studies and two peer clubs. Here are four ranked opportunities:",
  },
  {
    role: "suggestions",
    content: "",
    suggestions: [
      {
        title: "EV transition for operations vans (14 units)",
        description:
          "Replace diesel Ford Transit fleet with electric equivalents on next lease cycle. Charging via new solar car port covers ~70% of annual demand.",
        abate: 38,
        save: 24_000,
        confidence: "high",
        sources: ["Brentford FC 2024 fleet transition", "DEFRA 2023 EV factors", "Energy Saving Trust 2024"],
      },
      {
        title: "Director car policy — plug-in hybrid minimum",
        description:
          "Update company car scheme to require PHEV or BEV for all eligible grades. BIK tax incentive covers cost premium.",
        abate: 12,
        save: 4_800,
        confidence: "high",
        sources: ["HMRC BIK rates 2024-2025", "Peer fleet benchmark"],
      },
      {
        title: "Telematics-enabled eco-driving",
        description:
          "Install driver behaviour telematics on retained combustion vehicles. Industry data suggests 8-12% fuel reduction.",
        abate: 9,
        save: 11_500,
        confidence: "medium",
        sources: ["Lightfoot 2023 fleet study", "Aviva fleet telematics benchmark"],
      },
      {
        title: "Route optimisation for matchday logistics",
        description:
          "Consolidate kit, catering, and media vehicle trips to stadium on matchdays. Route optimisation software targets 15% mileage reduction.",
        abate: 6,
        save: 5_200,
        confidence: "medium",
        sources: ["Route4Me case study 2023", "Internal route audit"],
      },
    ],
  },
  {
    role: "assistant",
    content:
      "Combined, these four initiatives target ~65 tCO₂e (71% of current fleet footprint) at a net-positive £45k/yr savings. Want me to assemble this as a draft portfolio entry, or dig deeper on any one of them?",
  },
];

export default function IdeatePage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);

  const runPrompt = (prompt: string) => {
    setMessages([{ role: "user", content: prompt }]);
    setStreaming(true);
    setInput("");
    // Simulate streaming by revealing messages one at a time
    let i = 0;
    const interval = setInterval(() => {
      if (i >= CANNED_RESPONSE.length) {
        clearInterval(interval);
        setStreaming(false);
        return;
      }
      setMessages((prev) => [...prev, CANNED_RESPONSE[i]]);
      i++;
    }, 800);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="px-8 py-8 border-b border-rule">
        <SectionHeader
          eyebrow="Reduce · AI ideation"
          title="Think louder than a spreadsheet."
          description="Ask about any emission category, facility, or supplier. Atmosphereum cross-references our waste pool, peer initiatives, and the Sustainpedia knowledge base."
        />
      </div>

      {/* Conversation */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <div className="py-16 space-y-10">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 border border-rule bg-paper-soft mb-5">
                  <Sparkles className="w-6 h-6 text-ember" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-2xl tracking-tight mb-2">
                  Where should we start?
                </h3>
                <p className="text-sm text-ink-soft max-w-md mx-auto">
                  Ask a question or try one of these.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {SAMPLE_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => runPrompt(p)}
                    className="text-left p-4 border border-rule bg-paper-soft hover:bg-paper-warm transition-colors group"
                  >
                    <Quote className="w-3 h-3 text-ember mb-2" />
                    <div className="text-sm text-ink-soft group-hover:text-ink transition-colors">
                      {p}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((m, i) => (
                <MessageBubble key={i} message={m} />
              ))}
              {streaming && (
                <div className="flex items-center gap-2 text-xs text-ink-muted font-mono">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-ember animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-ember animate-pulse" style={{ animationDelay: "200ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-ember animate-pulse" style={{ animationDelay: "400ms" }} />
                  </div>
                  Ideating…
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-rule bg-paper-soft/60 backdrop-blur px-8 py-5">
        <div className="max-w-3xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (input.trim()) runPrompt(input.trim());
            }}
            className="flex items-center gap-2"
          >
            <div className="flex-1 relative">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about a category, facility, or supplier…"
                className="w-full h-11 px-4 pr-12 bg-paper border border-rule focus:border-ink-muted outline-none text-sm"
              />
              <button
                type="submit"
                disabled={!input.trim() || streaming}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-ink text-paper hover:bg-ink-soft disabled:opacity-30 flex items-center justify-center transition-colors"
              >
                <Send className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            </div>
            <div className="text-[10px] font-mono text-ink-muted flex items-center gap-1.5 px-2">
              <Sparkles className="w-3 h-3" />
              GPT-4o · Sustainpedia v2
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="bg-ink text-paper px-4 py-2 max-w-lg text-sm">
          {message.content}
        </div>
      </div>
    );
  }
  if (message.role === "suggestions" && message.suggestions) {
    return (
      <div className="space-y-3 animate-fade-in">
        {message.suggestions.map((s, i) => (
          <div key={i} className="border border-rule bg-paper-soft p-5 group hover:border-ink-muted transition-colors">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h4 className="font-display text-lg leading-tight">{s.title}</h4>
              <Button size="sm" variant="outline" className="shrink-0">
                <Plus className="w-3 h-3" />
                Add to portfolio
              </Button>
            </div>
            <p className="text-sm text-ink-soft leading-relaxed mb-4">
              {s.description}
            </p>
            <div className="grid grid-cols-4 gap-4 py-3 border-y border-rule">
              <Metric label="Abatement" value={`${s.abate} tCO₂e`} />
              <Metric label="Annual savings" value={fmt.gbpShort(s.save)} color="moss" />
              <Metric label="Confidence" value={s.confidence} />
              <Metric label="Est. setup" value="6–9 wk" />
            </div>
            <div className="mt-3 flex items-start gap-2 text-[10px] text-ink-muted font-mono">
              <BookOpen className="w-2.5 h-2.5 mt-0.5 shrink-0" />
              <div>
                <span className="uppercase tracking-widest">Sources: </span>
                {s.sources.join(" · ")}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 bg-ember/10 border border-ember/30 flex items-center justify-center shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-ember" strokeWidth={1.5} />
        </div>
        <div className="flex-1 text-sm leading-relaxed text-ink pt-0.5">
          {message.content}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, color = "ink" }: { label: string; value: string; color?: "ink" | "moss" | "ember" }) {
  const c = color === "moss" ? "text-moss" : color === "ember" ? "text-ember" : "text-ink";
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-ink-muted mb-0.5">{label}</div>
      <div className={cn("font-mono tabular font-medium text-sm capitalize", c)}>{value}</div>
    </div>
  );
}
