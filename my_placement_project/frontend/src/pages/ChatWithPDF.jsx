import React, { useState, useRef, useEffect } from "react";
import { Upload, FileText, Send, Bot, User, Loader2, X } from "lucide-react";
import { ingestFile, askQuestion, deleteCollection } from "../utils/api.js";
import toast from "react-hot-toast";

const getSessionId = () => {
  let id = sessionStorage.getItem("pdf_session_id");
  if (!id) {
    id = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    sessionStorage.setItem("pdf_session_id", id);
  }
  return id;
};

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""} animate-slide-up`}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: isUser ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "linear-gradient(135deg, #14b8a6, #0d9488)" }}>
        {isUser ? <User size={14} color="white" /> : <Bot size={14} color="white" />}
      </div>
      <div className={`max-w-[80%] flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        <div className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
          style={{
            background: isUser ? "rgba(99,102,241,0.15)" : "rgba(15,23,42,0.8)",
            border: isUser ? "1px solid rgba(99,102,241,0.25)" : "1px solid rgba(51,65,85,0.5)",
            color: "#e2e8f0",
          }}>
          {msg.loading ? (
            <span className="flex items-center gap-2" style={{ color: "#64748b" }}>
              <Loader2 size={14} className="animate-spin" /> Thinking...
            </span>
          ) : (
            <p style={{ whiteSpace: "pre-wrap" }}>{msg.content}</p>
          )}
        </div>
        {msg.sources?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {msg.sources.map((s, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.2)", color: "#14b8a6" }}>
                [{s.rank}] {s.title?.slice(0, 20)} · {Math.round(s.score * 100)}%
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatWithPDF({ setActiveCollection }) {
  const [file, setFile] = useState(null);
  const [collection, setCollection] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ingesting, setIngesting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const collectionRef = useRef(null);
  const SESSION_ID = useRef(getSessionId()).current;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    collectionRef.current = collection;
  }, [collection]);

  useEffect(() => {
    const cleanup = () => {
      if (collectionRef.current) {
        deleteCollection(collectionRef.current).catch(() => {});
      }
    };
    window.addEventListener("beforeunload", cleanup);
    return () => {
      window.removeEventListener("beforeunload", cleanup);
      cleanup();
    };
  }, []);

  const handleFile = async (f) => {
    if (!f) return;
    if (!f.type.match(/pdf|text/) && !f.name.match(/\.(pdf|txt|md)$/i)) {
      toast.error("Only PDF, TXT, or MD files supported");
      return;
    }

    if (collectionRef.current) {
      await deleteCollection(collectionRef.current).catch(() => {});
    }

    setFile(f);
    setIngesting(true);
    setMessages([]);

    const safeName = f.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9]/g, "-").toLowerCase().slice(0, 20);
    const collectionName = `pdf-${SESSION_ID}-${safeName}`;

    try {
      await ingestFile(collectionName, f.name, f);
      setCollection(collectionName);

      // 🔑 Switch active collection globally so Search & Ask AI use this PDF!
      if (setActiveCollection) setActiveCollection(collectionName);

      setMessages([{
        id: Date.now(),
        role: "assistant",
        content: `I've read "${f.name}" and I'm ready! You can also search and ask AI questions about it using the sidebar navigation — the active collection has been switched automatically. What would you like to know?`,
      }]);
      toast.success("Document ready! Active collection switched 🎯");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to process file");
      setFile(null);
    } finally {
      setIngesting(false);
    }
  };

  const handleClose = async () => {
    if (collection) {
      await deleteCollection(collection).catch(() => {});
      if (setActiveCollection) setActiveCollection("default");
      toast.success("Session ended & data deleted 🗑️");
    }
    setFile(null);
    setCollection(null);
    setMessages([]);
    sessionStorage.removeItem("pdf_session_id");
  };

  const handleSend = async () => {
    if (!input.trim() || loading || !collection) return;
    const question = input.trim();
    setInput("");
    const userMsg = { id: Date.now(), role: "user", content: question };
    const loadingMsg = { id: Date.now() + 1, role: "assistant", content: "", loading: true };
    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setLoading(true);
    try {
      const data = await askQuestion(collection, question);
      setMessages((prev) => prev.map((m) =>
        m.id === loadingMsg.id ? { ...m, content: data.answer, sources: data.sources, loading: false } : m
      ));
    } catch (err) {
      setMessages((prev) => prev.map((m) =>
        m.id === loadingMsg.id ? { ...m, content: "Sorry, something went wrong.", loading: false } : m
      ));
    } finally {
      setLoading(false);
    }
  };

  if (!file) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-6">
        <div className="w-full max-w-lg">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={14} style={{ color: "#14b8a6" }} />
            <span className="text-xs uppercase tracking-widest" style={{ color: "#14b8a6", fontFamily: "JetBrains Mono, monospace" }}>Chat with Document</span>
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: "Syne, sans-serif", color: "#f1f5f9" }}>Chat with PDF</h1>
          <p className="text-base mb-2" style={{ color: "#64748b" }}>Upload any .txt, .md or .pdf file — then ask questions about it using AI.</p>
          <p className="text-xs mb-8 px-3 py-2 rounded-lg" style={{ color: "#14b8a6", background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.15)" }}>
            🔒 Private session · 🎯 Auto-switches active collection for Search & Ask AI
          </p>
          <div
            className="rounded-2xl p-12 text-center cursor-pointer transition-all"
            style={{
              border: `2px dashed ${dragging ? "#14b8a6" : "#334155"}`,
              background: dragging ? "rgba(20,184,166,0.05)" : "rgba(15,23,42,0.5)",
            }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={32} className="mx-auto mb-4" style={{ color: "#334155" }} />
            <p className="font-semibold mb-1" style={{ color: "#475569", fontFamily: "Syne, sans-serif" }}>Drop your file here</p>
            <p className="text-sm" style={{ color: "#334155" }}>or click to browse — PDF, TXT, MD supported</p>
          </div>
          <input ref={fileInputRef} type="file" accept=".pdf,.txt,.md" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto px-6">
      <div className="py-6 border-b flex-shrink-0 flex items-center justify-between" style={{ borderColor: "rgba(51,65,85,0.3)" }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText size={14} style={{ color: "#14b8a6" }} />
            <span className="text-xs uppercase tracking-widest" style={{ color: "#14b8a6", fontFamily: "JetBrains Mono, monospace" }}>Chat with Document</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Syne, sans-serif", color: "#f1f5f9" }}>Chat with PDF</h1>
          <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>{file.name} · <span style={{ color: "#14b8a6" }}>🔒 Private · 🎯 Active collection</span></p>
        </div>
        <button onClick={handleClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-6 space-y-5">
        {messages.map((msg) => <Message key={msg.id} msg={msg} />)}
        <div ref={bottomRef} />
      </div>

      <div className="py-4 flex-shrink-0">
        <div className="flex items-end gap-3 rounded-2xl p-3"
          style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(51,65,85,0.6)" }}>
          <textarea value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={`Ask anything about ${file.name}...`} rows={1}
            className="flex-1 text-sm outline-none resize-none"
            style={{ background: "transparent", color: "#e2e8f0", fontFamily: "DM Sans, sans-serif", maxHeight: 120 }} />
          <button onClick={handleSend} disabled={loading || !input.trim()}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
            style={{ background: loading || !input.trim() ? "#1e293b" : "linear-gradient(135deg, #14b8a6, #0d9488)" }}>
            {loading ? <Loader2 size={15} className="animate-spin" style={{ color: "#475569" }} />
              : <Send size={15} style={{ color: loading || !input.trim() ? "#475569" : "white" }} />}
          </button>
        </div>
        <p className="text-xs text-center mt-2" style={{ color: "#334155" }}>Press Enter to send · Shift+Enter for newline</p>
      </div>
    </div>
  );
}
