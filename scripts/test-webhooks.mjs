/**
 * test-webhooks.mjs — Stripe webhook event simulation
 *
 * Sends mock Stripe events signed with real webhook secret,
 * then verifies KV store state via Supabase REST API.
 *
 * Run: STRIPE_WEBHOOK_SECRET=whsec_... node scripts/test-webhooks.mjs
 */

import { createHmac } from "crypto";

const BASE        = "https://zkuryztcwmazspscomiu.supabase.co/functions/v1/make-server-08b8658d";
const SUPABASE_URL = "https://zkuryztcwmazspscomiu.supabase.co";
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const ANON_KEY     = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprdXJ5enRjd21henNwc2NvbWl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1OTE1MTcsImV4cCI6MjA4ODE2NzUxN30.uuViGH3x5fQIHWh6FJvb1jYcehCOdEgLYAXzw-EdCx4";

// Test user ID — creates isolated KV entry for tests
const TEST_USER_ID = "test-payment-" + Date.now();

let passed = 0, failed = 0;

if (!WEBHOOK_SECRET) {
  console.error("❌ Missing STRIPE_WEBHOOK_SECRET env var");
  process.exit(1);
}
if (!SERVICE_KEY) {
  console.error("❌ Missing SUPABASE_SERVICE_KEY env var");
  process.exit(1);
}

function assert(condition, label, detail = "") {
  if (condition) { console.log(`  ✓ ${label}`); passed++; }
  else { console.error(`  ✗ ${label}${detail ? ` — got: ${JSON.stringify(detail)}` : ""}`); failed++; }
}

/* ── Sign a Stripe webhook event ── */
function signEvent(payload) {
  const timestamp = Math.floor(Date.now() / 1000);
  const body = typeof payload === "string" ? payload : JSON.stringify(payload);
  const signed = `${timestamp}.${body}`;
  const sig = createHmac("sha256", WEBHOOK_SECRET).update(signed).digest("hex");
  return { body, signature: `t=${timestamp},v1=${sig}` };
}

/* ── Send webhook event ── */
async function sendWebhook(event) {
  const { body, signature } = signEvent(event);
  const res = await fetch(`${BASE}/webhook/stripe`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "stripe-signature": signature, apikey: ANON_KEY },
    body,
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}

/* ── Read KV store profile ── */
async function getKVProfile(userId) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/kv_store_4e8a5b39?key=eq.profile%3A${userId}&select=value`,
    { headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY } }
  );
  const data = await res.json();
  return data[0]?.value || null;
}

/* ── Read Early Bird count ── */
async function getEarlyBirdCount() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/kv_store_4e8a5b39?key=eq.global%3Aearly_bird_count&select=value`,
    { headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY } }
  );
  const data = await res.json();
  return data[0]?.value ?? 0;
}

/* ── Stripe event factories ── */

function makeSubscriptionCreated(userId, tier, priceId) {
  return {
    id: `evt_test_${Date.now()}`,
    type: "customer.subscription.created",
    data: {
      object: {
        id: `sub_test_${Date.now()}`,
        status: "active",
        customer: `cus_test_${userId}`,
        metadata: { userId, tier },
        items: { data: [{ price: { id: priceId } }] },
        start_date: Math.floor(Date.now() / 1000),
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + 2592000,
      }
    }
  };
}

function makeInvoiceFailed(userId) {
  return {
    id: `evt_test_${Date.now()}`,
    type: "invoice.payment_failed",
    data: {
      object: {
        id: `in_test_${Date.now()}`,
        subscription_details: { metadata: { userId } },
        period_end: Math.floor(Date.now() / 1000) + 2592000,
      }
    }
  };
}

function makeInvoiceSucceeded(userId) {
  return {
    id: `evt_test_${Date.now()}`,
    type: "invoice.payment_succeeded",
    data: {
      object: {
        id: `in_test_${Date.now()}`,
        subscription_details: { metadata: { userId } },
        period_end: Math.floor(Date.now() / 1000) + 2592000,
      }
    }
  };
}

function makeSubscriptionDeleted(userId, tier) {
  return {
    id: `evt_test_${Date.now()}`,
    type: "customer.subscription.deleted",
    data: {
      object: {
        id: `sub_test_${Date.now()}`,
        metadata: { userId, tier },
        customer: `cus_test_${userId}`,
      }
    }
  };
}

// Price IDs from env or hardcoded test values
const PRICE_MONTHLY    = process.env.STRIPE_PRICE_MONTHLY    || "price_1TR1abQhSs1CWakEClg1lG0D";
const PRICE_EARLY_BIRD = process.env.STRIPE_PRICE_EARLY_BIRD || "price_1TR1YXQhSs1CWakEaoaqW0y7";

// ─────────────────────────────────────────────
console.log("\n🧪 SUITE 1 — subscription.created (monthly)\n");
// ─────────────────────────────────────────────
{
  const userId = `${TEST_USER_ID}-monthly`;
  const r = await sendWebhook(makeSubscriptionCreated(userId, "monthly", PRICE_MONTHLY));
  assert(r.status === 200, "Webhook returns 200");
  assert(r.body.status === "processed", "Status = processed");
  assert(r.body.tier === "monthly", "Tier detected as monthly");

  const profile = await getKVProfile(userId);
  assert(profile !== null, "KV profile created");
  assert(profile?.plan === "path", "plan = path");
  assert(profile?.tier === "monthly", "tier = monthly");
  assert(profile?.subscription_active === true, "subscription_active = true");
  assert(Array.isArray(profile?.paths_purchased) && profile.paths_purchased.length > 0, "paths_purchased populated");
  assert(profile?.grace_period_until === null, "No grace period");
}

// ─────────────────────────────────────────────
console.log("\n🧪 SUITE 2 — subscription.created (early_bird)\n");
// ─────────────────────────────────────────────
{
  const userId = `${TEST_USER_ID}-earlybird`;
  const countBefore = await getEarlyBirdCount();
  const r = await sendWebhook(makeSubscriptionCreated(userId, "early_bird", PRICE_EARLY_BIRD));
  assert(r.status === 200, "Webhook returns 200");
  assert(r.body.tier === "early_bird", "Tier detected as early_bird");

  const countAfter = await getEarlyBirdCount();
  assert(countAfter === countBefore + 1, `Early Bird counter incremented (${countBefore} → ${countAfter})`);

  const profile = await getKVProfile(userId);
  assert(profile?.tier === "early_bird", "tier = early_bird in KV");
}

// ─────────────────────────────────────────────
console.log("\n🧪 SUITE 3 — invoice.payment_failed → grace period\n");
// ─────────────────────────────────────────────
{
  const userId = `${TEST_USER_ID}-grace`;
  // First activate subscription
  await sendWebhook(makeSubscriptionCreated(userId, "monthly", PRICE_MONTHLY));

  // Then simulate failed payment
  const r = await sendWebhook(makeInvoiceFailed(userId));
  assert(r.status === 200, "Webhook returns 200");

  const profile = await getKVProfile(userId);
  assert(profile?.grace_period_until !== null, "grace_period_until is set");
  assert(profile?.subscription_active === true, "User keeps access during grace period");
  assert(profile?.plan === "path", "plan stays 'path' during grace period");

  // Verify grace period is ~2 days from now
  const grace = new Date(profile?.grace_period_until);
  const diff = (grace - new Date()) / (1000 * 60 * 60); // hours
  assert(diff > 47 && diff < 49, `Grace period is ~48 hours (got ${diff.toFixed(1)}h)`);
}

// ─────────────────────────────────────────────
console.log("\n🧪 SUITE 4 — invoice.payment_succeeded → clears grace period\n");
// ─────────────────────────────────────────────
{
  const userId = `${TEST_USER_ID}-recover`;
  await sendWebhook(makeSubscriptionCreated(userId, "monthly", PRICE_MONTHLY));
  await sendWebhook(makeInvoiceFailed(userId)); // set grace period

  const r = await sendWebhook(makeInvoiceSucceeded(userId));
  assert(r.status === 200, "Webhook returns 200");

  const profile = await getKVProfile(userId);
  assert(profile?.grace_period_until === null, "Grace period cleared after payment success");
  assert(profile?.subscription_active === true, "Access restored");
  assert(profile?.paths_purchased?.length > 0, "Paths still unlocked");
}

// ─────────────────────────────────────────────
console.log("\n🧪 SUITE 5 — subscription.deleted → revoke access\n");
// ─────────────────────────────────────────────
{
  const userId = `${TEST_USER_ID}-cancel`;
  await sendWebhook(makeSubscriptionCreated(userId, "monthly", PRICE_MONTHLY));

  const r = await sendWebhook(makeSubscriptionDeleted(userId, "monthly"));
  assert(r.status === 200, "Webhook returns 200");

  const profile = await getKVProfile(userId);
  assert(profile?.plan === "free", "plan downgraded to free");
  assert(profile?.subscription_active === false, "subscription_active = false");
  assert(profile?.paths_purchased?.length === 0, "paths_purchased cleared");
}

// ─────────────────────────────────────────────
console.log("\n🧪 SUITE 6 — Early Bird decrement on cancellation\n");
// ─────────────────────────────────────────────
{
  const userId = `${TEST_USER_ID}-eb-cancel`;
  const countBefore = await getEarlyBirdCount();
  await sendWebhook(makeSubscriptionCreated(userId, "early_bird", PRICE_EARLY_BIRD));

  const countMid = await getEarlyBirdCount();
  assert(countMid === countBefore + 1, "Counter incremented on subscribe");

  await sendWebhook(makeSubscriptionDeleted(userId, "early_bird"));
  const countAfter = await getEarlyBirdCount();
  assert(countAfter === countBefore, `Counter decremented on cancel (${countMid} → ${countAfter})`);
}

// ─────────────────────────────────────────────
console.log("\n📊 RESULTS\n");
// ─────────────────────────────────────────────
const total = passed + failed;
console.log(`  Passed: ${passed}/${total}`);
console.log(`  Failed: ${failed}/${total}`);
if (failed > 0) process.exit(1);
