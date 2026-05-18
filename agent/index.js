require("dotenv").config();
const express = require("express");
const cron = require("node-cron");
const { fetchFilings } = require("./edgar");
const { hashDocument } = require("./hasher");
const { anchorDocument } = require("./anchor");
const { insertAnchor, updateAnchor, updateStats } = require("./db");

async function run(limit = 20) {
  console.log(`[Oracle] Run started — ${new Date().toISOString()}`);

  let anchored = 0;
  const filings = await fetchFilings(limit);
  console.log(`[Oracle] ${filings.length} new filings found`);

  for (const filing of filings) {
    try {
      const record = await insertAnchor(filing);
      const hash = await hashDocument(filing.edgarUrl);

      const { txHash, blockNumber } = await anchorDocument({
        hash,
        uri: filing.edgarUrl,
        metadata: {
          companyName: filing.companyName,
          cik: filing.cik,
          accessionNumber: filing.accessionNumber,
          formType: "D",
          source: "SEC EDGAR",
        },
      });

      await updateAnchor(record.id, {
        document_hash: hash,
        tx_hash: txHash,
        block_number: blockNumber,
        status: "anchored",
      });

      console.log(`[Oracle] ✓ ${filing.companyName} → ${txHash}`);
      anchored++;
    } catch (err) {
      console.error(`[Oracle] ✗ ${filing.companyName} — ${err.message}`);
      if (filing.accessionNumber) {
        try {
          // Try to update by accession_number if insert already happened
          const { createClient } = require("@supabase/supabase-js");
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
          );
          await supabase
            .from("anchors")
            .update({ status: "failed", error_message: err.message })
            .eq("accession_number", filing.accessionNumber);
        } catch (_) {
          // Silent — don't crash the loop
        }
      }
    }
  }

  await updateStats(anchored);
  console.log(`[Oracle] Complete — ${anchored}/${filings.length} anchored`);
  return { anchored, found: filings.length };
}

// Export for manual trigger
module.exports = { run };

// --- HTTP server for Railway trigger endpoint ---
const app = express();
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "nvnm-oracle-agent" });
});

// Trigger endpoint — secured with shared secret
app.post("/trigger", async (req, res) => {
  const secret = req.headers["x-trigger-secret"];
  if (!process.env.AGENT_TRIGGER_SECRET || secret !== process.env.AGENT_TRIGGER_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const limit = req.body?.limit || 5;
  try {
    const result = await run(limit);
    res.json({ status: "done", anchored: result.anchored, found: result.found });
  } catch (err) {
    res.json({ status: "error", error: err.message, anchored: 0, found: 0 });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[Oracle] Trigger server listening on port ${PORT}`);
});

// Run immediately on startup
run(20).catch(console.error);

// Then every 6 hours
cron.schedule("0 */6 * * *", () => run(20));
