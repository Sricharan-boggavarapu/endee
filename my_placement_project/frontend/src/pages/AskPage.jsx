import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, BookOpen } from "lucide-react";
import { askQuestion } from "../utils/api.js";
import toast from "react-hot-toast";

function SourceChip({ source }) {
  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
      style={{
        background: "rgba(99,102,241,0.1)",
        border: "1px solid rgba(99,102,241,0.2)",
        color: "#818cf8",
      }}
    >
      <span style={{ color: "#475569" }}>#{source.rank}</span>
      {source.title}
      <span
        className="ml-1 px-1.5 py-0.5 rounded text-xs"
        style={{ background: "rgba(99,102,241,0.2)", color: "#a5b4fc", fontFamily: "JetBrains Mono, monospace" }}
      >
        {Math.round(source.score * 100)}%
      </span>
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""} animate-slide-up`}>
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: isUser
            ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
            : "linear-gradient(135deg, #14b8a6, #0d9488)",
        }}
      >
        {isUser ? <User size={14} color="white" /> : <Bot size={14} color="white" />}
      </div>
      <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-2`}>
        <div
          className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
          style={{
            background: isUser ? "rgba(99,102,241,0.15)" : "rgba(15,23,42,0.8)",
            border: isUser ? "1px solid rgba(99,102,241,0.25)" : "1px solid rgba(51,65,85,0.5)",
            color: "#e2e8f0",
          }}
        >
          {msg.role === "assistant" && msg.loading ? (
            <span className="flex items-center gap-2" style={{ color: "#64748b" }}>
              <Loader2 size={14} className="animate-spin" />
              Thinking...
            </span>
          ) : (
            <p style={{ whiteSpace: "pre-wrap" }}>{msg.content}</p>
          )}
        </div>
        {msg.sources?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {msg.sources.map((s, i) => <SourceChip key={i} source={s} />)}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AskPage({ activeCollection }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    if (!activeCollection) {
      toast.error("Select a collection first");
      return;
    }

    const question = input.trim();
    setInput("");

    const userMsg = { id: Date.now(), role: "user", content: question };
    const loadingMsg = { id: Date.now() + 1, role: "assistant", content: "", loading: true };
    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setLoading(true);

    try {
      const data = await askQuestion(activeCollection, question);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMsg.id
            ? { ...m, content: data.answer, sources: data.sources, loading: false }
            : m
        )
      );
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMsg.id
            ? { ...m, content: "Sorry, something went wrong. Please try again.", loading: false }
            : m
        )
      );
      toast.error(err.response?.data?.error || "Failed to get answer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto px-6">
      {/* Header */}
      <div className="py-8 border-b flex-shrink-0" style={{ borderColor: "rgba(51,65,85,0.3)" }}>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen size={14} style={{ color: "#14b8a6" }} />
          <span className="text-xs uppercase tracking-widest" style={{ color: "#14b8a6", fontFamily: "JetBrains Mono, monospace" }}>
            RAG Pipeline
          </span>
        </div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: "Syne, sans-serif", color: "#f1f5f9" }}>
          Ask AI
        </h1>
        <p className="text-sm mt-1" style={{ color: "#64748b" }}>
          Ask questions — AI retrieves context from{" "}
          <span style={{ color: "#14b8a6", fontFamily: "JetBrains Mono, monospace" }}>{activeCollection}</span>{" "}
          and generates an answer with citations.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-6 space-y-5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
              style={{ background: "rgba(20,184,166,0.06)", border: "1px solid rgba(20,184,166,0.12)" }}
            >
              <Bot size={32} style={{ color: "#334155" }} />
            </div>
            <p className="text-lg font-semibold mb-1" style={{ color: "#475569", fontFamily: "Syne, sans-serif" }}>
              Ask anything
            </p>
            <p className="text-sm max-w-sm" style={{ color: "#334155" }}>
              Your question will be answered using documents from the active collection via RAG.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center max-w-md">
              {["What is semantic search?", "Explain vector embeddings", "How does RAG work?"].map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="text-xs px-3 py-1.5 rounded-full transition-colors"
                  style={{ background: "rgba(30,41,59,0.8)", color: "#64748b", border: "1px solid #334155" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#14b8a6"; e.currentTarget.style.borderColor = "rgba(20,184,166,0.3)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderColor = "#334155"; }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg) => <Message key={msg.id} msg={msg} />)}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="py-4 flex-shrink-0">
        <div
          className="flex items-end gap-3 rounded-2xl p-3"
          style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(51,65,85,0.6)" }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Ask a question about your documents..."
            rows={1}
            className="flex-1 text-sm outline-none resize-none"
            style={{
              background: "transparent",
              color: "#e2e8f0",
              fontFamily: "DM Sans, sans-serif",
              maxHeight: 120,
            }}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
            style={{
              background: loading || !input.trim() ? "#1e293b" : "linear-gradient(135deg, #14b8a6, #0d9488)",
            }}
          >
            {loading ? <Loader2 size={15} className="animate-spin" style={{ color: "#475569" }} />
              : <Send size={15} style={{ color: loading || !input.trim() ? "#475569" : "white" }} />}
          </button>
        </div>
        <p className="text-xs text-center mt-2" style={{ color: "#334155" }}>
          Press Enter to send · Shift+Enter for newline
        </p>
      </div>
    </div>
  );
}

