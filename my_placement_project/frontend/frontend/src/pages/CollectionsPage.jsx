import React, { useState, useEffect } from "react";
import { Database, Plus, Trash2, Loader2, RefreshCw } from "lucide-react";
import { getCollections, createCollection, deleteCollection } from "../utils/api.js";
import toast from "react-hot-toast";

function CollectionCard({ col, onDelete, onSelect }) {
  const name = typeof col === "string" ? col : col.name || col.id;
  const dim = col.dimension || 1536;
  const count = col.vector_count || col.count || "—";
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete collection "${name}"? This is irreversible.`)) return;
    setDeleting(true);
    try {
      await deleteCollection(name);
      onDelete(name);
      toast.success(`Deleted "${name}"`);
    } catch {
      toast.error("Delete failed");
      setDeleting(false);
    }
  };

  return (
    <div
      className="glass glass-hover rounded-xl p-5 flex items-center justify-between group animate-slide-up"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.2)" }}
        >
          <Database size={18} style={{ color: "#14b8a6" }} />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate" style={{ color: "#e2e8f0", fontFamily: "Syne, sans-serif" }}>
            {name}
          </p>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs" style={{ color: "#475569", fontFamily: "JetBrains Mono, monospace" }}>
              dim: {dim}
            </span>
            <span className="text-xs" style={{ color: "#475569" }}>·</span>
            <span className="text-xs" style={{ color: "#475569", fontFamily: "JetBrains Mono, monospace" }}>
              vectors: {count}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onSelect(name)}
          className="text-xs px-3 py-1.5 rounded-lg transition-colors"
          style={{ background: "rgba(20,184,166,0.1)", color: "#14b8a6", border: "1px solid rgba(20,184,166,0.2)" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(20,184,166,0.2)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(20,184,166,0.1)"; }}
        >
          Set Active
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ color: "#475569", border: "1px solid #334155" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.borderColor = "rgba(248,113,113,0.3)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#475569"; e.currentTarget.style.borderColor = "#334155"; }}
        >
          {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
        </button>
      </div>
    </div>
  );
}

export default function CollectionsPage({ setActiveCollection }) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const data = await getCollections();
      const cols = Array.isArray(data) ? data : data?.collections || [];
      setCollections(cols);
    } catch {
      toast.error("Failed to load collections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCollections(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await createCollection(newName.trim());
      setNewName("");
      toast.success(`Created collection "${newName}"`);
      fetchCollections();
    } catch {
      toast.error("Failed to create collection");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (name) => {
    setCollections((prev) => prev.filter((c) => {
      const n = typeof c === "string" ? c : c.name || c.id;
      return n !== name;
    }));
  };

  const handleSelect = (name) => {
    setActiveCollection(name);
    toast.success(`Active collection: ${name}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8 animate-fade-in flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Database size={14} style={{ color: "#14b8a6" }} />
            <span className="text-xs uppercase tracking-widest" style={{ color: "#14b8a6", fontFamily: "JetBrains Mono, monospace" }}>
              Vector Collections
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: "Syne, sans-serif", color: "#f1f5f9" }}>
            Collections
          </h1>
          <p className="text-base" style={{ color: "#64748b" }}>
            Manage named vector spaces in Endee. Each collection holds document embeddings for a specific corpus.
          </p>
        </div>
        <button
          onClick={fetchCollections}
          className="mt-8 w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
          style={{ background: "rgba(30,41,59,0.8)", color: "#64748b", border: "1px solid #334155" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#14b8a6"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#64748b"; }}
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Create new collection */}
      <form onSubmit={handleCreate} className="mb-8 animate-slide-up">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Plus size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#475569" }} />
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
              placeholder="new-collection-name"
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
          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="px-5 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
            style={{
              background: creating || !newName.trim() ? "#1e293b" : "linear-gradient(135deg, #14b8a6, #0d9488)",
              color: creating || !newName.trim() ? "#475569" : "white",
              fontFamily: "Syne, sans-serif",
            }}
          >
            {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Create
          </button>
        </div>
      </form>

      {/* Collections list */}
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="glass rounded-xl p-5">
              <div className="flex items-center gap-4">
                <div className="shimmer w-10 h-10 rounded-xl" />
                <div className="flex-1">
                  <div className="shimmer h-4 rounded w-32 mb-2" />
                  <div className="shimmer h-3 rounded w-48" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "rgba(20,184,166,0.06)", border: "1px solid rgba(20,184,166,0.12)" }}
          >
            <Database size={28} style={{ color: "#334155" }} />
          </div>
          <p className="text-lg font-semibold mb-1" style={{ color: "#475569", fontFamily: "Syne, sans-serif" }}>
            No collections yet
          </p>
          <p className="text-sm" style={{ color: "#334155" }}>
            Create your first collection above or ingest a document.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs mb-3" style={{ color: "#475569" }}>
            {collections.length} collection{collections.length !== 1 ? "s" : ""} in Endee
          </p>
          {collections.map((col, i) => (
            <CollectionCard
              key={typeof col === "string" ? col : col.name || i}
              col={col}
              onDelete={handleDelete}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
