"use client";

import { useState, useEffect, useRef } from "react";
import StatsBar from "../components/StatsBar";
import TriggerButton from "../components/TriggerButton";
import LiveFeed from "../components/LiveFeed";
import ExplainerModal from "../components/ExplainerModal";

export default function Home() {
  const [stats, setStats] = useState(null);
  const [anchors, setAnchors] = useState([]);
  const prevCountRef = useRef(0);

  useEffect(() => {
    fetchStats();
    fetchAnchors();

    const statsInterval = setInterval(fetchStats, 10000);
    const anchorsInterval = setInterval(fetchAnchors, 15000);

    return () => {
      clearInterval(statsInterval);
      clearInterval(anchorsInterval);
    };
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      if (!data.error) setStats(data);
    } catch (_) {}
  }

  async function fetchAnchors() {
    try {
      const res = await fetch("/api/anchors?limit=50");
      const data = await res.json();
      if (Array.isArray(data)) {
        prevCountRef.current = anchors.length;
        setAnchors(data);
      }
    } catch (_) {}
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      background: "var(--bg)",
    }}>
      {/* Header */}
      <header style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "64px",
        padding: "0 32px",
        borderBottom: "1px solid var(--border)",
      }}>
        <h1 style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: "22px",
          fontWeight: 400,
          color: "var(--text-primary)",
        }}>
          NVNM Form D Oracle
        </h1>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          color: "var(--text-muted)",
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "var(--accent)",
              boxShadow: "0 0 8px var(--accent)",
            }} />
            LIVE
          </span>
          <span>Chain: NVNM Testnet</span>
          <span>Block: {stats?.blockNumber ? stats.blockNumber.toLocaleString() : "—"}</span>
          <ExplainerModal />
        </div>
      </header>

      {/* Stats */}
      <StatsBar stats={stats} />

      {/* Subheader */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "24px 32px",
        borderBottom: "1px solid var(--border)",
      }}>
        <p style={{
          fontFamily: "var(--font-sans)",
          fontSize: "14px",
          color: "var(--text-muted)",
          maxWidth: "520px",
          lineHeight: "1.5",
        }}>
          Anchoring every private capital raise in America on NVNM Chain — provably, autonomously, in real time.
        </p>
        <TriggerButton onNewAnchors={() => { fetchStats(); fetchAnchors(); }} />
      </div>

      {/* Live Feed */}
      <LiveFeed anchors={anchors} prevCount={prevCountRef.current} />

      {/* Footer */}
      <footer style={{
        height: "32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        borderTop: "1px solid var(--border)",
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        color: "var(--text-muted)",
      }}>
        <span>Built on NVNM Chain · Anchoring precompile · SEC EDGAR data</span>
        <span>0x0000...0A00</span>
      </footer>
    </div>
  );
}
