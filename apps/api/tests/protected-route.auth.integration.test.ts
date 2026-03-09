import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import type { AddressInfo } from "net";

import { UnauthorizedError } from "../src/lib/errors.js";

const { mockGetAuth, mockGetCachedUser } = vi.hoisted(() => ({
  mockGetAuth: vi.fn(),
  mockGetCachedUser: vi.fn(),
}));

vi.mock("@clerk/express", () => ({
  getAuth: mockGetAuth,
}));

vi.mock("../src/lib/clerk-cache.js", () => ({
  getCachedUser: mockGetCachedUser,
}));

import { attachUser, requireAuth } from "../src/middleware/auth.middleware.js";

function createProtectedApp() {
  const app = express();

  app.get("/protected", attachUser, requireAuth, (req, res) => {
    res.status(200).json({
      success: true,
      userId: req.user?.id,
    });
  });

  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (error instanceof UnauthorizedError) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal test error",
    });
  });

  return app;
}

async function executeProtectedRequest() {
  const app = createProtectedApp();
  const server = app.listen(0);

  const address = server.address() as AddressInfo;
  const response = await fetch(`http://127.0.0.1:${address.port}/protected`);
  const payload = await response.json();

  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });

  return {
    status: response.status,
    payload,
  };
}

describe("protected route auth integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("allows access with a valid authenticated session", async () => {
    mockGetAuth.mockReturnValue({ userId: "user_valid" });
    mockGetCachedUser.mockResolvedValue({
      id: "user_valid",
      emailAddresses: [{ emailAddress: "valid@example.com" }],
    });

    const { status, payload } = await executeProtectedRequest();

    expect(status).toBe(200);
    expect(payload).toEqual({
      success: true,
      userId: "user_valid",
    });
  });

  it("rejects access when auth context has no user id", async () => {
    mockGetAuth.mockReturnValue({ userId: null });

    const { status, payload } = await executeProtectedRequest();

    expect(status).toBe(401);
    expect(payload).toMatchObject({
      success: false,
      message: "Authentication required",
    });
  });

  it("rejects access for an expired or invalid Clerk session", async () => {
    mockGetAuth.mockReturnValue({ userId: "user_expired" });
    mockGetCachedUser.mockResolvedValue(null);

    const { status, payload } = await executeProtectedRequest();

    expect(status).toBe(401);
    expect(payload).toMatchObject({
      success: false,
      message: "Unauthorized",
    });
  });
});
