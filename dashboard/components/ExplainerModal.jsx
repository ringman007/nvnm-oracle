"use client";

import { useState } from "react";

export default function ExplainerModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          padding: "6px 14px",
          background: "transparent",
          color: "var(--text-muted)",
          border: "1px solid var(--border)",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.target.style.color = "var(--text-primary)";
          e.target.style.borderColor = "var(--text-primary)";
        }}
        onMouseLeave={(e) => {
          e.target.style.color = "var(--text-muted)";
          e.target.style.borderColor = "var(--border)";
        }}
      >
        How it works
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            padding: "24px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              maxWidth: "640px",
              width: "100%",
              maxHeight: "80vh",
              overflowY: "auto",
              padding: "40px",
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                fontSize: "20px",
                cursor: "pointer",
              }}
            >
              ×
            </button>

            <h2 style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: "24px",
              fontWeight: 400,
              color: "var(--text-primary)",
              marginBottom: "24px",
            }}>
              How it works
            </h2>

            {/* Steps */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <Step number="1" title="SEC EDGAR Monitoring">
                An autonomous agent polls the SEC EDGAR full-text search API every 6 hours,
                fetching all new Form D filings — the mandatory disclosure for private capital raises in the US.
              </Step>

              <Step number="2" title="Document Hashing">
                Each filing&apos;s index page is fetched and cryptographically hashed (SHA-256).
                This creates a unique fingerprint that proves the document existed at a specific point in time.
              </Step>

              <Step number="3" title="On-Chain Anchoring">
                The hash, document URI, and metadata (company name, CIK, form type) are written to
                NVNM Chain&apos;s <strong>Anchoring Precompile</strong> — a native smart contract at
                address <code style={{ color: "var(--accent)" }}>0x0000...0A00</code> purpose-built for
                tamper-proof data anchoring.
              </Step>

              <Step number="4" title="Immutable Proof">
                Once anchored, the record is permanent and verifiable by anyone. The transaction hash
                links directly to the block explorer where you can independently verify the data.
              </Step>
            </div>

            {/* What can you do */}
            <h3 style={{
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--text-primary)",
              marginTop: "32px",
              marginBottom: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
              What can you do with this?
            </h3>

            <ul style={{
              fontFamily: "var(--font-sans)",
              fontSize: "14px",
              color: "var(--text-muted)",
              lineHeight: "1.7",
              paddingLeft: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}>
              <li><strong style={{ color: "var(--text-primary)" }}>Verify filings</strong> — Click any TX hash to confirm the anchored data on-chain</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Prove existence</strong> — Demonstrate a filing existed at a specific block height and time</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Detect tampering</strong> — Re-hash a document and compare against the anchored hash</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Audit trail</strong> — Track every private capital raise in the US with blockchain-grade immutability</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Trigger manually</strong> — Use the &quot;Run Agent Now&quot; button to anchor new filings on demand</li>
            </ul>

            {/* Architecture */}
            <h3 style={{
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--text-primary)",
              marginTop: "32px",
              marginBottom: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
              Architecture
            </h3>

            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--text-muted)",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid var(--border)",
              padding: "16px",
              lineHeight: "1.8",
              whiteSpace: "pre",
            }}>
{`SEC EDGAR API
      ↓  (Form D filings)
  Oracle Agent (Node.js)
      ↓  (SHA-256 hash + metadata)
  NVNM Chain Anchoring Precompile
      ↓  (immutable record)
  This Dashboard (Next.js)
      ↓  (real-time feed)
  You ✓`}
            </div>

            <p style={{
              fontFamily: "var(--font-sans)",
              fontSize: "13px",
              color: "var(--text-muted)",
              marginTop: "24px",
              lineHeight: "1.5",
            }}>
              The oracle runs autonomously on a 6-hour cron schedule, deduplicates filings,
              and skips weekends intelligently. All data is stored in Supabase for fast querying
              and on NVNM Chain for permanent, censorship-resistant proof.
            </p>

            <button
              onClick={() => setOpen(false)}
              style={{
                marginTop: "32px",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                padding: "10px 24px",
                background: "transparent",
                color: "var(--accent)",
                border: "1px solid var(--accent)",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Step({ number, title, children }) {
  return (
    <div style={{ display: "flex", gap: "16px" }}>
      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        fontWeight: 700,
        color: "var(--accent)",
        width: "24px",
        height: "24px",
        border: "1px solid var(--accent)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        marginTop: "2px",
      }}>
        {number}
      </div>
      <div>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: "13px",
          fontWeight: 500,
          color: "var(--text-primary)",
          marginBottom: "4px",
        }}>
          {title}
        </div>
        <div style={{
          fontFamily: "var(--font-sans)",
          fontSize: "14px",
          color: "var(--text-muted)",
          lineHeight: "1.6",
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}
