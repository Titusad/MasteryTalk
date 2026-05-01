import { describe, it, expect } from "vitest";
import {
  SUBSCRIPTION_TIERS,
  PATH_PRODUCTS,
  type SubscriptionTier,
} from "@/entities/payment";

describe("SUBSCRIPTION_TIERS", () => {
  it("has monthly and quarterly tiers", () => {
    expect(SUBSCRIPTION_TIERS.monthly).toBeDefined();
    expect(SUBSCRIPTION_TIERS.quarterly).toBeDefined();
  });

  it("Monthly regular price is $19.99, early price is $12.99", () => {
    expect(SUBSCRIPTION_TIERS.monthly.regularPrice).toBe(19.99);
    expect(SUBSCRIPTION_TIERS.monthly.earlyPrice).toBe(12.99);
  });

  it("Quarterly regular price is $47.99, early price is $29.99", () => {
    expect(SUBSCRIPTION_TIERS.quarterly.regularPrice).toBe(47.99);
    expect(SUBSCRIPTION_TIERS.quarterly.earlyPrice).toBe(29.99);
    expect(SUBSCRIPTION_TIERS.quarterly.regularPerMonth).toBe(15.99);
    expect(SUBSCRIPTION_TIERS.quarterly.earlyPerMonth).toBe(9.99);
  });

  it("all tier IDs are valid SubscriptionTier values", () => {
    const validTiers: SubscriptionTier[] = ["early_bird", "monthly", "quarterly"];
    Object.keys(SUBSCRIPTION_TIERS).forEach((key) => {
      expect(validTiers).toContain(key);
    });
  });

  it("all tiers have required fields", () => {
    Object.values(SUBSCRIPTION_TIERS).forEach((tier) => {
      expect(tier.regularPrice).toBeTypeOf("number");
      expect(tier.regularPrice).toBeGreaterThan(0);
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

describe("Pricing business rules", () => {
  it("Monthly early price is less than regular price (≥35% off)", () => {
    const discount = 1 - SUBSCRIPTION_TIERS.monthly.earlyPrice / SUBSCRIPTION_TIERS.monthly.regularPrice;
    expect(discount).toBeGreaterThanOrEqual(0.35);
  });

  it("Quarterly early price is less than regular price (≥35% off)", () => {
    const discount = 1 - SUBSCRIPTION_TIERS.quarterly.earlyPrice / SUBSCRIPTION_TIERS.quarterly.regularPrice;
    expect(discount).toBeGreaterThanOrEqual(0.35);
  });

  it("Quarterly early per-month is less than Monthly early price", () => {
    expect(SUBSCRIPTION_TIERS.quarterly.earlyPerMonth).toBeLessThan(SUBSCRIPTION_TIERS.monthly.earlyPrice);
  });

  it("Quarterly regular per-month saves ~20% vs Monthly regular", () => {
    const savings = 1 - SUBSCRIPTION_TIERS.quarterly.regularPerMonth / SUBSCRIPTION_TIERS.monthly.regularPrice;
    expect(savings).toBeGreaterThanOrEqual(0.18);
  });
});
