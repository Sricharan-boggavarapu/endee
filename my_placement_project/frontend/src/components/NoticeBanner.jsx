// Create this file at: frontend/src/components/NoticeBanner.jsx
export default function NoticeBanner() {
  return (
    <div
      style={{
        background: "rgba(234,179,8,0.08)",
        border: "1px solid rgba(234,179,8,0.2)",
        borderRadius: "8px",
        padding: "8px 14px",
        marginBottom: "20px",
        color: "#ca8a04",
        fontSize: "12px",
        lineHeight: "1.6",
      }}
    >
      ⚠️ <strong>Free tier notice:</strong> Endee vector DB resets on inactivity. If search returns errors, go to{" "}
      <strong>Ingest Docs</strong> and re-add your documents first.{" "}
      <strong>Chat with PDF</strong> always works without any setup — it re-ingests automatically every session.
    </div>
  );
}
