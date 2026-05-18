"use client";

import { useEffect, useRef } from "react";

const EXPLORER_URL = process.env.NEXT_PUBLIC_NVNM_EXPLORER_URL || "https://explorer.evm.testnet.nvnmchain.io";

export default function LiveFeed({ anchors, prevCount }) {
  return (
    <div style={{
      flex: 1,
      overflow: "auto",
      padding: "0",
    }}>
      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        fontFamily: "var(--font-sans)",
        fontSize: "13px",
      }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <Th>COMPANY</Th>
            <Th>FORM</Th>
            <Th>DOC HASH</Th>
            <Th>TX HASH</Th>
            <Th>STATUS</Th>
            <Th>TIME</Th>
          </tr>
        </thead>
        <tbody>
          {anchors?.map((anchor, i) => (
            <FeedRow
              key={anchor.id}
              anchor={anchor}
              isNew={i < (anchors.length - (prevCount || anchors.length))}
            />
          ))}
          {(!anchors || anchors.length === 0) && (
            <tr>
              <td colSpan={6} style={{
                padding: "48px 32px",
                textAlign: "center",
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
              }}>
                No anchors yet — run the agent to start anchoring
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }) {
  return (
    <th style={{
      padding: "12px 16px",
      textAlign: "left",
      fontSize: "11px",
      fontWeight: 500,
      color: "var(--text-muted)",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      fontFamily: "var(--font-mono)",
    }}>
      {children}
    </th>
  );
}

function FeedRow({ anchor, isNew }) {
  const rowRef = useRef(null);

  useEffect(() => {
    if (isNew && rowRef.current) {
      rowRef.current.style.animation = "slideUp 0.3s ease-out forwards";
    }
  }, [isNew]);

  const isFailed = anchor.status === "failed";
  const truncate = (str, len) => str && str.length > len ? str.slice(0, len) + "..." : str || "—";

  return (
    <tr
      ref={rowRef}
      style={{
        borderBottom: "1px solid var(--border)",
        opacity: isNew ? 0 : 1,
        color: isFailed ? "var(--error)" : "var(--text-primary)",
      }}
    >
      <td style={{ padding: "12px 16px", maxWidth: "220px" }}>
        <a
          href={anchor.edgar_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: isFailed ? "var(--error)" : "var(--text-primary)" }}
          title={anchor.company_name}
        >
          {truncate(anchor.company_name, 28)}
        </a>
      </td>
      <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
        D
      </td>
      <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: "12px" }} title={anchor.document_hash}>
        {truncate(anchor.document_hash, 10)}
      </td>
      <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
        {anchor.tx_hash ? (
          <a
            href={`${EXPLORER_URL}/tx/${anchor.tx_hash}`}
            target="_blank"
            rel="noopener noreferrer"
            title={anchor.tx_hash}
          >
            {truncate(anchor.tx_hash, 10)}
          </a>
        ) : (
          "—"
        )}
      </td>
      <td style={{
        padding: "12px 16px",
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        color: anchor.status === "anchored" ? "var(--accent)" : isFailed ? "var(--error)" : "var(--text-muted)",
      }}>
        {anchor.status}
      </td>
      <td style={{
        padding: "12px 16px",
        fontFamily: "var(--font-mono)",
        fontSize: "12px",
        color: "var(--text-muted)",
      }}>
        {timeAgo(anchor.anchored_at)}
      </td>
    </tr>
  );
}

function timeAgo(dateStr) {
  if (!dateStr) return "—";
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
