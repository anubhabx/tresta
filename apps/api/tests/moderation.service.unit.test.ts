import { beforeEach, describe, expect, it, vi } from "vitest";

import { prisma } from "@workspace/database/prisma";

vi.mock("@workspace/database/prisma", () => ({
  prisma: {
    testimonial: {
      count: vi.fn(),
    },
  },
}));

vi.mock("../src/services/ai-moderation.service.js", () => ({
  checkWithAI: vi.fn(async () => null),
  formatAIFlags: vi.fn(() => []),
}));

import {
  analyzeReviewerBehavior,
  checkDuplicateContent,
  moderateTestimonial,
} from "../src/services/moderation.service.js";
import { calculateQualityScore } from "../src/services/moderation-scoring.utils.js";

type MockedPrisma = typeof prisma & {
  testimonial: {
    count: ReturnType<typeof vi.fn>;
  };
};

const mockedPrisma = prisma as unknown as MockedPrisma;

describe("moderation service heuristics and scoring", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns pending with empty flags when moderation is disabled", async () => {
    const result = await moderateTestimonial(
      "Great product with a meaningful experience summary.",
      "user@example.com",
      5,
      true,
      {
        autoModeration: false,
        autoApproveVerified: true,
        profanityFilterLevel: "MODERATE",
      },
    );

    expect(result).toEqual({
      status: "PENDING",
      score: 0,
      flags: [],
      autoPublish: false,
    });
  });

  it("rejects content when spam heuristics exceed threshold", async () => {
    const result = await moderateTestimonial(
      "Visit http://spam-a.test and http://spam-b.test for instant rewards.",
      "user@example.com",
      2,
      false,
      {
        autoModeration: true,
        autoApproveVerified: false,
        profanityFilterLevel: "MODERATE",
        moderationSettings: {
          maxUrlCount: 0,
          allowedDomains: ["trusted.example"],
        },
      },
    );

    expect(result.status).toBe("REJECTED");
    expect(result.flags.some((flag) => flag.includes("URLs"))).toBe(true);
  });

  it("auto-approves verified high-quality submissions when configured", async () => {
    const result = await moderateTestimonial(
      "I used this every day for two months and it improved our handoff quality, reduced rework, and gave us clearer customer outcomes.",
      "verified@example.com",
      5,
      true,
      {
        autoModeration: true,
        autoApproveVerified: true,
        profanityFilterLevel: "MODERATE",
      },
    );

    expect(result.status).toBe("APPROVED");
    expect(result.autoPublish).toBe(true);
  });

  it("assigns lower quality scores to short low-signal content", () => {
    const highQualityScore = calculateQualityScore(
      "This platform helped us streamline collection and increase conversion across our onboarding funnel.",
      5,
      true,
    );
    const lowQualityScore = calculateQualityScore("bad", 1, false);

    expect(highQualityScore).toBeGreaterThan(lowQualityScore);
  });
});

describe("duplicate detection and reviewer behavior analysis", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("detects exact and high-similarity duplicate content", () => {
    const exact = checkDuplicateContent("Great Product", ["great product"]);
    const similar = checkDuplicateContent(
      "This product helped our team move faster and ship cleaner features",
      ["This product helped our team move faster and ship clean features"],
      0.85,
    );

    expect(exact.isDuplicate).toBe(true);
    expect(similar.isDuplicate).toBe(true);
  });

  it("returns null reviewer signals when no identity inputs are provided", async () => {
    const result = await analyzeReviewerBehavior("proj_1", {});

    expect(result).toBeNull();
    expect(mockedPrisma.testimonial.count).not.toHaveBeenCalled();
  });

  it("escalates to high risk when IP/email velocity is suspicious", async () => {
    mockedPrisma.testimonial.count
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(6);

    const result = await analyzeReviewerBehavior("proj_1", {
      ipAddress: "127.0.0.1",
      email: "repeat@example.com",
      timeframeHours: 24,
    });

    expect(result).not.toBeNull();
    expect(result?.riskLevel).toBe("high");
    expect(result?.suspiciousReasons.length).toBeGreaterThan(0);
  });
});
