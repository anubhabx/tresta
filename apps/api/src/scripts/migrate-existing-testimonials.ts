import { prisma } from "@workspace/database/prisma";
import { logger } from '../lib/logger.js';
import { moderateTestimonial } from '../services/moderation.service.js';

const migrateTestimonialsLogger = logger.child({ module: 'script-migrate-existing-testimonials' });

/**
 * Migration script to auto-moderate all existing testimonials
 * Run this once to apply moderation rules to testimonials created before auto-moderation was implemented
 */
async function migrateExistingTestimonials() {
  migrateTestimonialsLogger.info('Starting migration of existing testimonials');

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

    migrateTestimonialsLogger.info({ count: testimonials.length }, 'Found testimonials to moderate');

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
              migrateTestimonialsLogger.info(
                { testimonialId: testimonial.id },
                'Skipping testimonial with no project',
              );
              return;
            }

            // Skip if project doesn't have auto-moderation enabled
            if (!testimonial.Project.autoModeration) {
              migrateTestimonialsLogger.info(
                { testimonialId: testimonial.id },
                'Skipping testimonial with auto-moderation disabled',
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

            migrateTestimonialsLogger.info(
              {
                testimonialId: testimonial.id,
                status: result.status,
                score: result.score,
              },
              'Processed testimonial moderation',
            );
          } catch (error) {
            migrateTestimonialsLogger.error(
              { testimonialId: testimonial.id, error },
              'Error processing testimonial during migration',
            );
          }
        }),
      );

      migrateTestimonialsLogger.info({ batchNumber: Math.floor(i / BATCH_SIZE) + 1 }, 'Migration batch complete');
    }

    migrateTestimonialsLogger.info(
      { processed, approved, flagged, rejected },
      'Migration complete',
    );
  } catch (error) {
    migrateTestimonialsLogger.error({ error }, 'Migration failed');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateExistingTestimonials();
