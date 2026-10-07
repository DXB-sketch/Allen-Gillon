const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: JSON_HEADERS });
}

function clean(value, maxLength) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, maxLength) : "";
}

async function database() {
  const cloudflareRuntime = "cloudflare:workers";
  const { env } = await import(/* @vite-ignore */ /* webpackIgnore: true */ cloudflareRuntime);
  if (!env.REVIEWS_DB) throw new Error("REVIEWS_DB is not configured");
  return env.REVIEWS_DB;
}

export async function GET() {
  try {
    const reviewsDb = await database();
    const result = await reviewsDb
      .prepare(
        // Reviews publish as soon as they are sent. Anything still marked
        // 'pending' from before that change shows too; only 'rejected'
        // (hidden by hand, see CLOUDFLARE.md) stays off the page.
        `SELECT id, name, place, body, approved_at
         FROM reviews
         WHERE status IN ('approved', 'pending')
         ORDER BY COALESCE(approved_at, created_at) DESC, created_at DESC
         LIMIT 100`,
      )
      .all();

    return json({ reviews: result.results ?? [] });
  } catch (error) {
    console.error("Unable to load reviews", error);
    return json({ reviews: [], error: "Reviews are temporarily unavailable." }, 503);
  }
}

export async function POST(request) {
  let input;
  try {
    input = await request.json();
  } catch {
    return json({ error: "Please check the form and try again." }, 400);
  }

  // A quiet honeypot catches basic form bots without making visitors solve a puzzle.
  if (clean(input.website, 200)) {
    return json({ ok: true, message: "Thanks. Your review is now on the page." }, 202);
  }

  const name = clean(input.name, 80);
  const place = clean(input.place, 120);
  const body = clean(input.review, 1200);
  const startedAt = Number(input.startedAt);
  const elapsed = Date.now() - startedAt;

  if (!name || body.length < 10) {
    return json({ error: "Please add your name and a review of at least 10 characters." }, 400);
  }

  if (!Number.isFinite(startedAt) || elapsed < 2500 || elapsed > 24 * 60 * 60 * 1000) {
    return json({ error: "Please refresh the page and try again." }, 400);
  }

  try {
    const reviewsDb = await database();
    const id = crypto.randomUUID();
    await reviewsDb
      .prepare(
        `INSERT INTO reviews (id, name, place, body, status, approved_at)
         VALUES (?, ?, ?, ?, 'approved', CURRENT_TIMESTAMP)`,
      )
      .bind(id, name, place, body)
      .run();

    return json(
      { ok: true, message: "Thanks. Your review is now on the page.", review: { id, name, place, body } },
      201,
    );
  } catch (error) {
    console.error("Unable to save review", error);
    return json({ error: "Your review could not be saved just now. Please try again shortly." }, 503);
  }
}
