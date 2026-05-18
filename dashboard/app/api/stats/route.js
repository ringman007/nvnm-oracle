import { getSupabaseAdmin } from "../../supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data: stats, error } = await supabase
    .from("oracle_stats")
    .select("*")
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

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
    totalAnchored: stats.total_anchored,
    anchoredToday: stats.anchored_today,
    lastRunAt: stats.last_run_at,
    blockNumber,
  });
}
