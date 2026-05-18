"use client";

import { useState } from "react";

export default function TriggerButton({ onNewAnchors }) {
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle"); // idle | polling | success | error

  async function handleTrigger() {
    setRunning(true);
    setMessage("Agent running — anchoring new filings...");
    setStatus("polling");

    try {
      const res = await fetch("/api/trigger", { method: "POST" });
      const data = await res.json();

      if (data.error) {
        setMessage(`Error: ${data.error}`);
        setStatus("error");
        setRunning(false);
        setTimeout(() => { setMessage(""); setStatus("idle"); }, 8000);
        return;
      }

      if (data.anchored > 0) {
        // Fetch the names of what was just anchored
        const anchorsRes = await fetch(`/api/anchors?limit=${data.anchored}`);
        const anchors = await anchorsRes.json();
        const names = Array.isArray(anchors)
          ? anchors.map(a => a.company_name || a.accession_number).slice(0, 3)
          : [];
        const nameStr = names.join(", ") + (data.anchored > 3 ? ` +${data.anchored - 3} more` : "");
        setMessage(`✓ ${data.anchored} new filing${data.anchored > 1 ? "s" : ""} anchored: ${nameStr}`);
        setStatus("success");
        if (onNewAnchors) onNewAnchors();
        setTimeout(() => { setMessage(""); setStatus("idle"); }, 30000);
      } else {
        setMessage("All caught up — no new Form D filings to anchor ✓");
        setStatus("success");
        setTimeout(() => { setMessage(""); setStatus("idle"); }, 10000);
      }

      setRunning(false);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
      setStatus("error");
      setRunning(false);
      setTimeout(() => { setMessage(""); setStatus("idle"); }, 8000);
    }
  }

  const statusColor = status === "success" ? "var(--accent)"
    : status === "error" ? "#f44" : "var(--text-muted)";

  return (
    <div style={{ textAlign: "right" }}>
      <button
        onClick={handleTrigger}
        disabled={running}
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "13px",
          fontWeight: 500,
          padding: "10px 24px",
          background: "transparent",
          color: running ? "var(--text-muted)" : "var(--accent)",
          border: `1px solid ${running ? "var(--text-muted)" : "var(--accent)"}`,
          borderRadius: "0",
          cursor: running ? "not-allowed" : "pointer",
          animation: running ? "none" : "pulse 3s ease-in-out infinite",
          transition: "all 0.2s",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {running && (
          <span style={{
            display: "inline-block",
            width: "12px",
            height: "12px",
            border: "2px solid var(--text-muted)",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
        )}
        {running ? "RUNNING..." : "RUN AGENT NOW"}
      </button>
      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        color: statusColor,
        marginTop: "6px",
        transition: "color 0.3s",
      }}>
        {message || "Triggers one run — anchors next 5 filings"}
      </div>

      {/* Prominent status banner */}
      {(status === "polling" || status === "success" || status === "error") && (
        <div style={{
          position: "fixed",
          bottom: "32px",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "14px 28px",
          background: status === "success" ? "rgba(0, 255, 136, 0.1)"
            : status === "error" ? "rgba(255, 68, 68, 0.1)"
            : "rgba(255, 255, 255, 0.05)",
          border: `1px solid ${status === "success" ? "var(--accent)" : status === "error" ? "#f44" : "var(--border)"}`,
          backdropFilter: "blur(12px)",
          fontFamily: "var(--font-mono)",
          fontSize: "13px",
          fontWeight: 500,
          color: status === "success" ? "var(--accent)" : status === "error" ? "#f44" : "var(--text-primary)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          zIndex: 1000,
          boxShadow: status === "success"
            ? "0 0 20px rgba(0, 255, 136, 0.15)"
            : "0 4px 20px rgba(0, 0, 0, 0.3)",
          animation: "slideUp 0.3s ease-out",
        }}>
          {status === "polling" && (
            <span style={{
              display: "inline-block",
              width: "14px",
              height: "14px",
              border: "2px solid var(--text-primary)",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }} />
          )}
          {status === "success" && <span style={{ fontSize: "16px" }}>✓</span>}
          {status === "error" && <span style={{ fontSize: "16px" }}>✗</span>}
          {message}
        </div>
      )}
    </div>
  );
}
