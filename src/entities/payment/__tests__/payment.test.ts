import { describe, it, expect } from "vitest";
import {
  SUBSCRIPTION_TIERS,
  PATH_PRODUCTS,
  type SubscriptionTier,
} from "@/entities/payment";

describe("SUBSCRIPTION_TIERS", () => {
  it("has all 3 tiers", () => {
    expect(SUBSCRIPTION_TIERS.early_bird).toBeDefined();
    expect(SUBSCRIPTION_TIERS.monthly).toBeDefined();
    expect(SUBSCRIPTION_TIERS.quarterly).toBeDefined();
  });

  it("Early Bird costs $9.99 and has maxSlots 20", () => {
    expect(SUBSCRIPTION_TIERS.early_bird.price).toBe(9.99);
    expect(SUBSCRIPTION_TIERS.early_bird.maxSlots).toBe(20);
  });

  it("Monthly costs $16.99", () => {
    expect(SUBSCRIPTION_TIERS.monthly.price).toBe(16.99);
  });

  it("Quarterly costs $39.99 (~$13.33/mo)", () => {
    expect(SUBSCRIPTION_TIERS.quarterly.price).toBe(39.99);
    expect(SUBSCRIPTION_TIERS.quarterly.perMonth).toBe(13.33);
    // Verify savings vs monthly
    const quarterly = SUBSCRIPTION_TIERS.quarterly.price;
    const monthly3 = SUBSCRIPTION_TIERS.monthly.price * 3;
    const savings = Math.round((1 - quarterly / monthly3) * 100);
    expect(savings).toBeGreaterThanOrEqual(20); // at least 20% savings vs monthly
  });

  it("all tier IDs are valid SubscriptionTier values", () => {
    const validTiers: SubscriptionTier[] = ["early_bird", "monthly", "quarterly"];
    Object.keys(SUBSCRIPTION_TIERS).forEach((key) => {
      expect(validTiers).toContain(key);
    });
  });

  it("all tiers have required fields", () => {
    Object.values(SUBSCRIPTION_TIERS).forEach((tier) => {
      expect(tier.price).toBeTypeOf("number");
      expect(tier.price).toBeGreaterThan(0);
      expect(tier.label).toBeTypeOf("string");
      expect(tier.label.length).toBeGreaterThan(0);
    });
  });
});

describe("PATH_PRODUCTS (legacy)", () => {
  it("still exports for backward compat", () => {
    expect(PATH_PRODUCTS.first_path).toBeDefined();
    expect(PATH_PRODUCTS.path).toBeDefined();
  });
});

describe("Early Bird business rules", () => {
  it("Early Bird price is cheaper than Monthly", () => {
    expect(SUBSCRIPTION_TIERS.early_bird.price).toBeLessThan(SUBSCRIPTION_TIERS.monthly.price);
  });

  it("Quarterly per-month is cheaper than Monthly", () => {
    expect(SUBSCRIPTION_TIERS.quarterly.perMonth).toBeLessThan(SUBSCRIPTION_TIERS.monthly.price);
  });

  it("Quarterly per-month is more expensive than Early Bird", () => {
    expect(SUBSCRIPTION_TIERS.quarterly.perMonth!).toBeGreaterThan(SUBSCRIPTION_TIERS.early_bird.price);
  });

  it("Early Bird max slots is 20", () => {
    expect(SUBSCRIPTION_TIERS.early_bird.maxSlots).toBe(20);
  });
});
