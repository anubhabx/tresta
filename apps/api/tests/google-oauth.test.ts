import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockVerifyIdToken,
  mockGetPayload,
  mockWarn,
  mockError,
  mockChild,
} = vi.hoisted(() => ({
  mockVerifyIdToken: vi.fn(),
  mockGetPayload: vi.fn(),
  mockWarn: vi.fn(),
  mockError: vi.fn(),
  mockChild: vi.fn(() => ({
    warn: mockWarn,
    error: mockError,
  })),
}));

vi.mock("google-auth-library", () => ({
  OAuth2Client: class OAuth2Client {
    verifyIdToken = mockVerifyIdToken;
  },
}));

vi.mock("../src/lib/logger.js", () => ({
  logger: {
    child: mockChild,
  },
}));

import { verifyGoogleIdToken } from "../src/lib/google-oauth.js";

describe("verifyGoogleIdToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns normalized payload when token is valid and email is verified", async () => {
    mockGetPayload.mockReturnValue({
      email: "user@example.com",
      name: "Test User",
      picture: "https://example.com/avatar.png",
      sub: "google_user_123",
      email_verified: true,
    });

    mockVerifyIdToken.mockResolvedValue({
      getPayload: mockGetPayload,
    });

    const result = await verifyGoogleIdToken("valid-token");

    expect(result).toEqual({
      email: "user@example.com",
      name: "Test User",
      picture: "https://example.com/avatar.png",
      sub: "google_user_123",
      email_verified: true,
    });
    expect(mockWarn).not.toHaveBeenCalled();
    expect(mockError).not.toHaveBeenCalled();
  });

  it("returns null when Google payload is missing", async () => {
    mockGetPayload.mockReturnValue(undefined);
    mockVerifyIdToken.mockResolvedValue({
      getPayload: mockGetPayload,
    });

    const result = await verifyGoogleIdToken("token-without-payload");

    expect(result).toBeNull();
    expect(mockWarn).not.toHaveBeenCalled();
    expect(mockError).not.toHaveBeenCalled();
  });

  it("returns null and warns when email is not verified", async () => {
    mockGetPayload.mockReturnValue({
      email: "user@example.com",
      name: "Test User",
      picture: "https://example.com/avatar.png",
      sub: "google_user_123",
      email_verified: false,
    });

    mockVerifyIdToken.mockResolvedValue({
      getPayload: mockGetPayload,
    });

    const result = await verifyGoogleIdToken("unverified-token");

    expect(result).toBeNull();
    expect(mockWarn).toHaveBeenCalledTimes(1);
    expect(mockError).not.toHaveBeenCalled();
  });

  it("returns null and logs error when token verification throws", async () => {
    const verificationError = new Error("token expired");
    mockVerifyIdToken.mockRejectedValue(verificationError);

    const result = await verifyGoogleIdToken("expired-token");

    expect(result).toBeNull();
    expect(mockError).toHaveBeenCalledTimes(1);
  });
});
