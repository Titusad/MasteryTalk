/**
 * diagnose-subscription.mjs
 * Checks the KV profile for a user and force-activates subscription if missing.
 *
 * Usage:
 *   node scripts/diagnose-subscription.mjs <email>
 *   node scripts/diagnose-subscription.mjs <email> --fix
 */

const SUPABASE_URL = "https://zkuryztcwmazspscomiu.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprdXJ5enRjd21henNwc2NvbWl1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjU5MTUxNywiZXhwIjoyMDg4MTY3NTE3fQ.iCDc8VMDK5wphVWjtvw0t6BSRtvmpikcDRBJwNUuqPc";

const email = process.argv[2];
const fix = process.argv.includes("--fix");

if (!email) {
  console.error("Usage: node scripts/diagnose-subscription.mjs <email> [--fix]");
  process.exit(1);
}

// 1. Find user by email via Supabase Auth Admin API
console.log(`\n🔍 Looking up user: ${email}`);
const usersRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(email)}`, {
  headers: {
    "apikey": SERVICE_KEY,
    "Authorization": `Bearer ${SERVICE_KEY}`,
  },
});

if (!usersRes.ok) {
  console.error("❌ Failed to fetch user:", await usersRes.text());
  process.exit(1);
}

const usersData = await usersRes.json();
const user = usersData.users?.[0];

if (!user) {
  console.error(`❌ No user found with email: ${email}`);
  process.exit(1);
}

console.log(`✅ Found user: ${user.id} (${user.email})`);

// 2. Read KV profile
console.log(`\n🔍 Reading KV profile: profile:${user.id}`);
const kvRes = await fetch(`${SUPABASE_URL}/rest/v1/kv_store_4e8a5b39?key=eq.profile%3A${user.id}&select=key,value`, {
  headers: {
    "apikey": SERVICE_KEY,
    "Authorization": `Bearer ${SERVICE_KEY}`,
  },
});

const kvRows = await kvRes.json();
const profileRow = kvRows?.[0];

if (!profileRow) {
  console.log("⚠️  No KV profile found for this user (never logged in or no profile created)");
} else {
  const profile = typeof profileRow.value === "string"
    ? JSON.parse(profileRow.value)
    : profileRow.value;

  console.log("\n📋 Current profile:");
  console.log(`   plan:                ${profile.plan}`);
  console.log(`   plan_status:         ${profile.plan_status}`);
  console.log(`   subscription_active: ${profile.subscription_active}`);
  console.log(`   tier:                ${profile.tier}`);
  console.log(`   paths_purchased:     ${JSON.stringify(profile.paths_purchased)}`);

  if (profile.subscription_active) {
    console.log("\n✅ subscription_active = true — webhook ran correctly.");
    console.log("   The problem is in the progression endpoint unlock logic.");
    console.log("   Check the Supabase function logs for [Progression GET] errors.");
    process.exit(0);
  } else {
    console.log("\n❌ subscription_active = false — the webhook did NOT update this profile.");
  }
}

if (!fix) {
  console.log("\n👉 Run with --fix to force-activate the subscription:");
  console.log(`   node scripts/diagnose-subscription.mjs ${email} --fix`);
  process.exit(0);
}

// 3. Force-activate subscription
console.log("\n🔧 Forcing subscription activation...");

const UNLOCKED_PATHS = ["interview", "meeting", "presentation", "self-intro"];

const currentProfile = profileRow
  ? (typeof profileRow.value === "string" ? JSON.parse(profileRow.value) : profileRow.value)
  : { id: user.id, plan: "free", plan_status: "active", tier: null, free_sessions_used: [], paths_purchased: [], monthly_sessions_used: 0, stats: {}, created_at: new Date().toISOString() };

const updatedProfile = {
  ...currentProfile,
  plan: "path",
  plan_status: "active",
  subscription_active: true,
  tier: currentProfile.tier || "monthly",
  paths_purchased: UNLOCKED_PATHS,
  grace_period_until: null,
};

// Upsert into KV store
const upsertRes = await fetch(`${SUPABASE_URL}/rest/v1/kv_store_4e8a5b39`, {
  method: "POST",
  headers: {
    "apikey": SERVICE_KEY,
    "Authorization": `Bearer ${SERVICE_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates",
  },
  body: JSON.stringify({
    key: `profile:${user.id}`,
    value: updatedProfile,
  }),
});

if (!upsertRes.ok) {
  console.error("❌ Failed to update KV profile:", await upsertRes.text());
  process.exit(1);
}

console.log("✅ KV profile updated:");
console.log(`   subscription_active: true`);
console.log(`   plan: path`);
console.log(`   tier: ${updatedProfile.tier}`);
console.log(`   paths_purchased: ${JSON.stringify(UNLOCKED_PATHS)}`);
console.log("\n✅ Done. Ask the user to refresh the dashboard — paths should now be unlocked.");
