const crypto = require("crypto");

async function hashDocument(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": process.env.EDGAR_USER_AGENT },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch document: ${res.status} ${res.statusText}`);
  }

  const buffer = await res.arrayBuffer();
  const bytes = Buffer.from(buffer);
  return "0x" + crypto.createHash("sha256").update(bytes).digest("hex");
}

module.exports = { hashDocument };
