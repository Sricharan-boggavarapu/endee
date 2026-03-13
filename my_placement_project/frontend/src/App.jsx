import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Sidebar from "./components/Sidebar.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import IngestPage from "./pages/IngestPage.jsx";
import CollectionsPage from "./pages/CollectionsPage.jsx";
import AskPage from "./pages/AskPage.jsx";
import ChatWithPDF from "./pages/ChatWithPDF.jsx";

export default function App() {
  const [activeCollection, setActiveCollection] = useState("default");

  return (
    <div className="flex h-screen overflow-hidden bg-grid" style={{ background: "#030712" }}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#0f172a",
            color: "#e2e8f0",
            border: "1px solid #334155",
            fontFamily: "DM Sans, sans-serif",
          },
          success: { iconTheme: { primary: "#14b8a6", secondary: "#0f172a" } },
          error: { iconTheme: { primary: "#f87171", secondary: "#0f172a" } },
        }}
      />
      <Sidebar activeCollection={activeCollection} setActiveCollection={setActiveCollection} />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<SearchPage activeCollection={activeCollection} />} />
          <Route path="/ask" element={<AskPage activeCollection={activeCollection} />} />
          <Route path="/chat-pdf" element={<ChatWithPDF />} />
          <Route path="/ingest" element={<IngestPage activeCollection={activeCollection} />} />
          <Route path="/collections" element={<CollectionsPage setActiveCollection={setActiveCollection} />} />
        </Routes>
      </main>
    </div>
  );
}
