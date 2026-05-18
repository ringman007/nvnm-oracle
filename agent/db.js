const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function insertAnchor(filing) {
  const { data, error } = await supabase
    .from("anchors")
    .insert({
      company_name: filing.companyName,
      cik: filing.cik,
      accession_number: filing.accessionNumber,
      edgar_url: filing.edgarUrl,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw new Error(`DB insert failed: ${error.message}`);
  return data;
}

async function updateAnchor(id, fields) {
  const { error } = await supabase.from("anchors").update(fields).eq("id", id);
  if (error) throw new Error(`DB update failed: ${error.message}`);
}

async function updateStats(newAnchors) {
  const { data: stats } = await supabase
    .from("oracle_stats")
    .select("*")
    .single();

  const { error } = await supabase
    .from("oracle_stats")
    .update({
      total_anchored: (stats?.total_anchored || 0) + newAnchors,
      anchored_today: (stats?.anchored_today || 0) + newAnchors,
      last_run_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", stats.id);

  if (error) throw new Error(`Stats update failed: ${error.message}`);
}

async function getStats() {
  const { data, error } = await supabase
    .from("oracle_stats")
    .select("*")
    .single();
  if (error) throw new Error(`Stats fetch failed: ${error.message}`);
  return data;
}

async function getAnchors(limit = 20) {
  const { data, error } = await supabase
    .from("anchors")
    .select("*")
    .order("anchored_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Anchors fetch failed: ${error.message}`);
  return data;
}

async function getExistingAccessions() {
  const { data, error } = await supabase
    .from("anchors")
    .select("accession_number");
  if (error) return [];
  return data.map((r) => r.accession_number);
}

module.exports = {
  insertAnchor,
  updateAnchor,
  updateStats,
  getStats,
  getAnchors,
  getExistingAccessions,
};
