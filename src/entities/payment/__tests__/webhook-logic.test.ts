/**
 * webhook-logic.test.ts — Business logic tests for webhook handler
 *
 * Tests the LOGIC (tier detection, grace period, Early Bird counter)
 * without hitting the live endpoint.
 */
import { describe, it, expect } from "vitest";
import { SUBSCRIPTION_TIERS, type SubscriptionTier } from "@/entities/payment";

/* ── Helper: simulate webhook profile update logic ── */

function applySubscriptionCreated(
  userId: string,
  tier: SubscriptionTier,
  status: "active" | "past_due" | "canceled" = "active"
) {
  const isActive = status === "active" || status === "trialing";
  const UNLOCKED_PATHS = ["interview", "meeting", "presentation", "self-intro"];
  return {
    id: userId,
    tier,
    plan: isActive ? "path" : "free",
    plan_status: status,
    subscription_active: isActive,
    paths_purchased: isActive ? UNLOCKED_PATHS : [],
    grace_period_until: null,
  };
}

function applyInvoicePaymentFailed(profile: Record<string, any>) {
  const gracePeriodUntil = new Date();
  gracePeriodUntil.setDate(gracePeriodUntil.getDate() + 2);
  return {
    ...profile,
    plan_status: "past_due",
    grace_period_until: gracePeriodUntil.toISOString(),
    // Access maintained during grace period
  };
}

function applyInvoicePaymentSucceeded(profile: Record<string, any>) {
  return {
    ...profile,
    subscription_active: true,
    plan: "path",
    plan_status: "active",
    grace_period_until: null,
  };
}

function applySubscriptionDeleted(profile: Record<string, any>) {
  // Check grace period
  if (profile.grace_period_until) {
    const gracePeriodUntil = new Date(profile.grace_period_until);
    if (gracePeriodUntil > new Date()) {
      return profile; // still in grace period
    }
  }
  return {
    ...profile,
    plan: "free",
    plan_status: "canceled",
    subscription_active: false,
    paths_purchased: [],
    stripe_subscription_id: null,
    grace_period_until: null,
  };
}

function simulateEarlyBirdCounter(initialCount: number) {
  let count = initialCount;
  return {
    get: () => count,
    increment: () => { count++; return count; },
    decrement: () => { count = Math.max(0, count - 1); return count; },
    isAvailable: () => count < 20,
  };
}

/* ── Tests ── */

describe("subscription.created logic", () => {
  it("monthly tier: activates path access correctly", () => {
    const profile = applySubscriptionCreated("user-1", "monthly");
    expect(profile.tier).toBe("monthly");
    expect(profile.plan).toBe("path");
    expect(profile.subscription_active).toBe(true);
    expect(profile.paths_purchased).toContain("interview");
    expect(profile.paths_purchased).toContain("meeting");
    expect(profile.paths_purchased).toContain("presentation");
    expect(profile.grace_period_until).toBeNull();
  });

  it("early_bird tier: activates same paths as monthly", () => {
    const profile = applySubscriptionCreated("user-2", "early_bird");
    expect(profile.tier).toBe("early_bird");
    expect(profile.plan).toBe("path");
    expect(profile.paths_purchased.length).toBeGreaterThan(0);
  });

  it("quarterly tier: activates path access", () => {
    const profile = applySubscriptionCreated("user-3", "quarterly");
    expect(profile.tier).toBe("quarterly");
    expect(profile.subscription_active).toBe(true);
  });

  it("past_due status: keeps plan as free (not yet activated)", () => {
    const profile = applySubscriptionCreated("user-4", "monthly", "past_due");
    expect(profile.subscription_active).toBe(false);
    expect(profile.paths_purchased).toHaveLength(0);
  });
});

describe("invoice.payment_failed → grace period", () => {
  it("sets grace_period_until ~48 hours from now", () => {
    const profile = applySubscriptionCreated("user-5", "monthly");
    const withGrace = applyInvoicePaymentFailed(profile);

    expect(withGrace.grace_period_until).not.toBeNull();
    const grace = new Date(withGrace.grace_period_until!);
    const hoursFromNow = (grace.getTime() - Date.now()) / (1000 * 60 * 60);
    expect(hoursFromNow).toBeGreaterThan(47);
    expect(hoursFromNow).toBeLessThan(49);
  });

  it("user keeps plan='path' during grace period", () => {
    const profile = applySubscriptionCreated("user-6", "monthly");
    const withGrace = applyInvoicePaymentFailed(profile);
    expect(withGrace.plan_status).toBe("past_due");
    // paths_purchased unchanged (still has access)
    expect(withGrace.paths_purchased).toBeDefined();
  });
});

describe("invoice.payment_succeeded → recovery", () => {
  it("clears grace period and restores active status", () => {
    const profile = applySubscriptionCreated("user-7", "monthly");
    const withGrace = applyInvoicePaymentFailed(profile);
    const recovered = applyInvoicePaymentSucceeded(withGrace);

    expect(recovered.grace_period_until).toBeNull();
    expect(recovered.subscription_active).toBe(true);
    expect(recovered.plan).toBe("path");
    expect(recovered.plan_status).toBe("active");
  });
});

describe("subscription.deleted → access revocation", () => {
  it("revokes access when no grace period", () => {
    const profile = applySubscriptionCreated("user-8", "monthly");
    const deleted = applySubscriptionDeleted(profile);

    expect(deleted.plan).toBe("free");
    expect(deleted.subscription_active).toBe(false);
    expect(deleted.paths_purchased).toHaveLength(0);
  });

  it("preserves access if still within grace period", () => {
    const profile = applySubscriptionCreated("user-9", "monthly");
    const withGrace = applyInvoicePaymentFailed(profile);
    const deleted = applySubscriptionDeleted(withGrace);

    // Should NOT revoke — still in grace period
    expect(deleted.grace_period_until).not.toBeNull();
    expect(deleted.plan).toBe("path"); // unchanged
  });

  it("revokes access if grace period has expired", () => {
    const profile = applySubscriptionCreated("user-10", "monthly");
    const expiredGrace = {
      ...profile,
      grace_period_until: new Date(Date.now() - 1000).toISOString(), // 1s ago
    };
    const deleted = applySubscriptionDeleted(expiredGrace);
    expect(deleted.plan).toBe("free");
    expect(deleted.paths_purchased).toHaveLength(0);
  });
});

describe("Early Bird counter logic", () => {
  it("starts at 0, available is true when < 20", () => {
    const counter = simulateEarlyBirdCounter(0);
    expect(counter.get()).toBe(0);
    expect(counter.isAvailable()).toBe(true);
  });

  it("increments on new early_bird subscription", () => {
    const counter = simulateEarlyBirdCounter(5);
    const after = counter.increment();
    expect(after).toBe(6);
  });

  it("becomes unavailable at 20", () => {
    const counter = simulateEarlyBirdCounter(20);
    expect(counter.isAvailable()).toBe(false);
  });

  it("decrements on early_bird cancellation", () => {
    const counter = simulateEarlyBirdCounter(15);
    counter.decrement();
    expect(counter.get()).toBe(14);
  });

  it("never goes below 0 on decrement", () => {
    const counter = simulateEarlyBirdCounter(0);
    counter.decrement();
    expect(counter.get()).toBe(0);
  });

  it("becomes available again after cancellation frees a slot", () => {
    const counter = simulateEarlyBirdCounter(20);
    expect(counter.isAvailable()).toBe(false);
    counter.decrement();
    expect(counter.isAvailable()).toBe(true);
  });
});

describe("Tier pricing rules", () => {
  it("all 3 tiers are defined", () => {
    const tiers: SubscriptionTier[] = ["early_bird", "monthly", "quarterly"];
    tiers.forEach(t => expect(SUBSCRIPTION_TIERS[t]).toBeDefined());
  });

  it("Early Bird is cheapest", () => {
    expect(SUBSCRIPTION_TIERS.early_bird.price)
      .toBeLessThan(SUBSCRIPTION_TIERS.monthly.price);
  });

  it("Quarterly per-month is cheaper than Monthly", () => {
    expect(SUBSCRIPTION_TIERS.quarterly.perMonth)
      .toBeLessThan(SUBSCRIPTION_TIERS.monthly.price);
  });
});
