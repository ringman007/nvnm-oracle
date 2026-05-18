const { getExistingAccessions } = require("./db");

function getSearchDateRange() {
  const today = new Date();
  const dayOfWeek = today.getUTCDay(); // 0=Sun, 1=Mon, ...
  const endDate = today.toISOString().split("T")[0];

  // Look back to cover weekends/early mornings:
  // If Mon, look back to Fri (3 days). If Sun, 2 days. If Sat, 1 day. Otherwise, same day.
  let lookback = 0;
  if (dayOfWeek === 1) lookback = 3; // Monday → include Friday
  else if (dayOfWeek === 0) lookback = 2; // Sunday → include Friday
  else if (dayOfWeek === 6) lookback = 1; // Saturday → include Friday

  const startDate = new Date(today);
  startDate.setUTCDate(startDate.getUTCDate() - lookback);

  return { startDate: startDate.toISOString().split("T")[0], endDate };
}

async function fetchFilings(limit = 20) {
  const { startDate, endDate } = getSearchDateRange();
  const url = `https://efts.sec.gov/LATEST/search-index?q=%22%22&dateRange=custom&startdt=${startDate}&enddt=${endDate}&forms=D`;

  const res = await fetch(url, {
    headers: { "User-Agent": process.env.EDGAR_USER_AGENT },
  });

  if (!res.ok) {
    throw new Error(`EDGAR API returned ${res.status}: ${res.statusText}`);
  }

  const data = await res.json();
  const hits = data.hits?.hits || [];

  // Get already-processed accessions from DB
  const existing = await getExistingAccessions();
  const existingSet = new Set(existing);

  const filings = [];

  for (const hit of hits) {
    if (filings.length >= limit) break;

    const source = hit._source || {};
    // EDGAR API fields: adsh = accession number, ciks = array of CIKs,
    // display_names = array like ["Company Name (CIK 000123456)"]
    const adsh = source.adsh || "";
    const cik = source.ciks?.[0] || "";
    const displayName = source.display_names?.[0] || "Unknown";
    // Strip the "(CIK ...)" suffix from display name
    const companyName = displayName.replace(/\s*\(CIK\s+\d+\)\s*$/, "").trim();
    const accessionNumber = adsh;

    if (!accessionNumber || existingSet.has(accessionNumber)) continue;

    // Construct EDGAR document URL
    const accessionNoDashes = accessionNumber.replace(/-/g, "");
    const edgarUrl = `https://www.sec.gov/Archives/edgar/data/${cik}/${accessionNoDashes}/${accessionNumber}-index.htm`;

    filings.push({
      companyName,
      cik,
      accessionNumber,
      edgarUrl,
    });

    // Rate limit: 100ms between processing (SEC allows max 10/sec)
    await new Promise((r) => setTimeout(r, 100));
  }

  return filings;
}

module.exports = { fetchFilings };
