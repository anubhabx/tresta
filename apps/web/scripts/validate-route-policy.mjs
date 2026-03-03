import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const projectRoot = path.resolve(import.meta.dirname, "..");
const policyPath = path.join(projectRoot, "config", "route-policy.json");

const policy = JSON.parse(fs.readFileSync(policyPath, "utf-8"));

const toRegExp = (pattern) => new RegExp(`^${pattern}$`);

const matchesAny = (patterns, route) =>
  patterns.some((pattern) => toRegExp(pattern).test(route));

assert.ok(
  Array.isArray(policy.publicRoutes),
  "route-policy.json: publicRoutes must be an array",
);
assert.ok(
  Array.isArray(policy.protectedRoutes),
  "route-policy.json: protectedRoutes must be an array",
);
assert.ok(
  Array.isArray(policy.authRoutes),
  "route-policy.json: authRoutes must be an array",
);

assert.ok(
  matchesAny(policy.publicRoutes, "/"),
  "Public policy must include root path '/'",
);
assert.ok(
  matchesAny(policy.publicRoutes, "/testimonials/demo"),
  "Public policy must include '/testimonials/*'",
);
assert.ok(
  !policy.publicRoutes.includes("/testimonial(.*)"),
  "Public policy must not include deprecated singular '/testimonial(.*)'",
);

assert.ok(
  matchesAny(policy.protectedRoutes, "/dashboard"),
  "Protected policy must include '/dashboard'",
);
assert.ok(
  matchesAny(policy.protectedRoutes, "/projects/demo"),
  "Protected policy must include '/projects/*'",
);

assert.ok(
  matchesAny(policy.authRoutes, "/sign-in"),
  "Auth policy must include '/sign-in'",
);
assert.ok(
  matchesAny(policy.authRoutes, "/sign-up"),
  "Auth policy must include '/sign-up'",
);

const testimonialsRouteFile = path.join(
  projectRoot,
  "app",
  "(standalone)",
  "testimonials",
  "[slug]",
  "page.tsx",
);

assert.ok(
  fs.existsSync(testimonialsRouteFile),
  "Expected testimonials route file to exist",
);

console.log("Route policy validation passed.");
