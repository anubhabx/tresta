import { describe, expect, it, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";

import { requireUserId } from "../src/lib/auth.js";
import { requireAuth } from "../src/middleware/auth.middleware.js";
import { UnauthorizedError } from "../src/lib/errors.js";

describe("authentication helpers", () => {
  it("returns the authenticated user id when present", () => {
    const req = {
      user: { id: "user_123" },
    } as Request;

    expect(requireUserId(req)).toBe("user_123");
  });

  it("throws UnauthorizedError when user id is missing", () => {
    const req = {} as Request;

    expect(() => requireUserId(req)).toThrow(UnauthorizedError);
    expect(() => requireUserId(req)).toThrow("User not authenticated");
  });
});

describe("requireAuth middleware", () => {
  it("passes through when req.user is present", () => {
    const req = {
      user: { id: "user_123", email: "test@example.com" },
    } as Request;
    const res = {} as Response;
    const next = vi.fn<NextFunction>();

    requireAuth(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it("returns UnauthorizedError when req.user is absent", () => {
    const req = {} as Request;
    const res = {} as Response;
    const next = vi.fn<NextFunction>();

    requireAuth(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0]?.[0];
    expect(error).toBeInstanceOf(UnauthorizedError);
    expect(error.message).toBe("Authentication required");
  });
});
