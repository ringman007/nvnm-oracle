"use client";

export default function StatsBar({ stats }) {
  const lastRun = stats?.lastRunAt ? timeAgo(new Date(stats.lastRunAt)) : "—";
  const nextRun = stats?.lastRunAt ? timeUntilNext(new Date(stats.lastRunAt)) : "—";

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      borderBottom: "1px solid var(--border)",
    }}>
      <StatCard label="Total Anchored" value={stats?.totalAnchored ?? "—"} />
      <StatCard label="Anchored Today" value={stats?.anchoredToday ?? "—"} />
      <StatCard label="Last Run" value={lastRun} />
      <StatCard label="Next Run" value={nextRun} />
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={{
      padding: "24px 32px",
      borderRight: "1px solid var(--border)",
    }}>
      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: "28px",
        fontWeight: 600,
        color: "var(--text-primary)",
        marginBottom: "4px",
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: "var(--font-sans)",
        fontSize: "13px",
        color: "var(--text-muted)",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
      }}>
        {label}
      </div>
    </div>
  );
}

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function timeUntilNext(lastRun) {
  const nextRun = new Date(lastRun.getTime() + 6 * 60 * 60 * 1000);
  const diff = nextRun.getTime() - Date.now();
  if (diff <= 0) return "imminent";
  const hours = Math.floor(diff / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  if (hours > 0) return `in ${hours}h ${minutes}m`;
  return `in ${minutes}m`;
}
