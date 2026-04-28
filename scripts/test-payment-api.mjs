/**
 * test-payment-api.mjs — API-level payment tests
 *
 * Tests all payment endpoints without a real browser or Stripe card.
 * Run: node scripts/test-payment-api.mjs
 */

const BASE = "https://zkuryztcwmazspscomiu.supabase.co/functions/v1/make-server-08b8658d";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprdXJ5enRjd21henNwc2NvbWl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1OTE1MTcsImV4cCI6MjA4ODE2NzUxN30.uuViGH3x5fQIHWh6FJvb1jYcehCOdEgLYAXzw-EdCx4";

let passed = 0, failed = 0;

function assert(condition, label, detail = "") {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
    failed++;
  }
}

async function get(path) {
  return fetch(`${BASE}${path}`, { headers: { apikey: ANON_KEY } }).then(r => ({
    status: r.status, body: r.json().catch(() => ({}))
  })).then(async r => ({ status: r.status, body: await r.body }));
}

async function post(path, body, authToken = null) {
  const headers = { "Content-Type": "application/json", apikey: ANON_KEY };
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
  return fetch(`${BASE}${path}`, { method: "POST", headers, body: JSON.stringify(body) })
    .then(async r => ({ status: r.status, body: await r.json().catch(() => ({})) }));
}

// ─────────────────────────────────────────────
console.log("\n🧪 SUITE 1 — /pricing endpoint (public)\n");
// ─────────────────────────────────────────────
{
  const { status, body } = await get("/pricing");
  assert(status === 200, "Returns 200");
  assert(body.earlyBird !== undefined, "earlyBird field exists");
  assert(body.monthly !== undefined, "monthly field exists");
  assert(body.quarterly !== undefined, "quarterly field exists");
  assert(typeof body.earlyBird.slotsUsed === "number", "earlyBird.slotsUsed is a number");
  assert(body.earlyBird.maxSlots === 20, "earlyBird.maxSlots === 20");
  assert(typeof body.earlyBird.available === "boolean", "earlyBird.available is boolean");
  assert(body.monthly.price === 16.99, "monthly price = $16.99");
  assert(body.quarterly.price === 39.99, "quarterly price = $39.99");
  assert(body.earlyBird.price === 9.99, "earlyBird price = $9.99");
  console.log(`     ↳ Early Bird slots: ${body.earlyBird.slotsUsed}/${body.earlyBird.maxSlots} used`);
}

// ─────────────────────────────────────────────
console.log("\n🧪 SUITE 2 — /create-checkout auth guard\n");
// ─────────────────────────────────────────────
{
  // No auth token → should reject
  const { status, body } = await post("/create-checkout", { tier: "monthly" });
  assert(status === 401, "Rejects request without auth token (401)");
  assert(body.error?.includes("Unauthorized"), "Returns Unauthorized message");
}

// ─────────────────────────────────────────────
console.log("\n🧪 SUITE 3 — /webhook/stripe signature guard\n");
// ─────────────────────────────────────────────
{
  // No signature → 400
  const r1 = await post("/webhook/stripe", { type: "test" });
  assert(r1.status === 400, "Rejects webhook without signature (400)");

  // Fake signature → 401
  const r2 = await fetch(`${BASE}/webhook/stripe`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "stripe-signature": "fake_sig", apikey: ANON_KEY },
    body: JSON.stringify({ type: "test.event" }),
  }).then(async r => ({ status: r.status, body: await r.json().catch(() => ({})) }));
  assert(r2.status === 401, "Rejects webhook with invalid signature (401)");
}

// ─────────────────────────────────────────────
console.log("\n🧪 SUITE 4 — /health endpoint\n");
// ─────────────────────────────────────────────
{
  const r = await get("/health");
  assert(r.status === 200, "Health check returns 200");
}

// ─────────────────────────────────────────────
console.log("\n📊 RESULTS\n");
// ─────────────────────────────────────────────
const total = passed + failed;
console.log(`  Passed: ${passed}/${total}`);
console.log(`  Failed: ${failed}/${total}`);
if (failed > 0) process.exit(1);
