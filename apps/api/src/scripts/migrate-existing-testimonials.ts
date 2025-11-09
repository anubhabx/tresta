import { prisma } from "@workspace/database/prisma";
import { moderateTestimonial } from "../services/moderation.service.ts";

/**
 * Migration script to auto-moderate all existing testimonials
 * Run this once to apply moderation rules to testimonials created before auto-moderation was implemented
 */
async function migrateExistingTestimonials() {
  console.log("🔍 Starting migration of existing testimonials...");

  try {
    // Get all testimonials that haven't been moderated yet (moderationStatus = PENDING)
    const testimonials = await prisma.testimonial.findMany({
      where: {
        moderationStatus: "PENDING",
      },
      include: {
        Project: {
          select: {
            id: true,
            autoModeration: true,
            autoApproveVerified: true,
            profanityFilterLevel: true,
            moderationSettings: true,
          },
        },
      },
    });

    console.log(`📊 Found ${testimonials.length} testimonials to moderate`);

    let processed = 0;
    let approved = 0;
    let flagged = 0;
    let rejected = 0;

    // Process in batches to avoid overwhelming the database
    const BATCH_SIZE = 50;
    for (let i = 0; i < testimonials.length; i += BATCH_SIZE) {
      const batch = testimonials.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (testimonial) => {
          try {
            // Skip if project doesn't exist
            if (!testimonial.Project) {
              console.log(
                `⏭️  Skipping testimonial ${testimonial.id} (no project)`,
              );
              return;
            }

            // Skip if project doesn't have auto-moderation enabled
            if (!testimonial.Project.autoModeration) {
              console.log(
                `⏭️  Skipping testimonial ${testimonial.id} (auto-moderation disabled)`,
              );
              return;
            }

            // Run moderation
            const result = await moderateTestimonial(
              testimonial.content,
              testimonial.authorEmail || undefined,
              testimonial.rating || undefined,
              testimonial.isOAuthVerified,
              {
                autoModeration: testimonial.Project.autoModeration,
                autoApproveVerified:
                  testimonial.Project.autoApproveVerified || false,
                profanityFilterLevel:
                  (testimonial.Project.profanityFilterLevel as
                    | "STRICT"
                    | "MODERATE"
                    | "LENIENT") || "MODERATE",
                moderationSettings:
                  (testimonial.Project.moderationSettings as any) || {},
              },
            );

            // Update testimonial with moderation results
            await prisma.testimonial.update({
              where: { id: testimonial.id },
              data: {
                moderationStatus: result.status,
                moderationScore: result.score,
                moderationFlags: result.flags,
                autoPublished: result.status === "APPROVED",
              },
            });

            processed++;
            if (result.status === "APPROVED") approved++;
            else if (result.status === "FLAGGED") flagged++;
            else if (result.status === "REJECTED") rejected++;

            console.log(
              `✅ Processed ${testimonial.id}: ${result.status} (score: ${result.score.toFixed(2)})`,
            );
          } catch (error) {
            console.error(
              `❌ Error processing testimonial ${testimonial.id}:`,
              error,
            );
          }
        }),
      );

      console.log(`📦 Batch ${Math.floor(i / BATCH_SIZE) + 1} complete`);
    }

    console.log("\n🎉 Migration complete!");
    console.log(`📊 Results:
    - Processed: ${processed}
    - Approved: ${approved}
    - Flagged: ${flagged}
    - Rejected: ${rejected}
    `);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateExistingTestimonials();
