export async function POST() {
  const triggerUrl = process.env.AGENT_TRIGGER_URL;
  const triggerSecret = process.env.AGENT_TRIGGER_SECRET;

  if (!triggerUrl) {
    return Response.json(
      { error: "AGENT_TRIGGER_URL not configured" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(triggerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-trigger-secret": triggerSecret || "",
      },
      body: JSON.stringify({ limit: 5 }),
    });

    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    return Response.json(
      { error: `Failed to trigger agent: ${err.message}` },
      { status: 502 }
    );
  }
}
