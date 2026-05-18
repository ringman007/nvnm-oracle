import { getSupabaseAdmin } from "../../supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabaseAdmin();

  // Get real counts from anchors table
  const [totalRes, todayRes, lastRunRes] = await Promise.all([
    supabase.from("anchors").select("id", { count: "exact", head: true }).eq("status", "anchored"),
    supabase.from("anchors").select("id", { count: "exact", head: true }).eq("status", "anchored").gte("anchored_at", new Date().toISOString().split("T")[0]),
    supabase.from("anchors").select("anchored_at").order("anchored_at", { ascending: false }).limit(1),
  ]);

  // Fetch current block number from NVNM RPC
  let blockNumber = null;
  try {
    const rpcRes = await fetch(process.env.NVNM_RPC_URL || "https://evm.testnet.nvnmchain.io", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_blockNumber",
        params: [],
        id: 1,
      }),
    });
    const rpcData = await rpcRes.json();
    blockNumber = parseInt(rpcData.result, 16);
  } catch (_) {}

  return Response.json({
    totalAnchored: totalRes.count || 0,
    anchoredToday: todayRes.count || 0,
    lastRunAt: lastRunRes.data?.[0]?.anchored_at || null,
    blockNumber,
  });
}
