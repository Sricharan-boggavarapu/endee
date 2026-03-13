import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Search, BookOpen, Upload, Database, Github, Linkedin, ChevronDown, Zap, MessageSquare } from "lucide-react";
import { getCollections } from "../utils/api.js";

const NAV = [
  { to: "/", icon: Search, label: "Semantic Search" },
  { to: "/ask", icon: BookOpen, label: "Ask AI (RAG)" },
  { to: "/chat-pdf", icon: MessageSquare, label: "Chat with PDF" },
  { to: "/ingest", icon: Upload, label: "Ingest Docs" },
  { to: "/collections", icon: Database, label: "Collections" },
];

export default function Sidebar({ activeCollection, setActiveCollection }) {
  const [collections, setCollections] = useState([]);
  const [showCollections, setShowCollections] = useState(true);

  useEffect(() => {
    getCollections()
      .then((data) => {
        const cols = Array.isArray(data) ? data : data?.collections || [];
        setCollections(cols);
      })
      .catch(() => setCollections([]));
  }, []);

  return (
    <aside
      className="w-64 flex-shrink-0 flex flex-col h-full border-r"
      style={{
        background: "rgba(10,15,26,0.95)",
        borderColor: "rgba(51,65,85,0.5)",
      }}
    >
      {/* Logo */}
      <div className="p-6 border-b" style={{ borderColor: "rgba(51,65,85,0.4)" }}>
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #14b8a6, #6366f1)" }}
          >
            <Zap size={16} color="white" />
          </div>
          <span
            className="text-lg font-bold tracking-tight"
            style={{ fontFamily: "Syne, sans-serif", color: "#e2e8f0" }}
          >
            SemanticAI
          </span>
        </div>
        <p className="text-xs" style={{ color: "#64748b", fontFamily: "JetBrains Mono, monospace" }}>
          Powered by Endee VectorDB
        </p>
      </div>

      {/* Active Collection Badge */}
      <div className="px-4 pt-4 pb-2">
        <div
          className="rounded-lg px-3 py-2 flex items-center gap-2"
          style={{ background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.2)" }}
        >
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#14b8a6" }} />
          <div>
            <p className="text-xs" style={{ color: "#64748b" }}>Active Collection</p>
            <p
              className="text-sm font-medium truncate"
              style={{ color: "#14b8a6", fontFamily: "JetBrains Mono, monospace" }}
            >
              {activeCollection || "none"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "text-teal-400"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`
            }
            style={({ isActive }) =>
              isActive
                ? { background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.2)" }
                : {}
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}

        {/* Collections Dropdown */}
        {collections.length > 0 && (
          <div className="pt-3">
            <button
              onClick={() => setShowCollections(!showCollections)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wider"
              style={{ color: "#475569" }}
            >
              Collections
              <ChevronDown
                size={12}
                style={{ transform: showCollections ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}
              />
            </button>
            {showCollections && (
              <div className="mt-1 space-y-0.5">
                {collections.map((col) => {
                  const name = typeof col === "string" ? col : col.name || col.id;
                  return (
                    <button
                      key={name}
                      onClick={() => setActiveCollection(name)}
                      className="w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors flex items-center gap-2"
                      style={{
                        color: activeCollection === name ? "#14b8a6" : "#64748b",
                        background: activeCollection === name ? "rgba(20,184,166,0.08)" : "transparent",
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    >
                      <span style={{ color: "#334155" }}>#</span>
                      {name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Developer Credits */}
      <div
        className="p-4 border-t"
        style={{ borderColor: "rgba(51,65,85,0.4)" }}
      >
        <p className="text-xs mb-2" style={{ color: "#475569" }}>
          Developer
        </p>
        <p
          className="text-sm font-semibold mb-2"
          style={{ color: "#e2e8f0", fontFamily: "Syne, sans-serif" }}
        >
          Sricharan Boggavarapu
        </p>
        <div className="flex gap-2">
          <a
            href="https://github.com/Sricharan-boggavarapu"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-colors"
            style={{
              background: "rgba(51,65,85,0.5)",
              color: "#94a3b8",
              border: "1px solid rgba(51,65,85,0.8)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#e2e8f0"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#94a3b8"; }}
          >
            <Github size={12} />
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/boggavarapu-sricharan"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-colors"
            style={{
              background: "rgba(51,65,85,0.5)",
              color: "#94a3b8",
              border: "1px solid rgba(51,65,85,0.8)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#0ea5e9"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#94a3b8"; }}
          >
            <Linkedin size={12} />
            LinkedIn
          </a>
        </div>
      </div>
    </aside>
  );
}
