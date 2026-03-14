import React, { useState } from "react";
import { Search, Loader2, AlertCircle, FileText, TrendingUp } from "lucide-react";
import { searchDocs } from "../utils/api.js";
import toast from "react-hot-toast";

function ScoreBar({ score }) {
  const pct = Math.round(score * 100);
  const color = score > 0.85 ? "#14b8a6" : score > 0.7 ? "#6366f1" : "#f59e0b";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 rounded-full" style={{ background: "#1e293b" }}>
        <div className="h-1 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-mono" style={{ color, minWidth: 36 }}>{pct}%</span>
    </div>
  );
}

function ResultCard({ result, index }) {
  return (
    <div
      className="glass glass-hover rounded-xl p-5 animate-slide-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: "rgba(20,184,166,0.15)", color: "#14b8a6", fontFamily: "Syne, sans-serif" }}
          >
            {result.rank}
          </span>
          <h3 className="font-semibold text-sm truncate" style={{ color: "#e2e8f0", fontFamily: "Syne, sans-serif" }}>
            {result.title}
          </h3>
        </div>
        <span
          className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full"
          style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }}
        >
          {result.collection}
        </span>
      </div>
      <p className="text-sm leading-relaxed mb-3" style={{ color: "#94a3b8" }}>
        {result.excerpt}
      </p>
      <ScoreBar score={result.score} />
      {result.ingestedAt && (
        <p className="text-xs mt-2" style={{ color: "#475569", fontFamily: "JetBrains Mono, monospace" }}>
          ingested: {new Date(result.ingestedAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

function EmptyState({ query }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.15)" }}>
        <FileText size={28} style={{ color: "#334155" }} />
      </div>
      <p className="text-lg font-semibold mb-1" style={{ color: "#475569", fontFamily: "Syne, sans-serif" }}>
        No results found
      </p>
      <p className="text-sm" style={{ color: "#334155" }}>
        Try a different query or ingest more documents
      </p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {[0,1,2].map((i) => (
        <div key={i} className="glass rounded-xl p-5">
          <div className="shimmer h-4 rounded w-1/3 mb-3" />
          <div className="shimmer h-3 rounded w-full mb-2" />
          <div className="shimmer h-3 rounded w-4/5 mb-3" />
          <div className="shimmer h-1 rounded w-full" />
        </div>
      ))}
    </div>
  );
}

export default function SearchPage({ activeCollection }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [topK, setTopK] = useState(5);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    if (!activeCollection) {
      toast.error("Select a collection first");
      return;
    }
    setLoading(true);
    setResults(null);
    try {
      const data = await searchDocs(activeCollection, query, topK);
      setResults(data);
    } catch (err) {
      toast.error(err.response?.data?.error || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "machine learning fundamentals",
    "how does RAG work",
    "vector database overview",
    "neural network architectures",
  ];

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-10 animate-fade-in">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={14} style={{ color: "#14b8a6" }} />
          <span className="text-xs uppercase tracking-widest" style={{ color: "#14b8a6", fontFamily: "JetBrains Mono, monospace" }}>
            Semantic Search
          </span>
        </div>
        <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: "Syne, sans-serif", color: "#f1f5f9" }}>
          Find by Meaning
        </h1>
        <p className="text-base" style={{ color: "#64748b" }}>
          Search across your documents using natural language — not just keywords.
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-6 animate-slide-up">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#475569" }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything about your documents..."
            className="w-full pl-12 pr-32 py-4 rounded-xl text-sm outline-none transition-all"
            style={{
              background: "rgba(15,23,42,0.8)",
              border: "1px solid rgba(51,65,85,0.6)",
              color: "#e2e8f0",
              fontFamily: "DM Sans, sans-serif",
            }}
            onFocus={(e) => { e.target.style.borderColor = "rgba(20,184,166,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(20,184,166,0.08)"; }}
            onBlur={(e) => { e.target.style.borderColor = "rgba(51,65,85,0.6)"; e.target.style.boxShadow = "none"; }}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <select
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              className="text-xs rounded-lg px-2 py-1.5 outline-none"
              style={{ background: "#1e293b", color: "#94a3b8", border: "1px solid #334155" }}
            >
              {[3,5,8,10].map(n => <option key={n} value={n}>Top {n}</option>)}
            </select>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: loading || !query.trim() ? "#1e293b" : "linear-gradient(135deg, #14b8a6, #0d9488)",
                color: loading || !query.trim() ? "#475569" : "white",
                fontFamily: "Syne, sans-serif",
              }}
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : "Search"}
            </button>
          </div>
        </div>

        {/* Suggestions */}
        {!results && !loading && (
          <div className="flex flex-wrap gap-2 mt-3">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setQuery(s)}
                className="text-xs px-3 py-1.5 rounded-full transition-colors"
                style={{
                  background: "rgba(30,41,59,0.8)",
                  color: "#64748b",
                  border: "1px solid #334155",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#14b8a6"; e.currentTarget.style.borderColor = "rgba(20,184,166,0.3)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderColor = "#334155"; }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Results */}
      {loading && <Skeleton />}

      {results && !loading && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm" style={{ color: "#64748b" }}>
              <span style={{ color: "#14b8a6", fontWeight: 600 }}>{results.totalResults}</span> results for{" "}
              <span style={{ color: "#e2e8f0" }}>"{results.query}"</span>
            </p>
            <span className="text-xs px-2 py-1 rounded-md" style={{ background: "#0f172a", color: "#475569", fontFamily: "JetBrains Mono, monospace" }}>
              {activeCollection}
            </span>
          </div>

          {results.results?.length === 0 ? (
            <EmptyState query={query} />
          ) : (
            <div className="space-y-3">
              {results.results.map((r, i) => <ResultCard key={r.id} result={r} index={i} />)}
            </div>
          )}
        </div>
      )}

      {/* Initial state */}
      {!results && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
            style={{ background: "rgba(20,184,166,0.06)", border: "1px solid rgba(20,184,166,0.12)" }}
          >
            <Search size={32} style={{ color: "#334155" }} />
          </div>
          <p className="text-lg font-semibold mb-1" style={{ color: "#475569", fontFamily: "Syne, sans-serif" }}>
            Start searching
          </p>
          <p className="text-sm" style={{ color: "#334155" }}>
            Enter a query above to find semantically similar documents
          </p>
        </div>
      )}
    </div>
  );
}



