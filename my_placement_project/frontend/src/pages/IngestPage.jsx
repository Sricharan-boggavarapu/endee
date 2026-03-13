import React, { useState, useRef } from "react";
import { Upload, FileText, Loader2, CheckCircle, Hash } from "lucide-react";
import { ingestDoc } from "../utils/api.js";
import toast from "react-hot-toast";

export default function IngestPage({ activeCollection }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [collection, setCollection] = useState(activeCollection || "default");
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setTitle(file.name.replace(/\.[^/.]+$/, ""));
    const reader = new FileReader();
    reader.onload = (ev) => setContent(ev.target.result);
    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || !collection.trim()) {
      toast.error("Collection name and content are required");
      return;
    }
    setLoading(true);
    setLastResult(null);
    try {
      const data = await ingestDoc(collection, title || "Untitled", content);
      setLastResult(data);
      toast.success(`Ingested ${data.chunks} chunks successfully!`);
      setTitle("");
      setContent("");
    } catch (err) {
      toast.error(err.response?.data?.error || "Ingestion failed");
    } finally {
      setLoading(false);
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-2 mb-2">
          <Upload size={14} style={{ color: "#14b8a6" }} />
          <span className="text-xs uppercase tracking-widest" style={{ color: "#14b8a6", fontFamily: "JetBrains Mono, monospace" }}>
            Document Ingestion
          </span>
        </div>
        <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: "Syne, sans-serif", color: "#f1f5f9" }}>
          Add Documents
        </h1>
        <p className="text-base" style={{ color: "#64748b" }}>
          Ingest text into Endee. Documents are chunked, embedded, and stored as vectors for semantic retrieval.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up">
        {/* Collection field */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "#94a3b8" }}>
            Collection Name
          </label>
          <div className="relative">
            <Hash size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#475569" }} />
            <input
              type="text"
              value={collection}
              onChange={(e) => setCollection(e.target.value)}
              placeholder="e.g. research-papers"
              className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none"
              style={{
                background: "rgba(15,23,42,0.8)",
                border: "1px solid rgba(51,65,85,0.6)",
                color: "#e2e8f0",
                fontFamily: "JetBrains Mono, monospace",
              }}
              onFocus={(e) => { e.target.style.borderColor = "rgba(20,184,166,0.5)"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(51,65,85,0.6)"; }}
            />
          </div>
          <p className="text-xs mt-1" style={{ color: "#475569" }}>
            Collection will be created in Endee if it doesn't exist.
          </p>
        </div>

        {/* Title field */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "#94a3b8" }}>
            Document Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Introduction to Vector Databases"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{
              background: "rgba(15,23,42,0.8)",
              border: "1px solid rgba(51,65,85,0.6)",
              color: "#e2e8f0",
            }}
            onFocus={(e) => { e.target.style.borderColor = "rgba(20,184,166,0.5)"; }}
            onBlur={(e) => { e.target.style.borderColor = "rgba(51,65,85,0.6)"; }}
          />
        </div>

        {/* File upload */}
        <div>
          <input ref={fileRef} type="file" accept=".txt,.md,.csv" className="hidden" onChange={handleFile} />
          <button
            type="button"
            onClick={() => fileRef.current.click()}
            className="w-full py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
            style={{
              background: "rgba(30,41,59,0.5)",
              border: "1px dashed rgba(51,65,85,0.8)",
              color: "#64748b",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(20,184,166,0.4)"; e.currentTarget.style.color = "#14b8a6"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(51,65,85,0.8)"; e.currentTarget.style.color = "#64748b"; }}
          >
            <Upload size={15} />
            Upload .txt or .md file
          </button>
        </div>

        {/* Content textarea */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium" style={{ color: "#94a3b8" }}>
              Document Content
            </label>
            {wordCount > 0 && (
              <span className="text-xs" style={{ color: "#475569", fontFamily: "JetBrains Mono, monospace" }}>
                ~{wordCount} words · ~{Math.ceil(wordCount / 350)} chunks
              </span>
            )}
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            placeholder="Paste your document content here, or upload a file above..."
            className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-y"
            style={{
              background: "rgba(15,23,42,0.8)",
              border: "1px solid rgba(51,65,85,0.6)",
              color: "#e2e8f0",
              fontFamily: "DM Sans, sans-serif",
              lineHeight: "1.7",
            }}
            onFocus={(e) => { e.target.style.borderColor = "rgba(20,184,166,0.5)"; }}
            onBlur={(e) => { e.target.style.borderColor = "rgba(51,65,85,0.6)"; }}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
          style={{
            background: loading || !content.trim() ? "#1e293b" : "linear-gradient(135deg, #14b8a6, #0d9488)",
            color: loading || !content.trim() ? "#475569" : "white",
            fontFamily: "Syne, sans-serif",
            letterSpacing: "0.02em",
          }}
        >
          {loading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Embedding & storing in Endee...
            </>
          ) : (
            <>
              <FileText size={15} />
              Ingest Document
            </>
          )}
        </button>
      </form>

      {/* Success result */}
      {lastResult && (
        <div
          className="mt-6 rounded-xl p-5 animate-slide-up"
          style={{ background: "rgba(20,184,166,0.06)", border: "1px solid rgba(20,184,166,0.25)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={16} style={{ color: "#14b8a6" }} />
            <span className="font-semibold text-sm" style={{ color: "#14b8a6", fontFamily: "Syne, sans-serif" }}>
              Successfully ingested!
            </span>
          </div>
          <div className="space-y-1.5">
            {[
              ["Collection", lastResult.collection],
              ["Document ID", lastResult.docId?.slice(0, 16) + "..."],
              ["Title", lastResult.title],
              ["Chunks stored", lastResult.chunks],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between text-sm">
                <span style={{ color: "#64748b" }}>{k}</span>
                <span style={{ color: "#e2e8f0", fontFamily: "JetBrains Mono, monospace", fontSize: "12px" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
