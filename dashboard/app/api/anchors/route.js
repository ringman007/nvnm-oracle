import { getSupabaseAdmin } from "../../supabase";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const supabase = getSupabaseAdmin();
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  const { data, error } = await supabase
    .from("anchors")
    .select("*")
    .order("anchored_at", { ascending: false })
    .limit(limit);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}
