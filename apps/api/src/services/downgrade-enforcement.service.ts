import { prisma } from "@workspace/database/prisma";
import { PLAN_LIMITS, FALLBACK_PLAN_LIMITS } from "../config/constants.js";

export const enforceDowngradeLimits = async () => {
  const freeProjectLimit =
    PLAN_LIMITS.FREE.projects ?? FALLBACK_PLAN_LIMITS.projects;

  // Since we don't have a direct raw query for "having count > N" right now,
  // we can fetch FREE users who have any active projects, and filter in app.
  // In a large scale app, we'd use a grouped query.
  const users = await prisma.user.findMany({
    where: {
      plan: "FREE",
      projects: {
        some: { isActive: true },
      },
    },
    include: {
      projects: {
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
      },
      subscription: true,
    },
  });

  let usersProcessed = 0;
  let deactivatedProjectsCount = 0;

  for (const user of users) {
    if (user.projects.length <= freeProjectLimit) {
      continue;
    }

    // Check grace period (7 days after the end of the last billing period of a canceled subscription)
    const sub = user.subscription;
    let gracePeriodOver = true;

    if (sub && sub.status === "CANCELED" && sub.currentPeriodEnd) {
      const gracePeriodEnd = new Date(
        sub.currentPeriodEnd.getTime() + 7 * 24 * 60 * 60 * 1000,
      );
      if (new Date() < gracePeriodEnd) {
        gracePeriodOver = false;
      }
    }

    if (gracePeriodOver) {
      usersProcessed++;
      // Deactivate excess projects. Since we ordered by createdAt asc,
      // the first `freeProjectLimit` projects are the oldest ones.
      // We will slice from `freeProjectLimit` to get the newer ones to deactivate.
      const projectsToDeactivate = user.projects.slice(freeProjectLimit);

      for (const p of projectsToDeactivate) {
        await prisma.project.update({
          where: { id: p.id },
          data: { isActive: false },
        });
        deactivatedProjectsCount++;
      }
    }
  }

  return { usersProcessed, deactivatedProjectsCount };
};
